import _ from 'lodash';

const Ev3 = 'ev3';
const Ev3MotorMenu = ['A', 'B', 'C', 'D'];
const Ev3SensorMenu = ['1', '2', '3', '4'];

/**
 * EV3 converter
 */
const EV3Converter = {
    register: function (converter) {
        converter.registerCallMethod('self', Ev3, 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(Ev3, node);
        });

        converter.registerCallMethod(Ev3, 'motor_turn_this_way_for', 2, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_motorTurnClockwise', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 1);
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('self', 'ev3_motor_turn_this_way_for', 2, params => {
            const {args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('ev3_motorTurnClockwise', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 1);
            return block;
        });

        converter.registerCallMethod(Ev3, 'motor_turn_that_way_for', 2, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_motorTurnCounterClockwise', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 1);
            return block;
        });

        converter.registerCallMethod(Ev3, 'motor_turn_that_way_for', 2, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_motorTurnCounterClockwise', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 1);
            return block;
        });

        converter.registerCallMethod(Ev3, 'motor_turn_that_way_for', 2, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_motorTurnCounterClockwise', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 1);
            return block;
        });


        // backward compatibility
        converter.registerCallMethod('self', 'ev3_motor_turn_that_way_for', 2, params => {
            const {args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('ev3_motorTurnCounterClockwise', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 1);
            return block;
        });

        converter.registerCallMethod(Ev3, 'motor_set_power', 2, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_motorSetPower', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'POWER', 'math_number', args[1], 100);
            return block;
        });


        // backward compatibility
        converter.registerCallMethod('self', 'ev3_motor_set_power', 2, params => {
            const {args} = params;

            if (!converter.isString(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('ev3_motorSetPower', 'statement');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            converter.addNumberInput(block, 'POWER', 'math_number', args[1], 100);
            return block;
        });

        converter.registerCallMethod(Ev3, 'motor_position', 1, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_getMotorPosition', 'value');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('self', 'ev3_motor_position', 1, params => {
            const {args} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.createBlock('ev3_getMotorPosition', 'value');
            const motor = Ev3MotorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_motorPorts', 'motorPorts', motor.toString())
            );
            return block;
        });

        converter.registerCallMethod(Ev3, 'button_pressed?', 1, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_buttonPressed', 'value_boolean');
            const sensor = Ev3SensorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_sensorPorts', 'sensorPorts', sensor.toString())
            );
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('self', 'ev3_button_pressed?', 1, params => {
            const {args} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.createBlock('ev3_buttonPressed', 'value_boolean');
            const sensor = Ev3SensorMenu.indexOf(args[0].toString());
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_sensorPorts', 'sensorPorts', sensor.toString())
            );
            return block;
        });

        converter.registerCallMethod(Ev3, 'distance', 0, params => {
            const {receiver} = params;

            return converter.changeRubyExpressionBlock(receiver, 'ev3_getDistance', 'value');
        });

        // backward compatibility
        converter.registerCallMethod('self', 'ev3_distance', 0, () =>
            converter.createBlock('ev3_getDistance', 'value')
        );

        converter.registerCallMethod(Ev3, 'brightness', 0, params => {
            const {receiver} = params;

            return converter.changeRubyExpressionBlock(receiver, 'ev3_getBrightness', 'value');
        });

        // backward compatibility
        converter.registerCallMethod('self', 'ev3_brightness', 0, () =>
            converter.createBlock('ev3_getBrightness', 'value')
        );

        converter.registerCallMethod(Ev3, 'beep_note', 2, params => {
            const {receiver, args} = params;

            if (!converter.isNumberOrBlock(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_beep', 'statement');
            converter.addNoteInput(block, 'NOTE', args[0], 60);
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 0.5);
            return block;
        });

        // backward compatibility
        converter.registerCallMethod('self', 'ev3_beep_note', 2, params => {
            const {args} = params;

            if (!converter.isNumberOrBlock(args[0]) || !converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('ev3_beep', 'statement');
            converter.addNoteInput(block, 'NOTE', args[0], 60);
            converter.addNumberInput(block, 'TIME', 'math_number', args[1], 0.5);
            return block;
        });

        converter.registerCallMethodWithBlock(Ev3, 'when_button_pressed', 1, 0, params => {
            console.log(Ev3, 'when_button_pressed', 1, 0, params);
            const {receiver, args, rubyBlock} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            console.log('a');

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_whenButtonPressed', 'hat');
            console.log('b');
            const sensor = Ev3SensorMenu.indexOf(args[0].toString());
            console.log('c');
            converter.addInput(
                block,
                'PORT',
                converter.createFieldBlock('ev3_menu_sensorPorts', 'sensorPorts', sensor.toString())
            );
            console.log('d');
            converter.setParent(rubyBlock, block);
            console.log('e');
            return block;
        });

        converter.registerCallMethodWithBlock(Ev3, 'when_distance_lt', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;

            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_whenDistanceLessThan', 'hat');
            converter.addNumberInput(block, 'DISTANCE', 'math_number', args[0], 5);
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerCallMethodWithBlock(Ev3, 'when_brightness_lt', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;

            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'ev3_whenBrightnessLessThan', 'hat');
            converter.addNumberInput(block, 'DISTANCE', 'math_number', args[0], 50);
            converter.setParent(rubyBlock, block);
            return block;
        });

        // backward compatibility
        converter.registerCallMethodWithBlock('self', 'when', 2, 0, params => {
            const {args, rubyBlock} = params;

            if (args[0].type !== 'sym') return null;

            let block;
            switch (args[0].value) {
            case 'ev3_button_pressed': {
                if (!converter.isStringOrBlock(args[1])) return null;

                block = converter.createBlock('ev3_whenButtonPressed', 'hat');
                const sensor = Ev3SensorMenu.indexOf(args[1].toString());
                converter.addInput(
                    block,
                    'PORT',
                    converter.createFieldBlock('ev3_menu_sensorPorts', 'sensorPorts', sensor.toString())
                );
                converter.setParent(rubyBlock, block);
                break;
            }

            case 'ev3_distance_gt':
                if (!converter.isNumberOrBlock(args[1])) return null;

                block = converter.createBlock('ev3_whenDistanceLessThan', 'hat');
                converter.addNumberInput(block, 'DISTANCE', 'math_number', args[1], 5);
                converter.setParent(rubyBlock, block);
                break;

            case 'ev3_brightness_gt':
                if (!converter.isNumberOrBlock(args[1])) return null;

                block = converter.createBlock('ev3_whenBrightnessLessThan', 'hat');
                converter.addNumberInput(block, 'DISTANCE', 'math_number', args[1], 50);
                converter.setParent(rubyBlock, block);
                break;
            }

            return block;
        });
    }
};

export default EV3Converter;
