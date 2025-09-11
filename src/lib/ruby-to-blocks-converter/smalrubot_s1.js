import _ from 'lodash';

const SmalrubotS1 = 'smalrubot_s1';

const ACTIONS = [
    'forward',
    'backward',
    'left',
    'right',
    'stop'
];

const POSITIONS = [
    'left',
    'right'
];

const SENSOR_POSITIONS = [
    'left',
    'right',
    'touch',
    'light',
    'sound'
];

/**
 * Smalrubot S1 extension converter
 */
const SmalrubotS1Converter = {
    register: function (converter) {
        // Create the initial Ruby expression block
        converter.registerOnSend('self', SmalrubotS1, 0, params => {
            const {node} = params;
            
            return converter.createRubyExpressionBlock(SmalrubotS1, node);
        });

        // Method calls on smalrubot_s1
        converter.registerOnSend(SmalrubotS1, 'action', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isString(args[0]) || !ACTIONS.includes(args[0].toString())) return null;
            
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_action', 'statement'
            );
            converter.addField(block, 'ACTION', args[0]);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'action', 2, params => {
            const {receiver, args} = params;
            
            if (!converter.isString(args[0]) || !ACTIONS.includes(args[0].toString()) ||
                !converter.isNumberOrBlock(args[1])) return null;
                
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_actionAndStopAfter', 'statement'
            );
            converter.addField(block, 'ACTION', args[0]);
            converter.addNumberInput(block, 'SECS', 'math_number', args[1], 0.5);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'bend_arm', 2, params => {
            const {receiver, args} = params;
            
            if (!converter.isNumberOrBlock(args[0]) || !converter.isNumberOrBlock(args[1])) return null;
            
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_bendArm', 'statement'
            );
            converter.addNumberInput(block, 'DEGREE', 'math_number', args[0], 90);
            converter.addNumberInput(block, 'SECS', 'math_number', args[1], 1);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'sensor_value', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isString(args[0]) || !SENSOR_POSITIONS.includes(args[0].toString())) return null;
            
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_getSensorValue', 'value'
            );
            converter.addField(block, 'POSITION', args[0]);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'led', 2, params => {
            const {receiver, args} = params;
            
            if (!converter.isString(args[0]) || !POSITIONS.includes(args[0].toString()) ||
                (!converter.isTrue(args[1]) && !converter.isFalse(args[1]))) return null;
                
            let opcode = 'smalrubotS1_turnLedOn';
            if (converter.isFalse(args[1])) {
                opcode = 'smalrubotS1_turnLedOff';
            }
            const block = converter.changeRubyExpressionBlock(
                receiver, opcode, 'statement'
            );
            converter.addField(block, 'POSITION', args[0]);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'get_motor_speed', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isString(args[0]) || !POSITIONS.includes(args[0].toString())) return null;
            
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_getMotorSpeed', 'value'
            );
            converter.addField(block, 'POSITION', args[0]);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'set_motor_speed', 2, params => {
            const {receiver, args} = params;
            
            if (!converter.isString(args[0]) || !POSITIONS.includes(args[0].toString()) ||
                !converter.isNumberOrBlock(args[1])) return null;
                
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_setMotorSpeed', 'statement'
            );
            converter.addField(block, 'POSITION', args[0]);
            converter.addNumberInput(block, 'SPEED', 'math_number', args[1], 100);
            return block;
        });

        converter.registerOnSend(SmalrubotS1, 'arm_calibration=', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isNumberOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(
                receiver, 'smalrubotS1_setArmCalibration', 'statement'
            );
            converter.addNumberInput(block, 'DEGREE', 'math_number', args[0], 0);
            return block;
        });
    }
};

export default SmalrubotS1Converter;
