import _ from 'lodash';

/**
 * Variables converter
 */
const VariablesConverter = {
    register: function (converter) {
        converter.registerOnSend('self', 'show_variable', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            const variable = converter._lookupOrCreateVariable(args[0]);
            if (variable.scope !== 'local') {
                return converter._createBlock('data_showvariable', 'statement', {
                    fields: {
                        VARIABLE: {
                            name: 'VARIABLE',
                            id: variable.id,
                            value: variable.name,
                            variableType: variable.type
                        }
                    }
                });
            }
            return null;
        });

        converter.registerOnSend('self', 'hide_variable', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            const variable = converter._lookupOrCreateVariable(args[0]);
            if (variable.scope !== 'local') {
                return converter._createBlock('data_hidevariable', 'statement', {
                    fields: {
                        VARIABLE: {
                            name: 'VARIABLE',
                            id: variable.id,
                            value: variable.name,
                            variableType: variable.type
                        }
                    }
                });
            }
            return null;
        });

        converter.registerOnSend('self', 'list', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            const variable = converter._lookupOrCreateList(args[0]);
            if (variable.scope !== 'local') {
                return converter._createBlock('data_listcontents', 'value_variable', {
                    fields: {
                        LIST: {
                            name: 'LIST',
                            id: variable.id,
                            value: variable.name,
                            variableType: variable.type
                        }
                    }
                });
            }
            return null;
        });

        converter.registerOnSend('self', 'show_list', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            const variable = converter._lookupOrCreateList(args[0]);
            if (variable.scope !== 'local') {
                return converter._createBlock('data_showlist', 'statement', {
                    fields: {
                        LIST: {
                            name: 'LIST',
                            id: variable.id,
                            value: variable.name,
                            variableType: variable.type
                        }
                    }
                });
            }
            return null;
        });

        converter.registerOnSend('self', 'hide_list', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            const variable = converter._lookupOrCreateList(args[0]);
            if (variable.scope !== 'local') {
                return converter._createBlock('data_hidelist', 'statement', {
                    fields: {
                        LIST: {
                            name: 'LIST',
                            id: variable.id,
                            value: variable.name,
                            variableType: variable.type
                        }
                    }
                });
            }
            return null;
        });

        converter.registerOnSend('variable', 'push', 1, params => {
            const {receiver, args} = params;
            if (!converter._isStringOrBlock(args[0]) && !converter._isNumberOrBlock(args[0])) return null;

            const block = converter._changeBlock(receiver, 'data_addtolist', 'statement');
            converter._addTextInput(
                block, 'ITEM', converter._isNumber(args[0]) ? args[0].toString() : args[0], 'thing'
            );
            return block;
        });

        converter.registerOnSend('variable', 'delete_at', 1, params => {
            const {receiver, args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;

            const block = converter._changeBlock(receiver, 'data_deleteoflist', 'statement');
            converter._addNumberInput(block, 'INDEX', 'math_integer', args[0], 1);
            return block;
        });

        converter.registerOnSend('variable', 'clear', 0, params => {
            const {receiver} = params;
            return converter._changeBlock(receiver, 'data_deletealloflist', 'statement');
        });

        converter.registerOnSend('variable', 'insert', 2, params => {
            const {receiver, args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;
            if (!converter._isStringOrBlock(args[1]) && !converter._isNumberOrBlock(args[1])) return null;

            const block = converter._changeBlock(receiver, 'data_insertatlist', 'statement');
            converter._addNumberInput(block, 'INDEX', 'math_integer', args[0], 1);
            converter._addTextInput(
                block, 'ITEM', converter._isNumber(args[1]) ? args[1].toString() : args[1], 'thing'
            );
            return block;
        });

        converter.registerOnSend('variable', '[]=', 2, params => {
            const {receiver, args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;
            if (!converter._isStringOrBlock(args[1]) && !converter._isNumberOrBlock(args[1])) return null;

            const block = converter._changeBlock(receiver, 'data_replaceitemoflist', 'statement');
            converter._addNumberInput(block, 'INDEX', 'math_integer', args[0], 1);
            converter._addTextInput(
                block, 'ITEM', converter._isNumber(args[1]) ? args[1].toString() : args[1], 'thing'
            );
            return block;
        });

        converter.registerOnSend('variable', '[]', 1, params => {
            const {receiver, args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;

            const block = converter._changeBlock(receiver, 'data_itemoflist', 'value');
            converter._addNumberInput(block, 'INDEX', 'math_integer', args[0], 1);
            return block;
        });

        converter.registerOnSend('variable', 'index', 1, params => {
            const {receiver, args} = params;
            if (!converter._isStringOrBlock(args[0]) && !converter._isNumberOrBlock(args[0])) return null;

            const block = converter._changeBlock(receiver, 'data_itemnumoflist', 'value');
            converter._addTextInput(
                block, 'ITEM', converter._isNumber(args[0]) ? args[0].toString() : args[0], 'thing'
            );
            return block;
        });

        converter.registerOnSend('variable', 'length', 0, params => {
            const {receiver} = params;
            return converter._changeBlock(receiver, 'data_lengthoflist', 'value');
        });

        converter.registerOnSend('variable', 'include?', 1, params => {
            const {receiver, args} = params;
            if (!converter._isStringOrBlock(args[0]) && !converter._isNumberOrBlock(args[0])) return null;

            const block = converter._changeBlock(receiver, 'data_listcontainsitem', 'value');
            converter._addTextInput(
                block, 'ITEM', converter._isNumber(args[0]) ? args[0].toString() : args[0], 'thing'
            );
            return block;
        });

        // Register onXxx handlers
        converter.registerOnOpAsgn((lh, operator, rh) => {
            let block;
            if (operator === '+' && converter._isString(lh) && converter._isNumberOrBlock(rh)) {
                const variable = converter._lookupOrCreateVariable(lh);
                if (variable.scope !== 'local') {
                    block = converter._createBlock('data_changevariableby', 'statement', {
                        fields: {
                            VARIABLE: {
                                name: 'VARIABLE',
                                id: variable.id,
                                value: variable.name,
                                variableType: variable.type
                            }
                        }
                    });
                    converter._addNumberInput(block, 'VALUE', 'math_number', rh, 1);
                }
            }
            return block;
        });

        converter.registerOnVar((scope, variable) => {
            if (scope === 'global' || scope === 'instance') {
                return converter._createBlock('data_variable', 'value_variable', {
                    fields: {
                        VARIABLE: {
                            name: 'VARIABLE',
                            id: variable.id,
                            value: variable.name,
                            variableType: variable.type
                        }
                    }
                });
            }
            return null;
        });

        converter.registerOnVasgn((scope, variable, rh) => {
            if (scope === 'global' || scope === 'instance') {
                if (converter._isNumberOrBlock(rh) || converter._isStringOrBlock(rh)) {
                    const block = converter._createBlock('data_setvariableto', 'statement', {
                        fields: {
                            VARIABLE: {
                                name: 'VARIABLE',
                                id: variable.id,
                                value: variable.name,
                                variableType: variable.type
                            }
                        }
                    });
                    converter._addTextInput(block, 'VALUE', converter._isNumber(rh) ? rh.toString() : rh, '0');
                    return block;
                }
            }
            return null;
        });
    }
};

export default VariablesConverter;
