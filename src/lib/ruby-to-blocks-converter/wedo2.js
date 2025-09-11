import Primitive from './primitive';

const Wedo2 = 'wedo2';

const MotorIdMenu = [
    'motor',
    'motor A',
    'motor B',
    'all motors'
];
const MotorIdMenuLower = MotorIdMenu.map(x => x.toLowerCase());

const MotorDirectionMenu = [
    'this way',
    'that way',
    'reverse'
];

const OpMenu = [
    '<',
    '>'
];

const TiltDirectionAnyMenu = [
    'up',
    'down',
    'left',
    'right',
    'any'
];

const TiltDirectionMenu = TiltDirectionAnyMenu.slice(0, 4);

/**
 * Wedo2 converter
 */
const Wedo2Converter = {
    register: function (converter) {
        converter.registerOnSend('self', Wedo2, 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(Wedo2, node);
        });

        converter.registerOnSend(Wedo2, 'turn_on_for', 2, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = MotorIdMenuLower.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', MotorIdMenu[index], args[0].node);
            }
            if (!converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_motorOnFor', 'statement');
            converter.addFieldInput(
                block, 'MOTOR_ID', 'wedo2_menu_MOTOR_ID', 'MOTOR_ID', args[0], 'motor'
            );
            converter.addNumberInput(block, 'DURATION', 'math_number', args[1], 1);
            return block;
        });

        const createMotorToggleBlock = (opcode, params) => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = MotorIdMenuLower.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', MotorIdMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, opcode, 'statement');
            converter.addFieldInput(
                block, 'MOTOR_ID', 'wedo2_menu_MOTOR_ID', 'MOTOR_ID', args[0], 'motor'
            );
            return block;
        };
        converter.registerOnSend(Wedo2, 'turn_on', 1, params => createMotorToggleBlock('wedo2_motorOn', params));
        converter.registerOnSend(Wedo2, 'turn_off', 1, params => createMotorToggleBlock('wedo2_motorOff', params));

        converter.registerOnSend(Wedo2, 'set_power', 2, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = MotorIdMenuLower.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', MotorIdMenu[index], args[0].node);
            }
            if (!converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_startMotorPower', 'statement');
            converter.addFieldInput(
                block, 'MOTOR_ID', 'wedo2_menu_MOTOR_ID', 'MOTOR_ID', args[0], 'motor'
            );
            converter.addNumberInput(block, 'POWER', 'math_number', args[1], 100);
            return block;
        });

        converter.registerOnSend(Wedo2, 'set_direction', 2, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = MotorIdMenuLower.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', MotorIdMenu[index], args[0].node);
            }
            if (!converter.isStringOrBlock(args[1])) return null;
            if (converter.isString(args[1])) {
                const index = MotorDirectionMenu.indexOf(args[1].toString().toLowerCase());
                if (index < 0) return null;

                args[1] = new Primitive('str', MotorDirectionMenu[index], args[1].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_setMotorDirection', 'statement');
            converter.addFieldInput(
                block, 'MOTOR_ID', 'wedo2_menu_MOTOR_ID', 'MOTOR_ID', args[0], 'motor'
            );
            converter.addFieldInput(
                block, 'MOTOR_DIRECTION', 'wedo2_menu_MOTOR_DIRECTION', 'MOTOR_DIRECTION', args[1], 'this way'
            );
            return block;
        });

        converter.registerOnSend(Wedo2, 'light_color=', 1, params => {
            const {receiver, args} = params;

            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_setLightHue', 'statement');
            converter.addNumberInput(block, 'HUE', 'math_number', args[0], 50);
            return block;
        });

        converter.registerOnSendWithBlock(Wedo2, 'when_distance', 2, 0, params => {
            const {receiver, args, rubyBlock} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0]) && OpMenu.indexOf(args[0].toString()) < 0) return null;
            if (!converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_whenDistance', 'hat');
            converter.addFieldInput(block, 'OP', 'wedo2_menu_OP', 'OP', args[0], '<');
            converter.addNumberInput(block, 'REFERENCE', 'math_number', args[1], 50);
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock(Wedo2, 'when_tilted', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = TiltDirectionAnyMenu.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', TiltDirectionAnyMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_whenTilted', 'hat');
            converter.addFieldInput(
                block, 'TILT_DIRECTION_ANY', 'wedo2_menu_TILT_DIRECTION_ANY', 'TILT_DIRECTION_ANY', args[0], 'any'
            );
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSend(Wedo2, 'distance', 0, params => {
            const {receiver} = params;

            return converter.changeRubyExpressionBlock(receiver, 'wedo2_getDistance', 'value');
        });

        converter.registerOnSend(Wedo2, 'tilted?', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = TiltDirectionAnyMenu.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', TiltDirectionAnyMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_isTilted', 'value_boolean');
            converter.addFieldInput(
                block, 'TILT_DIRECTION_ANY', 'wedo2_menu_TILT_DIRECTION_ANY', 'TILT_DIRECTION_ANY', args[0], 'any'
            );
            return block;
        });

        converter.registerOnSend(Wedo2, 'tilt_angle', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = TiltDirectionMenu.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', TiltDirectionMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'wedo2_getTiltAngle', 'value_boolean');
            converter.addFieldInput(
                block, 'TILT_DIRECTION', 'wedo2_menu_TILT_DIRECTION', 'TILT_DIRECTION', args[0], 'up'
            );
            return block;
        });
    }
};

export default Wedo2Converter;
