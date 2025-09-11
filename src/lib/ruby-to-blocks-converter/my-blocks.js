import _ from 'lodash';
import Blockly from 'scratch-blocks';
import {RubyToBlocksConverterError} from './errors';

/**
 * My Blocks converter
 */
const MyBlocksConverter = {
    register: function (converter) {
        // Register my-block handler for procedure calls
        converter.registerOnSendMyBlock('self', params => {
            const {name, args, procedure} = params;

            if (procedure.argumentIds.length !== args.length) return null;

            const block = converter._createBlock('procedures_call', 'statement', {
                mutation: {
                    argumentids: JSON.stringify(procedure.argumentIds),
                    children: [],
                    proccode: procedure.procCode.join(' '),
                    tagName: 'mutation',
                    warp: 'false'
                }
            });

            if (Object.prototype.hasOwnProperty.call(converter._context.procedureCallBlocks, procedure.id)) {
                converter._context.procedureCallBlocks[procedure.id].push(block.id);
            } else {
                converter._context.procedureCallBlocks[procedure.id] = [block.id];
            }

            args.forEach((arg, i) => {
                const argumentId = procedure.argumentIds[i];
                if (converter._isFalseOrBooleanBlock(arg)) {
                    if (procedure.argumentVariables[i].isBoolean ||
                        converter._changeToBooleanArgument(procedure.argumentNames[i])) {
                        if (!converter._isFalse(arg)) {
                            converter._addInput(block, argumentId, arg, null);
                        }
                        return;
                    }
                }
                if (!procedure.argumentVariables[i].isBoolean &&
                    (converter._isNumberOrBlock(arg) || converter._isStringOrBlock(arg))) {
                    converter._addTextInput(block, argumentId, converter._isNumber(arg) ? arg.toString() : arg, '');
                    return;
                }
                throw new RubyToBlocksConverterError(
                    converter._context.currentNode,
                    `invalid type of My Block "${name}" argument #${i + 1}`
                );
            });

            return block;
        });

        // Register onXxx handlers
        converter.registerOnVar((scope, variable) => {
            let block;
            if (scope === 'local') {
                let opcode;
                let blockType;
                if (variable.isBoolean) {
                    opcode = 'argument_reporter_boolean';
                    blockType = 'value_boolean';
                } else {
                    opcode = 'argument_reporter_string_number';
                    blockType = 'value';
                }
                // Use normalized variable name (should already be in snake_case lowercase)
                const normalizedName = converter._toSnakeCaseLowercase(variable.name);
                block = converter._createBlock(opcode, blockType, {
                    fields: {
                        VALUE: {
                            name: 'VALUE',
                            value: normalizedName
                        }
                    }
                });
                if (Object.prototype.hasOwnProperty.call(converter._context.argumentBlocks, variable.id)) {
                    converter._context.argumentBlocks[variable.id].push(block.id);
                } else {
                    converter._context.argumentBlocks[variable.id] = [block.id];
                }
            }
            return block;
        });

        converter.registerOnDefs((node, saved) => {
            const receiver = converter._process(node.children[0]);
            if (!converter._isSelf(receiver)) {
                return null;
            }

            const procedureName = node.children[1].toString();
            const block = converter._createBlock('procedures_definition', 'hat', {
                topLevel: true
            });
            const procedure = converter._createProcedure(procedureName);

            const customBlock = converter._createBlock('procedures_prototype', 'statement', {
                shadow: true
            });
            converter._addInput(block, 'custom_block', customBlock);

            converter._context.localVariables = {};
            converter._process(node.children[2]).forEach(n => {
                const originalName = n.toString();
                // Convert argument name to snake_case lowercase
                const normalizedName = converter._toSnakeCaseLowercase(originalName);

                procedure.argumentNames.push(normalizedName);
                procedure.argumentVariables.push(converter._lookupOrCreateVariable(normalizedName));
                procedure.procCode.push('%s');
                procedure.argumentDefaults.push('');
                const inputId = Blockly.utils.genUid();
                procedure.argumentIds.push(inputId);
                const inputBlock = converter._createBlock('argument_reporter_string_number', 'value', {
                    fields: {
                        VALUE: {
                            name: 'VALUE',
                            value: normalizedName
                        }
                    },
                    shadow: true
                });
                converter._addInput(customBlock, inputId, inputBlock);
                procedure.argumentBlocks.push(inputBlock);
            });

            let body = converter._process(node.children[3]);
            if (!_.isArray(body)) {
                body = [body];
            }
            if (converter._isBlock(body[0])) {
                block.next = body[0].id;
                body[0].parent = block.id;
            }

            const booleanIndexes = [];
            procedure.argumentVariables.forEach((v, i) => {
                if (v.isBoolean) {
                    booleanIndexes.push(i);
                    procedure.procCode[i + 1] = '%b';
                    procedure.argumentDefaults[i] = 'false';
                    procedure.argumentBlocks[i].opcode = 'argument_reporter_boolean';
                    converter._setBlockType(procedure.argumentBlocks[i], 'value_boolean');
                }
            });

            if (booleanIndexes.length > 0 &&
                Object.prototype.hasOwnProperty.call(converter._context.procedureCallBlocks, procedure.id)) {
                converter._context.procedureCallBlocks[procedure.id].forEach(id => {
                    const b = converter._context.blocks[id];
                    b.mutation.proccode = procedure.procCode.join(' ');
                    booleanIndexes.forEach(booleanIndex => {
                        const input = b.inputs[procedure.argumentIds[booleanIndex]];
                        const inputBlock = converter._context.blocks[input.block];
                        if (inputBlock) {
                            if (!inputBlock.shadow && input.shadow) {
                                delete converter._context.blocks[input.shadow];
                                input.shadow = null;
                            }
                        }
                    });
                });
            }

            customBlock.mutation = {
                argumentdefaults: JSON.stringify(procedure.argumentDefaults),
                argumentids: JSON.stringify(procedure.argumentIds),
                argumentnames: JSON.stringify(procedure.argumentNames),
                children: [],
                proccode: procedure.procCode.join(' '),
                tagName: 'mutation',
                warp: 'false'
            };

            converter._restoreContext({localVariables: saved.localVariables});

            return block;
        });
    }
};

export default MyBlocksConverter;
