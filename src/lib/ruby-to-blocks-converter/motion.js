import _ from 'lodash';
import {RubyToBlocksConverterError} from './errors';

const RotationStyle = [
    'left-right',
    'don\'t rotate',
    'all around'
];

/**
 * Motion converter
 */
const MotionConverter = {
    register: function (converter) {
        // move(steps)
        converter.registerOnSend('sprite', 'move', 1, params => {
            const {args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;

            const block = converter._createBlock('motion_movesteps', 'statement');
            converter._addNumberInput(block, 'STEPS', 'math_number', args[0], 10);
            return block;
        });

        // turn_right(degrees) and turn_left(degrees)
        ['turn_right', 'turn_left'].forEach(methodName => {
            converter.registerOnSend('sprite', methodName, 1, params => {
                const {args} = params;
                if (!converter._isNumberOrBlock(args[0])) return null;

                const opcode = methodName === 'turn_right' ? 'motion_turnright' : 'motion_turnleft';
                const block = converter._createBlock(opcode, 'statement');
                converter._addNumberInput(block, 'DEGREES', 'math_number', args[0], 15);
                return block;
            });
        });

        // go_to(target)
        converter.registerOnSend('sprite', 'go_to', 1, params => {
            const {args} = params;
            if (converter._isString(args[0])) {
                const block = converter._createBlock('motion_goto', 'statement');
                converter._addInput(block, 'TO', converter._createFieldBlock('motion_goto_menu', 'TO', args[0]));
                return block;
            } else if (converter._isArray(args[0]) && args[0].length === 2 &&
                       converter._isNumberOrBlock(args[0].value[0]) && converter._isNumberOrBlock(args[0].value[1])) {
                const block = converter._createBlock('motion_gotoxy', 'statement');
                converter._addNumberInput(block, 'X', 'math_number', args[0].value[0], 0);
                converter._addNumberInput(block, 'Y', 'math_number', args[0].value[1], 0);
                return block;
            }
            return null;
        });

        // glide(target, secs: duration)
        converter.registerOnSend('sprite', 'glide', 2, params => {
            const {args} = params;
            if (args.length !== 2 || !converter._isHash(args[1]) || args[1].size !== 1) return null;

            const secs = args[1].get('sym:secs');
            if (!converter._isNumberOrBlock(secs)) return null;

            let block;
            if (converter._isString(args[0])) {
                block = converter._createBlock('motion_glideto', 'statement');
                converter._addInput(block, 'TO', converter._createFieldBlock('motion_glideto_menu', 'TO', args[0]));
            } else if (converter._isArray(args[0]) && args[0].length === 2 &&
                       converter._isNumberOrBlock(args[0].value[0]) && converter._isNumberOrBlock(args[0].value[1])) {
                block = converter._createBlock('motion_glidesecstoxy', 'statement');
                converter._addNumberInput(block, 'X', 'math_number', args[0].value[0], 0);
                converter._addNumberInput(block, 'Y', 'math_number', args[0].value[1], 0);
            } else {
                return null;
            }

            if (block) {
                converter._addNumberInput(block, 'SECS', 'math_number', secs, 1);
            }
            return block;
        });

        // direction = value
        converter.registerOnSend('sprite', 'direction=', 1, params => {
            const {args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;

            const block = converter._createBlock('motion_pointindirection', 'statement');
            converter._addNumberInput(block, 'DIRECTION', 'math_angle', args[0], 90);
            return block;
        });

        // point_towards(target)
        converter.registerOnSend('sprite', 'point_towards', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            const block = converter._createBlock('motion_pointtowards', 'statement');
            converter._addInput(
                block,
                'TOWARDS',
                converter._createFieldBlock('motion_pointtowards_menu', 'TOWARDS', args[0])
            );
            return block;
        });

        // bounce_if_on_edge()
        converter.registerOnSend('sprite', 'bounce_if_on_edge', 0, () =>
            converter._createBlock('motion_ifonedgebounce', 'statement'));

        // rotation_style = value
        converter.registerOnSend('sprite', 'rotation_style=', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0]) || RotationStyle.indexOf(args[0].toString()) < 0) return null;

            const block = converter._createBlock('motion_setrotationstyle', 'statement');
            converter._addField(block, 'STYLE', args[0]);
            return block;
        });

        // x = value and y = value
        ['x=', 'y='].forEach(methodName => {
            converter.registerOnSend('sprite', methodName, 1, params => {
                const {args} = params;
                if (!converter._isNumberOrBlock(args[0])) return null;

                const xy = methodName === 'x=' ? 'x' : 'y';
                const block = converter._createBlock(`motion_set${xy}`, 'statement');
                converter._addNumberInput(block, _.toUpper(xy), 'math_number', args[0], 0);
                return block;
            });
        });

        // x and y position getters
        ['x', 'y'].forEach(methodName => {
            converter.registerOnSend('sprite', methodName, 0, () =>
                converter._createBlock(`motion_${methodName}position`, 'value'));
        });

        // direction getter
        converter.registerOnSend('sprite', 'direction', 0, () =>
            converter._createBlock('motion_direction', 'value'));

        // Register onXxx handlers
        converter.registerOnOpAsgn((lh, operator, rh) => {
            let block;
            if (converter._isBlock(lh) && operator === '+' && converter._isNumberOrBlock(rh)) {
                let xy;
                switch (lh.opcode) {
                case 'motion_xposition':
                case 'motion_yposition':
                    // All Motion blocks are sprite-only
                    if (converter._isStage()) {
                        throw new RubyToBlocksConverterError(lh.node, 'Stage selected: no motion blocks');
                    }
                    if (lh.opcode === 'motion_xposition') {
                        xy = 'x';
                    } else {
                        xy = 'y';
                    }
                    block = converter._changeBlock(lh, `motion_change${xy}by`, 'statement');
                    converter._addNumberInput(block, `D${_.toUpper(xy)}`, 'math_number', rh, 10);
                    break;
                }
            }
            return block;
        });
    }
};

export default MotionConverter;
