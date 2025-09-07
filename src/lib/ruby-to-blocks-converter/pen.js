import _ from 'lodash';

const Pen = 'pen';

/**
 * Pen converter
 */
const PenConverter = {
    register: function (converter) {
        converter.registerCallMethod('::Pen', 'clear', 0, () =>
            converter.createBlock('pen_clear', 'statement')
        );

        // backward compatibility
        converter.registerCallMethod('self', 'pen_clear', 0, () =>
            converter.createBlock('pen_clear', 'statement')
        );

        converter.registerCallMethod('sprite', Pen, 0, params => {
            const {node} = params;
            return converter.createRubyExpressionBlock(Pen, node);
        });

        converter.registerCallMethod(Pen, 'stamp', 0, params => {
            const {receiver} = params;
            return converter.changeRubyExpressionBlock(receiver, 'pen_stamp', 'statement');
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_stamp', 0, () =>
            converter.createBlock('pen_stamp', 'statement')
        );

        converter.registerCallMethod(Pen, 'down', 0, params => {
            const {receiver} = params;
            return converter.changeRubyExpressionBlock(receiver, 'pen_penDown', 'statement');
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_down', 0, () =>
            converter.createBlock('pen_penDown', 'statement')
        );

        converter.registerCallMethod(Pen, 'up', 0, params => {
            const {receiver} = params;
            return converter.changeRubyExpressionBlock(receiver, 'pen_penUp', 'statement');
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_up', 0, () =>
            converter.createBlock('pen_penUp', 'statement')
        );

        converter.registerCallMethod(Pen, 'color=', 1, params => {
            const {receiver, args} = params;
            if (!converter.isNumberOrBlock(args[0]) && !converter.isColorOrBlock(args[0])) return null;

            if (converter.isNumberOrBlock(args[0])) {
                const block = converter.changeRubyExpressionBlock(receiver, 'pen_setPenColorParamTo', 'statement');
                converter.addFieldInput(
                    block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                    'color', 'color'
                );
                converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
                return block;
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'pen_setPenColorToColor', 'statement');
            converter.addFieldInput(block, 'COLOR', 'colour_picker', 'COLOUR', args[0], '#43066f');
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_color=', 1, params => {
            const {args} = params;

            if (converter.isNumberOrBlock(args[0])) {
                const block = converter.createBlock('pen_setPenColorParamTo', 'statement');
                converter.addFieldInput(
                    block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                    'color', 'color'
                );
                converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
                return block;
            } else if (converter.isColorOrBlock(args[0])) {
                const block = converter.createBlock('pen_setPenColorToColor', 'statement');
                converter.addFieldInput(block, 'COLOR', 'colour_picker', 'COLOUR', args[0], '#43066f');
                return block;
            }
            return null;
        });

        converter.registerCallMethod(Pen, 'saturation=', 1, params => {
            const {receiver, args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'pen_setPenColorParamTo', 'statement');
            converter.addFieldInput(
                block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                'saturation', 'color'
            );
            converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_saturation=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('pen_setPenColorParamTo', 'statement');
            converter.addFieldInput(
                block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                'saturation', 'color'
            );
            converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
            return block;
        });

        converter.registerCallMethod(Pen, 'brightness=', 1, params => {
            const {receiver, args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'pen_setPenColorParamTo', 'statement');
            converter.addFieldInput(
                block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                'brightness', 'color'
            );
            converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_brightness=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('pen_setPenColorParamTo', 'statement');
            converter.addFieldInput(
                block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                'brightness', 'color'
            );
            converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
            return block;
        });

        converter.registerCallMethod(Pen, 'transparency=', 1, params => {
            const {receiver, args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'pen_setPenColorParamTo', 'statement');
            converter.addFieldInput(
                block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                'transparency', 'color'
            );
            converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_transparency=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('pen_setPenColorParamTo', 'statement');
            converter.addFieldInput(
                block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                'transparency', 'color'
            );
            converter.addNumberInput(block, 'VALUE', 'math_number', args[0], 50);
            return block;
        });

        converter.registerCallMethod(Pen, 'size=', 1, params => {
            const {receiver, args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'pen_setPenSizeTo', 'statement');
            converter.addNumberInput(block, 'SIZE', 'math_number', args[0], 1);
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('sprite', 'pen_size=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('pen_setPenSizeTo', 'statement');
            converter.addNumberInput(block, 'SIZE', 'math_number', args[0], 1);
            return block;
        });

        // for +=
        ['color', 'saturation', 'brightness', 'transparency', 'size'].forEach(methodName => {
            converter.registerCallMethod(Pen, methodName, 0, params => {
                const {receiver, node} = params;

                return converter.changeRubyExpression(receiver, node);
            });
        });
    },

    // eslint-disable-next-line no-unused-vars
    onOpAsgn: function (lh, operator, rh) {
        let block;
        if (this.isRubyExpression(lh) && operator === '+' && this._isNumberOrBlock(rh)) {
            const code = this.getRubyExpression(lh);
            switch (code) {
            case 'pen.size':
                block = this.changeRubyExpressionBlock(lh, 'pen_changePenSizeBy', 'statement');
                this.addNumberInput(block, 'SIZE', 'math_number', rh, 1);
                break;
            case 'pen.color':
            case 'pen.saturation':
            case 'pen.brightness':
            case 'pen.transparency':
                block = this.changeRubyExpressionBlock(lh, 'pen_changePenColorParamBy', 'statement');

                this.addFieldInput(
                    block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                    code.replace('pen.', ''), 'color'
                );
                this.addNumberInput(block, 'VALUE', 'math_number', rh, 10);
                break;
            }
        } else if (this._isRubyStatement(lh) && operator === '+' && this._isNumberOrBlock(rh)) {
            const code = this._getRubyStatement(lh);
            switch (code) {
            case 'self.pen_size':
                block = this._changeBlock(lh, 'pen_changePenSizeBy', 'statement');
                delete this._context.blocks[block.inputs.STATEMENT.block];
                delete block.inputs.STATEMENT;

                this._addNumberInput(block, 'SIZE', 'math_number', rh, 1);
                break;
            case 'self.pen_color':
            case 'self.pen_saturation':
            case 'self.pen_brightness':
            case 'self.pen_transparency':
                block = this._changeBlock(lh, 'pen_changePenColorParamBy', 'statement');
                delete this._context.blocks[block.inputs.STATEMENT.block];
                delete block.inputs.STATEMENT;

                this._addFieldInput(
                    block, 'COLOR_PARAM', 'pen_menu_colorParam', 'colorParam',
                    code.replace('self.pen_', ''), 'color'
                );
                this._addNumberInput(block, 'VALUE', 'math_number', rh, 10);
                break;
            }
        }
        return block;
    }
};

export default PenConverter;
