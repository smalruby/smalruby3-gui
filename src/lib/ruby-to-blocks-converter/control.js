/* global Opal */
import _ from 'lodash';
import {RubyToBlocksConverterError} from './errors';

/* eslint-disable no-invalid-this */
const createControlRepeatBlock = function (times, body) {
    const block = this._createBlock('control_repeat', 'statement');
    this._addNumberInput(block, 'TIMES', 'math_whole_number', times, 10);
    this._addSubstack(block, body);
    return block;
};

const StopOptions = [
    'all',
    'this script',
    'other scripts in sprite'
];
/* eslint-enable no-invalid-this */

/**
 * Control converter
 */
const ControlConverter = {
    // eslint-disable-next-line no-unused-vars
    onSend: function (receiver, name, args, rubyBlockArgs, rubyBlock, node) {
        let block;
        if (this._isSelf(receiver) || receiver === Opal.nil) {
            switch (name) {
            case 'sleep':
                if (args.length === 1 && this._isNumberOrBlock(args[0])) {
                    block = this._createBlock('control_wait', 'statement');
                    this._addNumberInput(block, 'DURATION', 'math_positive_number', args[0], 1);
                }
                break;
            case 'repeat':
                if (args.length === 1 && this._isNumberOrBlock(args[0]) &&
                    rubyBlockArgs && rubyBlockArgs.length === 0) {
                    rubyBlock = this._removeWaitBlocks(rubyBlock);
                    block = createControlRepeatBlock.call(this, args[0], rubyBlock);
                }
                break;
            case 'loop':
            case 'forever':
                if (args.length === 0 && rubyBlockArgs && rubyBlockArgs.length === 0 && rubyBlock) {
                    rubyBlock = this._removeWaitBlocks(rubyBlock);
                    block = this._createBlock('control_forever', 'terminate');
                    this._addSubstack(block, rubyBlock);
                }
                break;
            case 'stop':
                if (args.length === 1 &&
                    this._isString(args[0]) && StopOptions.indexOf(args[0].toString()) >= 0) {
                    block = this._createBlock('control_stop', 'terminate');
                    this._addField(block, 'STOP_OPTION', args[0]);
                }
                break;
            case 'create_clone':
                if (args.length === 1 && this._isString(args[0])) {
                    block = this._createBlock('control_create_clone_of', 'statement');
                    const optionBlock = this._createBlock('control_create_clone_of_menu', 'value', {
                        shadow: true
                    });
                    this._addField(optionBlock, 'CLONE_OPTION', args[0]);
                    this._addInput(block, 'CLONE_OPTION', optionBlock, optionBlock);
                }
                break;
            case 'delete_this_clone':
                if (args.length === 0) {
                    if (this._isStage()) {
                        throw new RubyToBlocksConverterError(node, 'Stage selected: no clone blocks');
                    }
                    block = this._createBlock('control_delete_this_clone', 'statement');
                }
                break;
            }
        } else if (this._isNumberOrBlock(receiver)) {
            switch (name) {
            case 'times':
                if (args.length === 0 &&
                    rubyBlockArgs && rubyBlockArgs.length === 0 && rubyBlock) {
                    rubyBlock = this._removeWaitBlocks(rubyBlock);
                    block = createControlRepeatBlock.call(this, receiver, rubyBlock);
                }
                break;
            }
        }
        return block;
    },

    onIf: function (cond, statement, elseStatement) {
        const block = this._createBlock('control_if', 'statement');
        if (!this._isFalse(cond)) {
            this._addInput(block, 'CONDITION', cond);
        }
        this._addSubstack(block, statement);
        if (elseStatement) {
            block.opcode = 'control_if_else';
            this._addSubstack(block, elseStatement, 2);
        }
        return block;
    },

    onUntil: function (cond, statement) {
        statement = this._removeWaitBlocks(statement);

        let opcode;
        if (statement === null) {
            opcode = 'control_wait_until';
        } else {
            opcode = 'control_repeat_until';
        }
        const block = this._createBlock(opcode, 'statement');
        if (!this._isFalse(cond)) {
            this._addInput(block, 'CONDITION', cond);
        }
        this._addSubstack(block, statement);
        return block;
    },

    register: function (converter) {
        converter.registerCallMethodWithBlock('self', 'when_start_as_a_clone', 0, 0, params => {
            const {rubyBlock, node} = params;

            if (converter._isStage()) {
                throw new RubyToBlocksConverterError(node, 'Stage selected: no clone blocks');
            }

            const block = converter.createBlock('control_start_as_clone', 'hat');
            converter.setParent(rubyBlock, block);
            return block;
        });

        // backward compatibility
        converter.registerCallMethodWithBlock('self', 'when', 1, 0, params => {
            const {args} = params;

            if (args[0].type !== 'sym') return null;

            switch (args[0].value) {
            case 'start_as_a_clone':
                return converter.callMethod(
                    params.receiver, 'when_start_as_a_clone', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            }

            return null;
        });
    }
};

export default ControlConverter;
