/* global Opal */
import {defineMessages} from 'react-intl';
import _ from 'lodash';
import log from '../log';
import Blockly from 'scratch-blocks';
import RubyParser from '../ruby-parser';
// eslint-disable-next-line import/no-unresolved
import Variable from 'scratch-vm/src/engine/variable';

import Primitive from './primitive';
import {RubyToBlocksConverterError} from './errors';

import MotionConverter from './motion';
import LooksConverter from './looks';
import SoundConverter from './sound';
import EventConverter from './event';
import ControlConverter from './control';
import SensingConverter from './sensing';
import OperatorsConverter from './operators';
import VariablesConverter from './variables';
import MyBlocksConverter from './my-blocks';
import MusicConverter from './music';
import PenConverter from './pen';
import MicroBitConverter from './microbit';
import MicrobitMoreConverter from './microbit_more';
import EV3Converter from './ev3';
import Wedo2Converter from './wedo2';
import GdxForConverter from './gdx_for';
import MeshConverter from './mesh';
import SmalrubotS1Converter from './smalrubot_s1';
import BoostConverter from './boost';
import TranslateConverter from './translate';
import MakeyMakeyConverter from './makeymakey';
import VideoConverter from './video';
import Text2SpeechConverter from './text2speech';
import KoshienConverter from './koshien';

const messages = defineMessages({
    couldNotConvertPrimitive: {
        defaultMessage: '"{ SOURCE }" could not be converted the block.',
        description: 'Error message for converting ruby to block when find the primitive',
        id: 'gui.smalruby3.rubyToBlocksConverter.couldNotConvertPrimitive'
    },
    wrongInstruction: {
        defaultMessage: '"{ SOURCE }" is the wrong instruction.',
        description: 'Error message for converting ruby to block when find the wrong instruction',
        id: 'gui.smalruby3.rubyToBlocksConverter.wrongInstruction'
    },
    cannotChangeVariableScope: {
        defaultMessage: '"{ VARIABLE }", can\'t change variable scope',
        description: 'Error message when trying to change variable scope from global to instance or vice versa',
        id: 'gui.smalruby3.rubyToBlocksConverter.cannotChangeVariableScope'
    }
});

/* eslint-disable no-invalid-this */
const ColorRegexp = /^#[0-9a-fA-F]{6}$/;

// from scratch-vm/src/serialization/sb3.js
const CORE_EXTENSIONS = [
    'argument',
    'colour',
    'control',
    'data',
    'event',
    'looks',
    'math',
    'motion',
    'operator',
    'procedures',
    'sensing',
    'sound'
];

// from scratch-vm/src/serialization/sb3.js
const getExtensionIdForOpcode = function (opcode) {
    const index = opcode.indexOf('_');
    const prefix = opcode.substring(0, index);
    if (CORE_EXTENSIONS.indexOf(prefix) === -1) {
        if (prefix !== '') return prefix;
    }
    return null;
};

/**
 * Class for a block converter that translates ruby code into the blocks.
 */
class RubyToBlocksConverter {
    constructor (vm) {
        this.vm = vm;
        this._translator = message => message.defaultMessage;
        this._receiverToMethods = {};
        this._receiverToMyBlocks = {};
        this._onIfHandlers = [];
        this._onUntilHandlers = [];
        this._onOpAsgnHandlers = [];
        this._onAndHandlers = [];
        this._onOrHandlers = [];
        this._onVarHandlers = [];
        this._onVasgnHandlers = [];
        this._onDefsHandlers = [];
        this.reset();

        [
            VariablesConverter,
            EventConverter,
            ControlConverter,
            MicroBitConverter,
            VideoConverter,
            Text2SpeechConverter,
            Wedo2Converter,
            MicrobitMoreConverter,
            MeshConverter,
            KoshienConverter,
            BoostConverter,
            TranslateConverter,
            SoundConverter,
            MusicConverter,
            PenConverter,
            MakeyMakeyConverter,
            OperatorsConverter,
            LooksConverter,
            EV3Converter,
            GdxForConverter,
            SmalrubotS1Converter,
            MotionConverter,
            SensingConverter,
            MyBlocksConverter
        ].forEach(x => x.register(this));
    }

    get errors () {
        return this._context.errors;
    }

    get blocks () {
        return this._context.blocks;
    }

    get variables () {
        return this._context.variables;
    }

    get lists () {
        return this._context.lists;
    }

    get broadcastMsgs () {
        return this._context.broadcastMsgs;
    }

    setTranslatorFunction (translator) {
        this._translator = translator;
    }

    reset () {
        this._context = {
            currentNode: null,
            errors: [],
            argumentBlocks: {},
            procedureCallBlocks: {},
            extensionIDs: new Set(),

            blocks: {},
            blockTypes: {},
            localVariables: {},
            variables: {},
            lists: {},
            broadcastMsgs: {},
            procedures: {}
        };
        if (this.vm && this.vm.runtime && this.vm.runtime.getTargetForStage) {
            this._loadVariables(this.vm.runtime.getTargetForStage());
        }
    }

    targetCodeToBlocks (target, code) {
        this.reset();
        this._setTarget(target);
        this._loadVariables(target);
        try {
            const root = RubyParser.$parse(code);
            let blocks = this._process(root);
            if (blocks === null || blocks === Opal.nil) {
                return true;
            }
            if (!_.isArray(blocks)) {
                blocks = [blocks];
            }
            blocks.forEach(block => {
                if (this._isBlock(block)) {
                    block.topLevel = true;
                } else if (block instanceof Primitive) {
                    throw new RubyToBlocksConverterError(
                        block.node,
                        this._translator(
                            messages.couldNotConvertPrimitive,
                            {SOURCE: this._getSource(block.node)}
                        )
                    );
                } else {
                    throw new Error(`invalid block: ${block}`);
                }
            });
            Object.keys(this._context.blocks).forEach(blockId => {
                const block = this._context.blocks[blockId];
                if (this._isRubyBlock(block)) {
                    throw new RubyToBlocksConverterError(
                        block.node,
                        this._translator(
                            messages.wrongInstruction,
                            {SOURCE: this._getSource(block.node)}
                        )
                    );
                }

                const extensionID = getExtensionIdForOpcode(block.opcode);
                if (extensionID) {
                    this._context.extensionIDs.add(extensionID);
                }
            });
            return true;
        } catch (e) {
            let error;
            if (e.$$class && e.$$class.$$name === 'SyntaxError') {
                const loc = e.$diagnostic().$location();
                error = this._toErrorAnnotation(loc.$line(), loc.$column(), e.$message());
            } else if (e instanceof RubyToBlocksConverterError) {
                const loc = e.node.$loc();
                error = this._toErrorAnnotation(loc.$line(), loc.$column(), e.message, this._getSource(e.node));
            } else if (this._context.currentNode) {
                const loc = this._context.currentNode.$loc();
                error = this._toErrorAnnotation(
                    loc.$line(), loc.$column(), e.message, this._getSource(this._context.currentNode)
                );
            } else {
                error = this._toErrorAnnotation(1, 0, e.message);
            }
            if (error) {
                this._context.errors.push(error);
            }
            return false;
        }
    }

    applyTargetBlocks (target) {
        let stage;
        if (target.isStage) {
            stage = target;
        } else {
            stage = this.vm.runtime.getTargetForStage();
        }
        ['variables', 'lists'].forEach(storeName => {
            Object.keys(this._context[storeName]).forEach(name => {
                const variable = this._context[storeName][name];
                if (variable.scope === 'global') {
                    if (!Object.prototype.hasOwnProperty.call(stage.variables, variable.id)) {
                        stage.createVariable(variable.id, variable.name, variable.type);
                    }
                } else if (!target.isStage) {
                    if (!Object.prototype.hasOwnProperty.call(target.variables, variable.id)) {
                        target.createVariable(variable.id, variable.name, variable.type);
                    }
                }
            });
        });

        Object.keys(this._context.broadcastMsgs).forEach(name => {
            const broadcastMsg = this._context.broadcastMsgs[name];
            if (!Object.prototype.hasOwnProperty.call(stage.variables, broadcastMsg.id)) {
                stage.createVariable(broadcastMsg.id, broadcastMsg.name, Variable.BROADCAST_MESSAGE_TYPE);
            }
        });

        const extensionPromises = [];
        this._context.extensionIDs.forEach(extensionID => {
            if (!this.vm.extensionManager.isExtensionLoaded(extensionID)) {
                extensionPromises.push(this.vm.extensionManager.loadExtensionURL(extensionID));
            }
        });

        return Promise.all(extensionPromises).then(() => {
            Object.keys(target.blocks._blocks).forEach(blockId => {
                target.blocks.deleteBlock(blockId);
            });

            Object.keys(this._context.blocks).forEach(blockId => {
                target.blocks.createBlock(this._context.blocks[blockId]);
            });

            this.vm.emitWorkspaceUpdate();
        });
    }

    registerOnSendWithBlock (receiverName, name, numArgs, numRubyBlockArgs, createBlockFunc) {
        if (receiverName === 'any') {
            this._anyReceiverNames().forEach(rn => {
                this.registerOnSendWithBlock(rn, name, numArgs, numRubyBlockArgs, createBlockFunc);
            });
            return;
        }

        if (_.isArray(receiverName)) {
            receiverName.forEach(rn => {
                this.registerOnSendWithBlock(rn, name, numArgs, numRubyBlockArgs, createBlockFunc);
            });
            return;
        }

        if (receiverName === 'self') {
            this.registerOnSendWithBlock('sprite', name, numArgs, numRubyBlockArgs, createBlockFunc);
            this.registerOnSendWithBlock('stage', name, numArgs, numRubyBlockArgs, createBlockFunc);
            return;
        }

        let methodToNumArgs = this._receiverToMethods[receiverName];
        if (!methodToNumArgs) methodToNumArgs = this._receiverToMethods[receiverName] = {};

        let numArgsToNumRubyBlockArgs = methodToNumArgs[name];
        if (!numArgsToNumRubyBlockArgs) numArgsToNumRubyBlockArgs = methodToNumArgs[name] = {};

        let numRubyBlockArgsToCreateBlockFuncs = numArgsToNumRubyBlockArgs[numArgs];
        if (!numRubyBlockArgsToCreateBlockFuncs) {
            numRubyBlockArgsToCreateBlockFuncs = numArgsToNumRubyBlockArgs[numArgs] = {};
        }

        let createBlockFuncs = numRubyBlockArgsToCreateBlockFuncs[numRubyBlockArgs];
        if (!createBlockFuncs) createBlockFuncs = numRubyBlockArgsToCreateBlockFuncs[numRubyBlockArgs] = [];

        createBlockFuncs.push(createBlockFunc);
    }

    registerOnSend (receiverName, name, numArgs, createBlockFunc) {
        this.registerOnSendWithBlock(receiverName, name, numArgs, 'none', createBlockFunc);
    }

    registerOnSendMyBlock (receiverName, myBlockHandler) {
        if (receiverName === 'any') {
            this._anyReceiverNames().forEach(rn => this.registerOnSendMyBlock(rn, myBlockHandler));
            return;
        }

        if (_.isArray(receiverName)) {
            receiverName.forEach(rn => this.registerOnSendMyBlock(rn, myBlockHandler));
            return;
        }

        if (receiverName === 'self') {
            this.registerOnSendMyBlock('sprite', myBlockHandler);
            this.registerOnSendMyBlock('stage', myBlockHandler);
            return;
        }

        if (!this._receiverToMyBlocks[receiverName]) {
            this._receiverToMyBlocks[receiverName] = [];
        }
        this._receiverToMyBlocks[receiverName].push(myBlockHandler);
    }

    registerOnIf (handler) {
        this._onIfHandlers.push(handler);
    }

    registerOnUntil (handler) {
        this._onUntilHandlers.push(handler);
    }

    registerOnOpAsgn (handler) {
        this._onOpAsgnHandlers.push(handler);
    }

    registerOnAnd (handler) {
        this._onAndHandlers.push(handler);
    }

    registerOnOr (handler) {
        this._onOrHandlers.push(handler);
    }

    registerOnVar (handler) {
        this._onVarHandlers.push(handler);
    }

    registerOnVasgn (handler) {
        this._onVasgnHandlers.push(handler);
    }

    registerOnDefs (handler) {
        this._onDefsHandlers.push(handler);
    }

    callMethod (receiver, name, args, rubyBlockArgs, rubyBlock, node) {
        const receiverName = this._getReceiverName(receiver);
        if (!receiverName) return null;

        // Check for my-block procedure calls
        if (this._receiverToMyBlocks[receiverName]) {
            const procedure = this._lookupProcedure(name);
            if (procedure) {
                const params = {
                    receiver: receiver,
                    receiverName: receiverName,
                    name: name,
                    args: args,
                    rubyBlockArgs: rubyBlockArgs,
                    rubyBlock: rubyBlock,
                    node: node,
                    procedure: procedure
                };

                for (const handler of this._receiverToMyBlocks[receiverName]) {
                    const block = handler.apply(this, [params]);
                    if (block) return block;
                }
            }
        }

        const methodToNumArgs = this._receiverToMethods[receiverName];
        if (!methodToNumArgs) return null;
        const numArgsToNumRubyBlockArgs = methodToNumArgs[name];
        if (!numArgsToNumRubyBlockArgs) return null;
        const numRubyBlockArgsToCreateBlockFuncs = numArgsToNumRubyBlockArgs[args.length];
        if (!numRubyBlockArgsToCreateBlockFuncs) return null;

        let numRubyBlockArgs = 'none';
        if (rubyBlock) numRubyBlockArgs = rubyBlockArgs.length;
        const createBlockFuncs = numRubyBlockArgsToCreateBlockFuncs[numRubyBlockArgs];
        if (!createBlockFuncs) return null;

        const params = {
            receiver: receiver,
            receiverName: receiverName,
            name: name,
            args: args,
            rubyBlockArgs: rubyBlockArgs,
            rubyBlock: rubyBlock,
            node: node
        };
        for (let i = 0; i < createBlockFuncs.length; i++) {
            const createBlockFunc = createBlockFuncs[i];
            const block = createBlockFunc.apply(this, [params]);
            if (block) return block;
        }

        return null;
    }

    /**
     * Determines the receiver name for method call registration and lookup.
     * This method analyzes the receiver object from Ruby AST and returns the corresponding
     * receiver name string used in the register pattern system.
     *
     * @param {*} receiver - The receiver object from Ruby AST (primitives, blocks, constants, etc.)
     * @returns {string|null} The receiver name string, or null if cannot be determined:
     *   - 'stage': when receiver is self/nil and current target is stage
     *   - 'sprite': when receiver is self/nil and current target is sprite
     *   - 'variable': when receiver is a variable block type
     *   - 'string': when receiver is a string primitive
     *   - 'number': when receiver is a number primitive (int/float)
     *   - 'array': when receiver is an array primitive
     *   - 'hash': when receiver is a hash primitive
     *   - 'boolean': when receiver is true/false primitive
     *   - 'nil': when receiver is nil primitive
     *   - 'block': when receiver is any other block type
     *   - {string}: the const string representation (e.g., '::Math', '::Math::E') when receiver is const
     *   - {string}: the text value when receiver is a ruby_expression block
     *   - null: fallback when receiver type cannot be determined
     */
    _getReceiverName (receiver) {
        if (this._isSelf(receiver) || receiver === Opal.nil) {
            if (this._context.target && this._context.target.isStage) {
                return 'stage';
            }
            return 'sprite';
        }

        if (this.isVariableBlockType(receiver)) {
            return 'variable';
        }

        if (this._isString(receiver)) {
            return 'string';
        }

        if (this._isNumber(receiver)) {
            return 'number';
        }

        if (this._isArray(receiver)) {
            return 'array';
        }

        if (this._isHash(receiver)) {
            return 'hash';
        }

        if (this._isTrue(receiver) || this._isFalse(receiver)) {
            return 'boolean';
        }

        if (this.isNil(receiver)) {
            return 'nil';
        }

        if (this._isConst(receiver)) {
            return receiver.toString();
        }

        if (this._isBlock(receiver) && receiver.opcode === 'ruby_expression') {
            const textBlock = this._context.blocks[receiver.inputs.EXPRESSION.block];
            const text = textBlock.fields.TEXT.value;

            // Sprite call pattern detection
            const SpriteCallRe = /^sprite\("(.*)"\)$/;
            if (SpriteCallRe.test(text)) {
                return 'sprite_call';
            }

            return text;
        }

        if (this._isBlock(receiver)) {
            return 'block';
        }

        return null;
    }

    _anyReceiverNames () {
        return ['sprite', 'stage', 'variable', 'string', 'number', 'array', 'hash', 'boolean', 'nil', 'block'];
    }

    _getSpriteCallName (receiver) {
        if (this._isBlock(receiver) && receiver.opcode === 'ruby_expression') {
            const textBlock = this._context.blocks[receiver.inputs.EXPRESSION.block];
            const text = textBlock.fields.TEXT.value;
            const SpriteCallRe = /^sprite\("(.*)"\)$/;
            const match = SpriteCallRe.exec(text);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    _isSpriteCall (receiver) {
        return this._getSpriteCallName(receiver) !== null;
    }

    setParent (block, parent) {
        return this._setParent(block, parent);
    }

    _callConvertersHandler (handlerName, ...args) {
        // First, check registered handlers based on handlerName
        const handlersMap = {
            onIf: this._onIfHandlers,
            onUntil: this._onUntilHandlers,
            onOpAsgn: this._onOpAsgnHandlers,
            onAnd: this._onAndHandlers,
            onOr: this._onOrHandlers,
            onVar: this._onVarHandlers,
            onVasgn: this._onVasgnHandlers,
            onDefs: this._onDefsHandlers
        };

        const handlers = handlersMap[handlerName];
        if (handlers) {
            for (const handler of handlers) {
                const block = handler.apply(this, args);
                if (block) {
                    return block;
                }
            }
        }

        // Then, check legacy converter objects for remaining unmigrated handlers
        const legacyConverters = [
            MusicConverter,
            PenConverter,
            EV3Converter,
            GdxForConverter,
            SmalrubotS1Converter,
            BoostConverter,
            TranslateConverter,
            MakeyMakeyConverter,
            LooksConverter,
            SoundConverter,
            SensingConverter
        ];
        
        for (let i = 0; i < legacyConverters.length; i++) {
            const converter = legacyConverters[i];
            if (Object.prototype.hasOwnProperty.call(converter, handlerName)) {
                const block = converter[handlerName].apply(this, args);
                if (block) {
                    return block;
                }
            }
        }

        return null;
    }

    _saveContext () {
        const includes = [
            'blocks',
            'blockTypes',
            'localVariables',
            'variables',
            'lists',
            'broadcastMsgs',
            'procedures'
        ];

        const saved = {};
        Object.keys(this._context).filter(k => includes.indexOf(k) >= 0)
            .forEach(k => {
                saved[k] = Object.assign({}, this._context[k]);
            });
        return saved;
    }

    // could not restore attributes.
    _restoreContext (saved) {
        if (!saved) {
            return;
        }

        Object.keys(saved).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(this._context, key)) {
                Object.keys(this._context[key]).forEach(id => {
                    if (!Object.prototype.hasOwnProperty.call(saved[key], id)) {
                        delete this._context[key][id];
                    }
                });
                Object.keys(saved[key]).forEach(id => {
                    if (!Object.prototype.hasOwnProperty.call(this._context[key], id)) {
                        this._context[key][id] = saved[key][id];
                    }
                });
            }
        });
    }

    _setTarget (target) {
        this._context.target = target;
    }

    _loadVariables (target) {
        if (!target || !target.variables) {
            return;
        }
        let scope;
        if (target.isStage) {
            scope = 'global';
        } else {
            scope = 'instance';
        }
        Object.keys(target.variables).forEach(blockId => {
            const variable = target.variables[blockId];
            let storeName;
            if (variable.type === Variable.SCALAR_TYPE) {
                storeName = 'variables';
            } else if (variable.type === Variable.BROADCAST_MESSAGE_TYPE) {
                storeName = 'broadcastMsgs';
            } else {
                storeName = 'lists';
            }
            this._context[storeName][variable.name] = Object.assign({}, variable, {
                scope: scope
            });
        });
    }

    _toErrorAnnotation (row, column, message, source) {
        if (row === Opal.nil) {
            row = 0;
        } else {
            row -= 1;
        }
        if (column === Opal.nil) {
            column = 0;
        }
        return {
            row: row,
            column: column,
            type: 'error',
            text: message,
            source: source
        };
    }

    _checkNumChildren (node, length) {
        if (_.isArray(length)) {
            if (length.indexOf(node.children.length) < 0) {
                log.error(`'${node.type}' node.children.length !== ${length.join(' or ')}: `, node.children);
            }
        } else if (node.children.length !== length) {
            log.error(`'${node.type}' node.children.length !== ${length}: `, node.children);
        }
    }

    _isSelf (block) {
        return block instanceof Primitive && block.type === 'self';
    }

    _isStage () {
        return this._context.target && this._context.target.isStage;
    }

    isString (value) {
        return this._isString(value);
    }

    _isString (value) {
        return _.isString(value) || (value && value.type === 'str');
    }

    isNumber (value) {
        return this._isNumber(value);
    }

    _isNumber (value) {
        return _.isNumber(value) || (value && (value.type === 'int' || value.type === 'float'));
    }

    isTrue (value) {
        return this._isTrue(value);
    }

    _isTrue (value) {
        return value === true || (value && value.type === 'true');
    }

    isFalse (value) {
        return this._isFalse(value);
    }

    _isFalse (value) {
        return value === false || (value && value.type === 'false');
    }

    isNil (value) {
        return value === Opal.nil || (value && value.type === 'nil');
    }

    _isArray (value) {
        return _.isArray(value) || (value && value.type === 'array');
    }

    _isHash (value) {
        return value && value.type === 'hash';
    }

    _isConst (value) {
        return value && value.type === 'const';
    }

    isBlock (block) {
        try {
            return Object.prototype.hasOwnProperty.call(block, 'opcode');
        } catch (e) {
            return false;
        }
    }

    _isBlock (block) {
        return this.isBlock(block);
    }

    _isStatementBlock (block) {
        const blockType = this._getBlockType(block);
        return blockType === 'statement' || blockType === 'terminate';
    }

    _isValueBlock (block) {
        if (!this._isBlock(block)) {
            return false;
        }
        return /^value/.test(this._getBlockType(block));
    }

    isNumberOrBlock (numberOrBlock) {
        return this._isNumberOrBlock(numberOrBlock);
    }

    _isNumberOrBlock (numberOrBlock) {
        return this._isNumber(numberOrBlock) || this._isValueBlock(numberOrBlock);
    }

    isStringOrBlock (stringOrBlock) {
        return this._isStringOrBlock(stringOrBlock);
    }

    _isStringOrBlock (stringOrBlock) {
        return this._isString(stringOrBlock) || this._isValueBlock(stringOrBlock);
    }

    _isNumberOrStringOrBlock (block) {
        return this._isNumber(block) || this._isString(block) || this._isValueBlock(block);
    }

    isColorOrBlock (colorOrBlock) {
        return this._isColorOrBlock(colorOrBlock);
    }

    _isColorOrBlock (colorOrBlock) {
        return this._isBlock(colorOrBlock) || (this._isString(colorOrBlock) && ColorRegexp.test(colorOrBlock));
    }

    _isFalseOrBooleanBlock (block) {
        if (this._isFalse(block)) {
            return true;
        }
        if (!this._isBlock(block)) {
            return false;
        }
        if (this._getBlockType(block) === 'value_boolean') {
            return true;
        }
        if (block.opcode === 'argument_reporter_string_number') {
            const varName = block.fields.VALUE.value;
            if (this._changeToBooleanArgument(varName)) {
                block.opcode = 'argument_reporter_boolean';
                this._setBlockType(block, 'value_boolean');
                return true;
            }
        }
        return false;
    }

    isVariableBlockType (block) {
        return /_variable$/.test(this._getBlockType(block));
    }

    isVariableBlock (block) {
        return this.isVariableBlockType(block) && block.opcode === 'data_variable';
    }

    isListBlock (block) {
        return this.getBlockType(block) === 'value_variable' && block.opcode === 'data_listcontents';
    }

    isRubyExpression (block) {
        return this._isRubyExpression(block);
    }

    _isRubyExpression (block) {
        return this._isBlock(block) && block.opcode === 'ruby_expression';
    }

    getRubyExpression (block) {
        return this._getRubyExpression(block);
    }

    _getRubyExpression (block) {
        if (this._isRubyExpression(block)) {
            const textBlock = this._context.blocks[block.inputs.EXPRESSION.block];
            return textBlock.fields.TEXT.value;
        }
        return null;
    }

    _isRubyStatement (block) {
        return this._isBlock(block) && block.opcode === 'ruby_statement';
    }

    _isRubyBlock (block) {
        return this._isBlock(block) && block.opcode.match(/^ruby_/);
    }

    _getRubyStatement (block) {
        if (this._isRubyStatement(block)) {
            const textBlock = this._context.blocks[block.inputs.STATEMENT.block];
            return textBlock.fields.TEXT.value;
        }
        return null;
    }

    createBlock (opcode, type, attributes = {}) {
        return this._createBlock(opcode, type, attributes);
    }

    _createBlock (opcode, type, attributes = {}) {
        const block = Object.assign({
            id: Blockly.utils.genUid(),
            opcode: opcode,
            inputs: {},
            fields: {},
            next: null,
            topLevel: false,
            parent: null,
            shadow: false,
            x: void 0,
            y: void 0
        }, attributes);
        this._context.blocks[block.id] = block;
        this._context.blockTypes[block.id] = type;
        return block;
    }

    createFieldBlock (opcode, fieldName, value) {
        return this._createFieldBlock(opcode, fieldName, value);
    }

    _createFieldBlock (opcode, fieldName, value) {
        if (this._isBlock(value)) {
            return value;
        }
        return this._createBlock(opcode, 'value', {
            fields: {
                [fieldName]: {
                    name: fieldName,
                    id: void 0,
                    value: value.toString()
                }
            },
            shadow: true
        });
    }

    createTextBlock (value) {
        return this._createTextBlock(value);
    }

    _createTextBlock (value) {
        if (this._isString(value)) {
            return this._createFieldBlock('text', 'TEXT', value.toString());
        }
        return value;
    }

    _createNumberBlock (opcode, value) {
        if (this._isNumber(value) || value === '') {
            return this._createFieldBlock(opcode, 'NUM', value.toString());
        }
        return value;
    }

    createRubyExpressionBlock (expression, node) {
        return this._createRubyExpressionBlock(expression, node);
    }

    _createRubyExpressionBlock (expression, node) {
        const block = this._createBlock('ruby_expression', 'value_boolean');
        block.node = node;
        this._addInput(block, 'EXPRESSION', this._createTextBlock(expression));
        return block;
    }

    _createRubyStatementBlock (statement, node) {
        const block = this._createBlock('ruby_statement', 'statement');
        block.node = node;
        this._addInput(block, 'STATEMENT', this._createTextBlock(statement));
        return block;
    }

    addField (block, name, value, attributes = {}) {
        return this._addField(block, name, value, attributes);
    }

    _addField (block, name, value, attributes = {}) {
        if (!this._isBlock(block)) {
            return;
        }
        block.fields[name] = Object.assign({
            name: name,
            value: value.toString()
        }, attributes);
    }

    addInput (block, name, inputBlock, shadowBlock) {
        return this._addInput(block, name, inputBlock, shadowBlock);
    }

    _addInput (block, name, inputBlock, shadowBlock) {
        if (!name) {
            name = inputBlock.id;
        }
        inputBlock.parent = block.id;
        let shadowBlockId;
        if (shadowBlock) {
            shadowBlockId = shadowBlock.id;
            shadowBlock.parent = block.id;
        } else {
            shadowBlockId = null;
        }
        block.inputs[name] = {
            name: name,
            block: inputBlock.id,
            shadow: inputBlock.shadow ? inputBlock.id : shadowBlockId
        };
    }

    addNumberInput (block, name, opcode, inputValue, shadowValue) {
        return this._addNumberInput(block, name, opcode, inputValue, shadowValue);
    }

    _addNumberInput (block, name, opcode, inputValue, shadowValue) {
        let shadowBlock;
        if (!this._isNumber(inputValue)) {
            shadowBlock = this._createNumberBlock(opcode, shadowValue);
        }
        this._addInput(block, name, this._createNumberBlock(opcode, inputValue), shadowBlock);
    }

    addNoteInput (block, name, inputValue, shadowValue) {
        return this._addNoteInput(block, name, inputValue, shadowValue);
    }

    _addNoteInput (block, name, inputValue, shadowValue) {
        let shadowBlock;
        const opcode = 'note';
        if (!this._isNumber(inputValue)) {
            shadowBlock = this._createNoteBlock(opcode, shadowValue);
        }
        this._addInput(block, name, this._createNoteBlock(opcode, inputValue), shadowBlock);
    }

    _createNoteBlock (opcode, value) {
        if (this._isNumber(value) || value === '') {
            return this._createFieldBlock(opcode, 'NOTE', value.toString());
        }
        return value;
    }

    addTextInput (block, name, inputValue, shadowValue) {
        return this._addTextInput(block, name, inputValue, shadowValue);
    }

    _addTextInput (block, name, inputValue, shadowValue) {
        let shadowBlock;
        if (!this._isString(inputValue)) {
            shadowBlock = this._createTextBlock(shadowValue);
        }
        this._addInput(block, name, this._createTextBlock(inputValue), shadowBlock);
    }

    addFieldInput (block, name, opcode, fieldName, inputValue, shadowValue) {
        return this._addFieldInput(block, name, opcode, fieldName, inputValue, shadowValue);
    }

    _addFieldInput (block, name, opcode, fieldName, inputValue, shadowValue) {
        let shadowBlock;
        if (!this._isString(inputValue)) {
            shadowBlock = this._createFieldBlock(opcode, fieldName, shadowValue);
        }
        this._addInput(block, name, this._createFieldBlock(opcode, fieldName, inputValue), shadowBlock);
    }

    _addSubstack (block, substackBlock, num = 1) {
        let name = 'SUBSTACK';
        if (num > 1) {
            name = `${name}${num}`;
        }
        let substackBlockId = null;
        if (this._isBlock(substackBlock)) {
            substackBlock.parent = block.id;
            substackBlockId = substackBlock.id;
        }
        block.inputs[name] = {
            name: name,
            block: substackBlockId,
            shadow: null
        };
    }

    // Helper function to convert argument names to snake_case lowercase
    _toSnakeCaseLowercase (name) {
        return name
            // Replace any sequence of non-alphanumeric characters except underscores with underscore
            .replace(/[^a-zA-Z0-9_]+/g, '_')
            // Convert camelCase to snake_case: insert underscore before uppercase letters
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            // Convert to lowercase
            .toLowerCase();
    }

    _lookupOrCreateVariableOrList (name, type) {
        name = name.toString();
        let scope;
        let varName;
        if (name[0] === '$') {
            varName = name.slice(1);
            scope = 'global';
        } else if (name[0] === '@') {
            varName = name.slice(1);
            scope = 'instance';
        } else {
            varName = name;
            scope = 'local';
        }
        let storeName;
        if (type === Variable.SCALAR_TYPE) {
            if (scope === 'local') {
                storeName = 'localVariables';
            } else {
                storeName = 'variables';
            }
        } else {
            storeName = 'lists';
        }
        let variable = this._context[storeName][varName];
        if (variable) {
            // Check for variable scope change - only for global/instance variables
            if ((scope === 'global' || scope === 'instance') && variable.scope !== scope) {
                throw new RubyToBlocksConverterError(
                    this._context.currentNode,
                    `"${name}", can't change variable scope`
                );
            }
        } else {
            variable = {
                id: Blockly.utils.genUid(),
                name: varName,
                scope: scope,
                type: type
            };
            this._context[storeName][varName] = variable;
        }
        return variable;
    }

    _lookupOrCreateVariable (name) {
        return this._lookupOrCreateVariableOrList(name, Variable.SCALAR_TYPE);
    }

    _lookupOrCreateList (name) {
        return this._lookupOrCreateVariableOrList(name, Variable.LIST_TYPE);
    }

    lookupVariableFromVariableBlock (block) {
        if (!this.isVariableBlock(block)) return null;

        return this._context.variables[block.fields.VARIABLE.value] ||
            this._context.localVariables[block.fields.VARIABLE.value];
    }

    lookupListFromListBlock (block) {
        if (!this.isListBlock(block)) return null;

        return this._context.lists[block.fields.LIST.value];
    }

    lookupOrCreateBroadcastMsg (name) {
        return this._lookupOrCreateBroadcastMsg(name);
    }

    _lookupOrCreateBroadcastMsg (name) {
        name = name.toString();
        const key = name.toLowerCase();
        let broadcastMsg = this._context.broadcastMsgs[key];
        if (!broadcastMsg) {
            broadcastMsg = {
                id: Blockly.utils.genUid(),
                name: name,
                scope: 'global'
            };
            this._context.broadcastMsgs[key] = broadcastMsg;
        }
        return broadcastMsg;
    }

    defaultBroadcastMsg () {
        return this._defaultBroadcastMsg();
    }

    _defaultBroadcastMsg () {
        const defaultName = 'message1';
        const keys = Object.keys(this._context.broadcastMsgs);
        if (keys.length === 0) {
            return this._lookupOrCreateBroadcastMsg(defaultName);
        }
        if (Object.prototype.hasOwnProperty.call(this._context.broadcastMsgs, defaultName)) {
            return this._context.broadcastMsgs[defaultName];
        }
        return this._context.broadcastMsgs[keys[0]];
    }

    _lookupProcedure (name) {
        name = name.toString();
        return this._context.procedures[name];
    }

    _createProcedure (name) {
        name = name.toString();
        let procedure = this._context.procedures[name];
        if (procedure) {
            throw new RubyToBlocksConverterError(
                this._context.currentNode,
                `already defined My Block "${name}".`
            );
        }
        procedure = {
            id: Blockly.utils.genUid(),
            name: name,
            procCode: [name],
            argumentNames: [],
            argumentDefaults: [],
            argumentIds: [],
            argumentVariables: [],
            argumentBlocks: []
        };
        this._context.procedures[name] = procedure;
        return procedure;
    }

    _getSource (node) {
        const expression = node.$loc().$expression();
        if (expression === Opal.nil) {
            return '';
        }
        return expression.$source().toString();
    }

    _lastBlock (block) {
        let b = block;
        while (b.next) {
            b = this._context.blocks[b.next];
        }
        return b;
    }

    removeBlock (block) {
        if (this.isNil(block)) {
            return;
        }

        const previousBlockId = block.parent;
        if (previousBlockId) {
            const previousBlock = this._context.blocks[previousBlockId];
            previousBlock.next = block.next;
        }

        delete this._context.blocks[block.id];
    }

    _removeWaitBlocks (block) {
        if (!block || block === Opal.nil) {
            return null;
        }

        let firstBlock = null;
        let b = block;
        let prev = b.parent;
        while (b) {
            let isWaitBlock = false;
            if (b.opcode === 'ruby_statement') {
                const textBlock = this._context.blocks[b.inputs.STATEMENT.block];
                if (textBlock.fields.TEXT.value === 'wait') {
                    isWaitBlock = true;
                }
            }
            if (isWaitBlock) {
                delete this._context.blocks[b.id];
                if (prev) {
                    this._context.blocks[prev].next = null;
                }
            } else {
                if (firstBlock === null) {
                    firstBlock = b;
                }
                b.parent = prev;
                if (prev) {
                    this._context.blocks[prev].next = b.id;
                }
                prev = b.id;
            }
            b = this._context.blocks[b.next];
        }
        return firstBlock;
    }

    getBlockType (block) {
        if (this.isBlock(block)) {
            return this._context.blockTypes[block.id];
        }
        return 'primitive';
    }

    _getBlockType (block) {
        return this.getBlockType(block);
    }

    _setBlockType (block, type) {
        this._context.blockTypes[block.id] = type;
    }

    changeBlock (block, opcode, blockType) {
        return this._changeBlock(block, opcode, blockType);
    }

    _changeBlock (block, opcode, blockType) {
        block.opcode = opcode;
        this._setBlockType(block, blockType);
        return block;
    }

    changeRubyExpression (block, node, source = null) {
        block.node = node;
        const expressionBlock = this._context.blocks[block.inputs.EXPRESSION.block];
        expressionBlock.fields.TEXT.value = source || this._getSource(node);
        return block;
    }

    changeRubyExpressionBlock (block, opcode, blockType) {
        return this._changeRubyExpressionBlock(block, opcode, blockType);
    }

    _changeRubyExpressionBlock (block, opcode, blockType) {
        this._changeBlock(block, opcode, blockType);

        delete this._context.blocks[block.inputs.EXPRESSION.block];
        delete block.inputs.EXPRESSION;

        return block;
    }

    _changeToBooleanArgument (varName) {
        varName = varName.toString();
        const variable = this._context.localVariables[varName];
        if (!variable) {
            return false;
        }

        variable.isBoolean = true;

        if (Object.prototype.hasOwnProperty.call(this._context.argumentBlocks, variable.id)) {
            this._context.argumentBlocks[variable.id].forEach(id => {
                const b = this._context.blocks[id];
                b.opcode = 'argument_reporter_boolean';
                this._setBlockType(b, 'value_boolean');
            });
        }
        return true;
    }

    _setParent (block, parent) {
        if (this._isBlock(block)) {
            block.parent = parent.id;
            parent.next = block.id;
        }
    }

    _matchRubyExpression (block, regexp) {
        if (!this._isBlock(block) || block.opcode !== 'ruby_expression') {
            return false;
        }
        const textBlock = this._context.blocks[block.inputs.EXPRESSION.block];
        return regexp.test(textBlock.fields.TEXT.value);
    }

    _equalRubyExpression (block, expression) {
        if (!this._isBlock(block) || block.opcode !== 'ruby_expression') {
            return false;
        }
        const textBlock = this._context.blocks[block.inputs.EXPRESSION.block];
        return expression.toString() === textBlock.fields.TEXT.value;
    }

    _process (node) {
        if (!node) {
            return null;
        }
        if (node === Opal.nil) {
            return Opal.nil;
        }
        node = node.$to_ast();
        this._context.currentNode = node;
        const handlerName = '_' + _.camelCase(`on_${node.type}`); // eslint-disable-line prefer-template
        if (_.isFunction(this[handlerName])) {
            return this[handlerName](node);
        }
        throw new RubyToBlocksConverterError(node, `not supported node type: ${node.type}`);
    }

    _processStatement (node) {
        let blocks = this._process(node);
        if (!_.isArray(blocks)) {
            blocks = [blocks];
        }
        const block = blocks[0];
        if (blocks.length >= 2 || (block !== Opal.nil && !this._isStatementBlock(block))) {
            throw new RubyToBlocksConverterError(node, 'include not statement blocks');
        }
        return block;
    }

    _processCondition (node) {
        let cond = this._process(node);
        if (_.isArray(cond) && cond.length === 1) {
            cond = cond[0];
        }
        if (!this._isFalseOrBooleanBlock(cond)) {
            throw new RubyToBlocksConverterError(
                node,
                `condition is not boolean: ${this._getSource(node)}`
            );
        }
        return cond;
    }

    _onBegin (node) {
        const blocks = [];
        node.children.forEach(childNode => {
            const block = this._process(childNode);
            if (_.isArray(block)) {
                block.forEach(b => {
                    blocks.push(b);
                });
            } else {
                blocks.push(block);
            }
        });

        let prevBlock = null;
        const result = [];
        blocks.forEach(block => {
            switch (this._getBlockType(block)) {
            case 'statement':
                if (prevBlock) {
                    prevBlock.next = block.id;
                    block.parent = prevBlock.id;
                } else {
                    result.push(block);
                }
                if (block.next) {
                    const b = this._lastBlock(block);
                    if (this._getBlockType(b) === 'statement') {
                        prevBlock = b;
                    } else {
                        prevBlock = null;
                    }
                } else {
                    prevBlock = block;
                }
                break;
            case 'terminate':
                if (prevBlock) {
                    prevBlock.next = block.id;
                    block.parent = prevBlock.id;
                } else {
                    result.push(block);
                }
                prevBlock = null;
                break;
            case 'value':
            case 'value_boolean':
            case 'value_variable':
            case 'value_boolean_variable':
            case 'hat':
            case 'primitive':
                result.push(block);
                prevBlock = null;
            }
        });
        return result;
    }

    _onBlock (node) {
        this._checkNumChildren(node, 3);

        return this._onSend(node.children[0], node.children[1], node.children[2]);
    }

    _onSend (node, rubyBlockArgsNode, rubyBlockNode) {
        const saved = this._saveContext();

        let receiver = this._process(node.children[0]);
        if (_.isArray(receiver) && receiver.length === 1) {
            receiver = receiver[0];
        }
        const name = node.children[1].toString();
        const args = node.children.slice(2).map(childNode => this._process(childNode));

        let rubyBlockArgs;
        if (rubyBlockArgsNode) {
            rubyBlockArgs = this._process(rubyBlockArgsNode);
        }

        let rubyBlock;
        if (rubyBlockNode) {
            rubyBlock = this._processStatement(rubyBlockNode);
        }

        let block = this.callMethod(receiver, name, args, rubyBlockArgs, rubyBlock, node);
        if (!block) {
            block = this._callConvertersHandler('onSend', receiver, name, args, rubyBlockArgs, rubyBlock, node);
        }
        if (!block) {
            if ((this._isSelf(receiver) || receiver === Opal.nil) && !rubyBlock) {
                switch (name) {
                case 'wait':
                    if (args.length === 0) {
                        block = this._createRubyStatementBlock('wait', node);
                    }
                    break;
                }
            }
        }

        if (!block) {
            this._restoreContext(saved);

            if (rubyBlockNode) {
                block = this._createBlock('ruby_statement_with_block', 'statement');
                block.node = node;
                this._addTextInput(block, 'STATEMENT', this._getSource(node));
                this._addTextInput(block, 'ARGS', this._getSource(rubyBlockArgsNode));
                this._addSubstack(block, this._processStatement(rubyBlockNode));
            } else {
                block = this._createRubyStatementBlock(this._getSource(node), node);
            }
        }
        return block;
    }

    _onSelf (node) {
        return new Primitive('self', 'self', node);
    }

    _onSym (node) {
        this._checkNumChildren(node, 1);

        return new Primitive('sym', node.children[0].toString(), node);
    }

    _onStr (node) {
        this._checkNumChildren(node, 1);

        return new Primitive('str', node.children[0].toString(), node);
    }

    _onInt (node) {
        this._checkNumChildren(node, 1);

        return new Primitive('int', node.children[0], node);
    }

    _onFloat (node) {
        this._checkNumChildren(node, 1);

        return new Primitive('float', node.children[0], node);
    }

    _onTrue (node) {
        return new Primitive('true', true, node);
    }

    _onFalse (node) {
        return new Primitive('false', true, node);
    }

    _onArray (node) {
        return new Primitive('array', node.children.map(childNode => this._process(childNode)), node);
    }

    _onHash (node) {
        return new Primitive('hash', new Map(node.children.map(childNode => this._process(childNode))), node);
    }

    _onNil (node) {
        return new Primitive('nil', Opal.nil, node);
    }

    _onPair (node) {
        this._checkNumChildren(node, 2);

        return node.children.map(childNode => this._process(childNode));
    }

    _onIrange (node) {
        this._checkNumChildren(node, 2);

        const args = node.children.map(childNode => this._process(childNode));
        const block = this._createBlock('ruby_range', 'value_boolean');
        block.node = node;
        this._addNumberInput(block, 'FROM', 'math_number', args[0], 1);
        this._addNumberInput(block, 'TO', 'math_number', args[1], 10);
        return block;
    }

    _onErange (node) {
        this._checkNumChildren(node, 2);

        const args = node.children.map(childNode => this._process(childNode));
        const block = this._createBlock('ruby_exclude_range', 'value_boolean');
        block.node = node;
        this._addNumberInput(block, 'FROM', 'math_number', args[0], 1);
        this._addNumberInput(block, 'TO', 'math_number', args[1], 10);
        return block;
    }

    _onConst (node) {
        this._checkNumChildren(node, 2);

        const value = {
            scope: this._process(node.children[0]),
            name: node.children[1].toString()
        };
        return new Primitive('const', value, node);
    }

    _onArgs (node) {
        return node.children.map(childNode => this._process(childNode));
    }

    _onArg (node) {
        this._checkNumChildren(node, 1);

        return node.children[0];
    }

    _onIf (node) {
        this._checkNumChildren(node, 3);

        const saved = this._saveContext();

        const cond = this._processCondition(node.children[0]);
        const statement = this._processStatement(node.children[1]);
        let elseStatement;
        if (node.children[2] !== Opal.nil ||
            (node.$loc().$else && node.$loc().$else() !== Opal.nil)) {
            elseStatement = this._processStatement(node.children[2]);
        }

        let block = this._callConvertersHandler('onIf', cond, statement, elseStatement);
        if (!block) {
            this._restoreContext(saved);

            block = this._createRubyStatementBlock(this._getSource(node), node);
        }
        return block;
    }

    _onUntil (node) {
        this._checkNumChildren(node, 2);

        const saved = this._saveContext();

        const cond = this._processCondition(node.children[0]);
        const statement = this._processStatement(node.children[1]);

        let block = this._callConvertersHandler('onUntil', cond, statement);
        if (!block) {
            this._restoreContext(saved);

            block = this._createRubyStatementBlock(this._getSource(node), node);
        }
        return block;
    }

    _onOpAsgn (node) {
        this._checkNumChildren(node, 3);

        const saved = this._saveContext();

        const lh = this._process(node.children[0]);
        const operator = node.children[1].toString();
        const rh = this._process(node.children[2]);

        let block = this._callConvertersHandler('onOpAsgn', lh, operator, rh);
        if (!block) {
            this._restoreContext(saved);

            block = this._createRubyStatementBlock(this._getSource(node), node);
        }

        return block;
    }

    _onAnd (node) {
        this._checkNumChildren(node, 2);

        const operands = node.children.map(childNode => this._processCondition(childNode));
        return this._callConvertersHandler('onAnd', operands);
    }

    _onOr (node) {
        this._checkNumChildren(node, 2);

        const operands = node.children.map(childNode => this._processCondition(childNode));
        return this._callConvertersHandler('onOr', operands);
    }

    _onVar (node, scope) {
        this._checkNumChildren(node, 1);

        const variable = this._lookupOrCreateVariable(node.children[0]);
        const block = this._callConvertersHandler('onVar', scope, variable);
        if (block) {
            return block;
        }

        return node.children[0].toString();
    }

    _onGvar (node) {
        return this._onVar(node, 'global');
    }

    _onIvar (node) {
        return this._onVar(node, 'instance');
    }

    _onLvar (node) {
        this._checkNumChildren(node, 1);

        const originalVarName = node.children[0].toString();
        // Normalize variable name to snake_case lowercase for consistency
        const normalizedVarName = this._toSnakeCaseLowercase(originalVarName);

        // Check both original and normalized names in local variables
        let variable = this._context.localVariables[normalizedVarName];
        if (!variable) {
            variable = this._context.localVariables[originalVarName];
        }

        if (variable) {
            const block = this._callConvertersHandler('onVar', 'local', variable);
            if (block) {
                return block;
            }
        }

        return normalizedVarName;
    }

    _onVasgn (node, scope) {
        this._checkNumChildren(node, [1, 2]);

        if (node.children.length === 1) {
            return node.children[0].toString();
        }

        const saved = this._saveContext();

        const variable = this._lookupOrCreateVariable(node.children[0]);
        const rh = this._process(node.children[1]);
        let block = this._callConvertersHandler('onVasgn', scope, variable, rh);
        if (!block) {
            this._restoreContext(saved);

            block = this._createRubyStatementBlock(this._getSource(node), node);
        }

        return block;
    }

    _onGvasgn (node) {
        return this._onVasgn(node, 'global');
    }

    _onIvasgn (node) {
        return this._onVasgn(node, 'instance');
    }

    _onLvasgn (node) {
        return this._onVasgn(node, 'local');
    }

    _onDefs (node) {
        this._checkNumChildren(node, 4);

        const saved = this._saveContext();

        let block = this._callConvertersHandler('onDefs', node, saved);
        if (!block) {
            this._restoreContext(saved);

            block = this._createRubyStatementBlock(this._getSource(node), node);
        }

        return block;
    }
}

/**
 * Null of RubyToBlocksConverter
 */
const NullRubyToBlocksConverter = {
    result: true,
    errors: [],
    apply: () => Promise.resolve()
};

const targetCodeToBlocks = function (vm, target, code, intl) {
    const converter = new RubyToBlocksConverter(vm);
    if (intl) {
        converter.setTranslatorFunction(intl.formatMessage);
    }
    converter.result = converter.targetCodeToBlocks(target, code);
    if (converter.result) {
        converter.apply = () => converter.applyTargetBlocks(target);
    }
    return converter;
};

export {
    RubyToBlocksConverter as default,
    NullRubyToBlocksConverter,
    targetCodeToBlocks
};
