import _ from 'lodash';

/**
 * Boost converter
 */
const BoostConverter = {
    register: function (converter) {
        converter.registerOnSend('self', 'boost_motor_turn_on_for', 2, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('boost_motorOnFor', 'statement');
            converter.addInput(
                block,
                'MOTOR_ID',
                converter._createFieldBlock('boost_menu_MOTOR_ID', 'MOTOR_ID', args[0])
            );
            converter.addNumberInput(block, 'DURATION', 'math_number', args[1], 1);
            return block;
        });

        converter.registerOnSend('self', 'boost_motor_turn_on_for', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('boost_motorOn', 'statement');
            converter.addInput(
                block,
                'MOTOR_ID',
                converter._createFieldBlock('boost_menu_MOTOR_ID', 'MOTOR_ID', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'boost_motor_turn_this_way_for', 2, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('boost_motorOnForRotation', 'statement');
            converter.addInput(
                block,
                'MOTOR_ID',
                converter._createFieldBlock('boost_menu_MOTOR_ID', 'MOTOR_ID', args[0])
            );
            converter.addNumberInput(block, 'ROTATION', 'math_number', args[1], 1);
            return block;
        });

        converter.registerOnSend('self', 'boost_motor_turn_off_for', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('boost_motorOff', 'statement');
            converter.addInput(
                block,
                'MOTOR_ID',
                converter._createFieldBlock('boost_menu_MOTOR_ID', 'MOTOR_ID', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'boost_motor_set_power_for', 2, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('boost_setMotorPower', 'statement');
            converter.addInput(
                block,
                'MOTOR_ID',
                converter._createFieldBlock('boost_menu_MOTOR_ID', 'MOTOR_ID', args[0])
            );
            converter.addNumberInput(block, 'POWER', 'math_number', args[1], 100);
            return block;
        });

        converter.registerOnSend('self', 'boost_motor_set_direction_for', 2, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0]) || !converter.isStringOrBlock(args[1])) return null;

            const block = converter.createBlock('boost_setMotorDirection', 'statement');
            converter.addInput(
                block,
                'MOTOR_ID',
                converter._createFieldBlock('boost_menu_MOTOR_ID', 'MOTOR_ID', args[0])
            );
            converter.addInput(
                block,
                'MOTOR_DIRECTION',
                converter._createFieldBlock('boost_menu_MOTOR_DIRECTION', 'MOTOR_DIRECTION', args[1])
            );
            return block;
        });

        converter.registerOnSend('self', 'boost_motor_get_position', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('boost_getMotorPosition', 'value');
            converter.addInput(
                block,
                'MOTOR_REPORTER_ID',
                converter._createFieldBlock('boost_menu_MOTOR_REPORTER_ID', 'MOTOR_REPORTER_ID', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'boost_seeing_color?', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('boost_seeingColor', 'value_boolean');
            converter.addInput(
                block,
                'COLOR',
                converter._createFieldBlock('boost_menu_COLOR', 'COLOR', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'boost_get_tilt_angle', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('boost_getTiltAngle', 'value');
            converter.addInput(
                block,
                'TILT_DIRECTION',
                converter._createFieldBlock('boost_menu_TILT_DIRECTION', 'TILT_DIRECTION', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'boost_set_light_color', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('boost_setLightHue', 'statement');
            converter.addNumberInput(block, 'HUE', 'math_number', args[0], 100);
            return block;
        });

        converter.registerOnSendWithBlock('self', 'when', 2, 0, params => {
            const {args, rubyBlock} = params;

            if (args[0].type !== 'sym' || !converter.isStringOrBlock(args[1])) return null;

            let block;
            switch (args[0].value) {
            case 'boost_color':
                block = converter.createBlock('boost_whenColor', 'hat');
                converter.addInput(
                    block,
                    'COLOR',
                    converter._createFieldBlock('boost_menu_COLOR', 'COLOR', args[1])
                );
                converter.setParent(rubyBlock, block);
                break;
            case 'boost_tilted':
                block = converter.createBlock('boost_whenTilted', 'hat');
                converter.addInput(
                    block,
                    'TILT_DIRECTION_ANY',
                    converter._createFieldBlock('boost_menu_TILT_DIRECTION_ANY', 'TILT_DIRECTION_ANY', args[1])
                );
                converter.setParent(rubyBlock, block);
                break;
            }
            return block;
        });
    }
};

export default BoostConverter;
