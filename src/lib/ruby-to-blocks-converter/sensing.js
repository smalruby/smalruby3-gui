import _ from 'lodash';
import {KeyOptions} from './constants';

const DragMode = [
    'draggable',
    'not draggable'
];

const TimeNow = '::Time.now';
const TimeNowWday = 'Time.now.wday';

const spriteCall = function (name) {
    return `sprite("${name.toString()}")`;
};

const Stage = 'stage';
/* eslint-enable no-invalid-this */

/**
 * Sensing converter
 */
const SensingConverter = {
    register: function (converter) {
        // Simple getters with no arguments
        const simpleGetters = [
            {method: 'answer', opcode: 'sensing_answer'},
            {method: 'loudness', opcode: 'sensing_loudness'},
            {method: 'days_since_2000', opcode: 'sensing_dayssince2000'},
            {method: 'user_name', opcode: 'sensing_username'}
        ];

        simpleGetters.forEach(({method, opcode}) => {
            converter.registerOnSend('self', method, 0, () =>
                converter.createBlock(opcode, 'value')
            );
        });

        // Mouse methods
        const mouseGetters = [
            {method: 'down?', opcode: 'sensing_mousedown', blockType: 'value_boolean'},
            {method: 'x', opcode: 'sensing_mousex', blockType: 'value'},
            {method: 'y', opcode: 'sensing_mousey', blockType: 'value'}
        ];

        mouseGetters.forEach(({method, opcode, blockType}) => {
            converter.registerOnSend('::Mouse', method, 0, () =>
                converter.createBlock(opcode, blockType)
            );
        });

        // Timer methods
        const timerMethods = [
            {method: 'value', opcode: 'sensing_timer', blockType: 'value'},
            {method: 'reset', opcode: 'sensing_resettimer', blockType: 'statement'}
        ];

        timerMethods.forEach(({method, opcode, blockType}) => {
            converter.registerOnSend('::Timer', method, 0, () =>
                converter.createBlock(opcode, blockType)
            );
        });

        // stage - returns Ruby expression
        converter.registerOnSend('self', Stage, 0, params => {
            const {node} = params;
            return converter.createRubyExpressionBlock(Stage, node);
        });

        const stageGetters = [
            {method: 'backdrop_number', property: 'backdrop #'},
            {method: 'backdrop_name', property: 'backdrop name'},
            {method: 'volume', property: 'volume'}
        ];
        stageGetters.forEach(({method, property}) => {
            converter.registerOnSend(Stage, method, 0, params => {
                const {receiver} = params;

                const block = converter.changeRubyExpressionBlock(receiver, 'sensing_of', 'value');
                converter.addField(block, 'PROPERTY', property);
                converter.addFieldInput(block, 'OBJECT', 'sensing_of_object_menu', 'OBJECT', '_stage_');
                return block;
            });
        });

        converter.registerOnSend(Stage, 'variable', 1, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'sensing_of', 'value');
            converter.addField(block, 'PROPERTY', args[0]);
            converter.addFieldInput(block, 'OBJECT', 'sensing_of_object_menu', 'OBJECT', '_stage_');
            return block;
        });

        // Touching methods (sprite only)
        converter.registerOnSend('sprite', 'touching?', 1, params => {
            const {args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('sensing_touchingobject', 'value_boolean');
            converter.addFieldInput(
                block, 'TOUCHINGOBJECTMENU', 'sensing_touchingobjectmenu', 'TOUCHINGOBJECTMENU',
                args[0], '_mouse_'
            );
            return block;
        });

        converter.registerOnSend('sprite', 'touching_color?', 1, params => {
            const {args} = params;

            if (!converter.isColorOrBlock(args[0])) return null;

            const block = converter.createBlock('sensing_touchingcolor', 'value_boolean');
            converter.addFieldInput(block, 'COLOR', 'colour_picker', 'COLOUR', args[0], '#43066f');
            return block;
        });

        converter.registerOnSend('sprite', 'color_is_touching_color?', 2, params => {
            const {args} = params;

            if (!converter.isColorOrBlock(args[0]) || !converter.isColorOrBlock(args[1])) return null;

            const block = converter.createBlock('sensing_coloristouchingcolor', 'value_boolean');
            converter.addFieldInput(block, 'COLOR', 'colour_picker', 'COLOUR', args[0], '#aad315');
            converter.addFieldInput(block, 'COLOR2', 'colour_picker', 'COLOUR', args[1], '#fca3bf');
            return block;
        });

        // Distance method (sprite only)
        converter.registerOnSend('sprite', 'distance', 1, params => {
            const {args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('sensing_distanceto', 'value');
            converter.addFieldInput(
                block, 'DISTANCETOMENU', 'sensing_distancetomenu', 'DISTANCETOMENU', args[0], '_mouse_'
            );
            return block;
        });

        // Ask method (all targets)
        converter.registerOnSend('self', 'ask', 1, params => {
            const {args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.createBlock('sensing_askandwait', 'statement');
            converter.addTextInput(block, 'QUESTION', args[0], 'What\'s your name?');
            return block;
        });

        // Drag mode method (sprite only)
        converter.registerOnSend('sprite', 'drag_mode=', 1, params => {
            const {args} = params;

            const validDragMode = converter.isString(args[0]) && DragMode.indexOf(args[0].toString()) >= 0;
            const validBoolean = args[0] && (args[0].type === 'true' || args[0].type === 'false');

            if (!validDragMode && !validBoolean) return null;

            const block = converter.createBlock('sensing_setdragmode', 'statement');
            let dragMode = args[0];
            if (dragMode.type === 'true') {
                dragMode = 'draggable';
            } else if (dragMode.type === 'false') {
                dragMode = 'not draggable';
            }
            converter.addField(block, 'DRAG_MODE', dragMode);
            return block;
        });

        converter.registerOnSend('::Keyboard', 'pressed?', 1, params => {
            const {args} = params;

            const validKey = converter.isString(args[0]) && KeyOptions.indexOf(args[0].toString()) >= 0;
            const isBlockArg = converter.isBlock(args[0]);

            if (!validKey && !isBlockArg) return null;

            const block = converter.createBlock('sensing_keypressed', 'value_boolean');
            converter.addFieldInput(block, 'KEY_OPTION', 'sensing_keyoptions', 'KEY_OPTION', args[0], 'space');
            return block;
        });

        converter.registerOnSend('::Time', 'now', 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(TimeNow, node);
        });

        const timeNowMethods = [
            {method: 'year', currentMenu: 'YEAR'},
            {method: 'month', currentMenu: 'MONTH'},
            {method: 'day', currentMenu: 'DATE'},
            {method: 'hour', currentMenu: 'HOUR'},
            {method: 'min', currentMenu: 'MINUTE'},
            {method: 'sec', currentMenu: 'SECOND'}
        ];
        timeNowMethods.forEach(({method, currentMenu}) => {
            converter.registerOnSend(TimeNow, method, 0, params => {
                const {receiver} = params;

                const block = converter.changeRubyExpressionBlock(receiver, 'sensing_current', 'value');
                converter.addField(block, 'CURRENTMENU', currentMenu);
                return block;
            });
        });

        // Special handling for wday - changes expression to TimeNowWday
        converter.registerOnSend(TimeNow, 'wday', 0, params => {
            const {receiver, node} = params;

            return converter.changeRubyExpression(receiver, node, TimeNowWday);
        });

        // Special handling for wday + 1 (DAYOFWEEK)
        converter.registerOnSend(TimeNowWday, '+', 1, params => {
            const {receiver, args} = params;

            if (!converter.isNumber(args[0]) || args[0].toString() !== '1') return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'sensing_current', 'value');
            converter.addField(block, 'CURRENTMENU', 'DAYOFWEEK');
            return block;
        });

        converter.registerOnSend('self', 'sprite', 1, params => {
            const {args, node} = params;

            if (!converter.isString(args[0])) return null;

            return converter.createRubyExpressionBlock(spriteCall(args[0]), node);
        });

        // Sprite property getters
        const spriteGetters = [
            {method: 'x', property: 'x position'},
            {method: 'y', property: 'y position'},
            {method: 'direction', property: 'direction'},
            {method: 'costume_number', property: 'costume #'},
            {method: 'costume_name', property: 'costume name'},
            {method: 'size', property: 'size'},
            {method: 'volume', property: 'volume'}
        ];

        spriteGetters.forEach(({method, property}) => {
            converter.registerOnSend('sprite_call', method, 0, params => {
                const {receiver} = params;

                const spriteName = converter._getSpriteCallName(receiver);
                if (!spriteName) return null;

                const block = converter.changeRubyExpressionBlock(receiver, 'sensing_of', 'value');
                converter.addField(block, 'PROPERTY', property);
                converter.addFieldInput(block, 'OBJECT', 'sensing_of_object_menu', 'OBJECT', spriteName);
                return block;
            });
        });

        // Sprite variable method
        converter.registerOnSend('sprite_call', 'variable', 1, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0])) return null;

            const spriteName = converter._getSpriteCallName(receiver);
            if (!spriteName) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'sensing_of', 'value');
            converter.addField(block, 'PROPERTY', args[0]);
            converter.addFieldInput(block, 'OBJECT', 'sensing_of_object_menu', 'OBJECT', spriteName);
            return block;
        });
    }
};

export default SensingConverter;
