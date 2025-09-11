import _ from 'lodash';

const Math = '::Math';
const MathE = '::Math::E';

/**
 * Operators converter
 */
const OperatorsConverter = {
    register: function (converter) {
        converter.registerOnSend('self', 'rand', 1, params => {
            const {args} = params;
            if (!converter._isBlock(args[0]) || args[0].opcode !== 'ruby_range') return null;

            return converter._changeBlock(args[0], 'operator_random', 'value');
        });

        converter.registerOnSend(['string', 'block'], '[]', 1, params => {
            const {receiver, args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;

            const block = converter._createBlock('operator_letter_of', 'value');
            converter._addTextInput(block, 'STRING', receiver, 'apple');
            let letter = args[0];
            if (converter._isNumber(args[0]) && !_.isNumber(args[0]) && args[0].type === 'int') {
                letter = letter.value + 1;
            }
            converter._addNumberInput(block, 'LETTER', 'math_number', letter, 1);
            return block;
        });

        converter.registerOnSend(['string', 'block'], 'length', 0, params => {
            const {receiver} = params;

            const block = converter._createBlock('operator_length', 'value');
            converter._addTextInput(block, 'STRING', receiver, 'apple');
            return block;
        });

        converter.registerOnSend(['string', 'block'], 'include?', 1, params => {
            const {receiver, args} = params;
            if (!converter._isStringOrBlock(args[0])) return null;

            const block = converter._createBlock('operator_contains', 'value');
            converter._addTextInput(block, 'STRING1', receiver, 'apple');
            converter._addTextInput(block, 'STRING2', args[0], 'a');
            return block;
        });

        ['+', '-', '*', '/', '%'].forEach(operator => {
            converter.registerOnSend(['variable', 'number', 'block'], operator, 1, params => {
                const {receiver, args} = params;
                let rh = args[0];
                if (_.isArray(rh)) {
                    if (rh.length !== 1) return null;
                    rh = rh[0];
                }

                if (!converter._isNumberOrBlock(rh)) return null;

                let opcode;
                if (operator === '+') {
                    opcode = 'operator_add';
                } else if (operator === '-') {
                    opcode = 'operator_subtract';
                } else if (operator === '*') {
                    opcode = 'operator_multiply';
                } else if (operator === '/') {
                    opcode = 'operator_divide';
                } else {
                    opcode = 'operator_mod';
                }

                const block = converter._createBlock(opcode, 'value');
                converter._addNumberInput(block, 'NUM1', 'math_number', receiver, '');
                converter._addNumberInput(block, 'NUM2', 'math_number', rh, '');
                return block;
            });
        });

        converter.registerOnSend(['variable', 'string', 'block'], '+', 1, params => {
            const {receiver, args} = params;
            let rh = args[0];
            if (_.isArray(rh)) {
                if (rh.length !== 1) return null;
                rh = rh[0];
            }

            if (!converter._isStringOrBlock(rh)) return null;

            const block = converter._createBlock('operator_join', 'value');
            converter._addTextInput(
                block, 'STRING1', converter._isNumber(receiver) ? receiver.toString() : receiver, 'apple'
            );
            converter._addTextInput(block, 'STRING2', converter._isNumber(rh) ? rh.toString() : rh, 'banana');
            return block;
        });

        ['>', '<', '=='].forEach(operator => {
            converter.registerOnSend('any', operator, 1, params => {
                const {receiver, args} = params;
                let rh = args[0];
                if (_.isArray(rh)) {
                    if (rh.length !== 1) return null;
                    rh = rh[0];
                }

                let opcode;
                if (operator === '>') {
                    opcode = 'operator_gt';
                } else if (operator === '<') {
                    opcode = 'operator_lt';
                } else {
                    opcode = 'operator_equals';
                }

                const block = converter._createBlock(opcode, 'value_boolean');
                converter._addTextInput(
                    block, 'OPERAND1', converter._isNumber(receiver) ? receiver.toString() : receiver, ''
                );
                converter._addTextInput(block, 'OPERAND2', converter._isNumber(rh) ? rh.toString() : rh, '50');
                return block;
            });
        });

        converter.registerOnSend(['variable', 'boolean', 'block'], '!', 0, params => {
            const {receiver} = params;

            const block = converter._createBlock('operator_not', 'value_boolean');
            if (!converter._isFalse(receiver)) {
                converter._addInput(
                    block,
                    'OPERAND',
                    converter._createTextBlock(converter._isNumber(receiver) ? receiver.toString() : receiver)
                );
            }
            return block;
        });

        converter.registerOnSend(['variable', 'number', 'block'], 'round', 0, params => {
            const {receiver} = params;

            const block = converter._createBlock('operator_round', 'value');
            converter._addNumberInput(block, 'NUM', 'math_number', receiver, '');
            return block;
        });

        ['abs', 'floor', 'ceil'].forEach(methodName => {
            converter.registerOnSend(['variable', 'number', 'block'], methodName, 0, params => {
                const {receiver} = params;

                let operator = methodName;
                if (methodName === 'ceil') {
                    operator = 'ceiling';
                }
                const block = converter._createBlock('operator_mathop', 'value');
                converter._addField(block, 'OPERATOR', operator);
                converter._addNumberInput(block, 'NUM', 'math_number', receiver, '');
                return block;
            });
        });

        ['sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'log10'].forEach(methodName => {
            converter.registerOnSend(Math, methodName, 1, params => {
                const {args} = params;
                let rh = args[0];
                if (_.isArray(rh)) {
                    if (rh.length !== 1) return null;
                    rh = rh[0];
                }

                if (!converter._isNumberOrBlock(rh)) return null;

                let operator;
                switch (methodName) {
                case 'log':
                    operator = 'ln';
                    break;
                case 'log10':
                    operator = 'log';
                    break;
                default:
                    operator = methodName;
                }
                const block = converter._createBlock('operator_mathop', 'value');
                converter._addField(block, 'OPERATOR', operator);
                converter._addNumberInput(block, 'NUM', 'math_number', rh, '');
                return block;
            });
        });

        converter.registerOnSend(MathE, '**', 1, params => {
            const {args} = params;
            let rh = args[0];
            if (_.isArray(rh)) {
                if (rh.length !== 1) return null;
                rh = rh[0];
            }

            if (!converter._isNumberOrBlock(rh)) return null;

            const block = converter._createBlock('operator_mathop', 'value');
            converter._addField(block, 'OPERATOR', 'e ^');
            converter._addNumberInput(block, 'NUM', 'math_number', rh, '');
            return block;
        });

        converter.registerOnSend('number', '**', 1, params => {
            const {receiver, args} = params;
            let rh = args[0];
            if (_.isArray(rh)) {
                if (rh.length !== 1) return null;
                rh = rh[0];
            }

            if (!receiver.value === 10) return null;
            if (!converter._isNumberOrBlock(rh)) return null;

            const block = converter._createBlock('operator_mathop', 'value');
            converter._addField(block, 'OPERATOR', '10 ^');
            converter._addNumberInput(block, 'NUM', 'math_number', rh, '');
            return block;
        });

        // Register onXxx handlers
        converter.registerOnAnd(operands => {
            const block = converter._createBlock('operator_and', 'value_boolean');
            operands.forEach(o => {
                if (o) {
                    o.parent = block.id;
                }
            });
            if (!converter._isFalse(operands[0])) {
                converter._addInput(block, 'OPERAND1', converter._createTextBlock(operands[0]));
            }
            if (!converter._isFalse(operands[1])) {
                converter._addInput(block, 'OPERAND2', converter._createTextBlock(operands[1]));
            }
            return block;
        });

        converter.registerOnOr(operands => {
            const block = converter._createBlock('operator_or', 'value_boolean');
            operands.forEach(o => {
                if (o) {
                    o.parent = block.id;
                }
            });
            if (!converter._isFalse(operands[0])) {
                converter._addInput(block, 'OPERAND1', converter._createTextBlock(operands[0]));
            }
            if (!converter._isFalse(operands[1])) {
                converter._addInput(block, 'OPERAND2', converter._createTextBlock(operands[1]));
            }
            return block;
        });
    }
};

export default OperatorsConverter;
