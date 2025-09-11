/* global Opal */
import _ from 'lodash';
import {RubyToBlocksConverterError} from './errors';

/* eslint-disable no-invalid-this */
const createBlockWithMessage = function (opcode, message, defaultMessage) {
    const block = this._createBlock(opcode, 'statement');
    this._addTextInput(block, 'MESSAGE', this._isNumber(message) ? message.toString() : message, defaultMessage);
    return block;
};

const Effects = [
    'COLOR',
    'FISHEYE',
    'WHIRL',
    'PIXELATE',
    'MOSAIC',
    'BRIGHTNESS',
    'GHOST'
];

const FrontBack = [
    'front',
    'back'
];

const ForwardBackward = [
    'forward',
    'backward'
];

/* eslint-disable no-invalid-this */
const validateCostume = function (costumeName, args) {
    // Skip validation if no target context (e.g., in tests)
    if (!this._context.target || !this._context.target.getCostumes) {
        return;
    }

    const costumes = this._context.target.getCostumes();
    const costumeExists = costumes.some(costume => costume.name === costumeName);
    if (!costumeExists) {
        throw new RubyToBlocksConverterError(
            args[0].node,
            `costume "${costumeName}" does not exist`
        );
    }
};

const validateBackdrop = function (backdropName, args) {
    // Allow special backdrop values
    const specialBackdrops = ['next backdrop', 'previous backdrop', 'random backdrop'];
    if (specialBackdrops.includes(backdropName)) {
        return;
    }

    // Skip validation if no VM context (e.g., in tests)
    if (!this.vm || !this.vm.runtime || !this.vm.runtime.getTargetForStage) {
        return;
    }

    const stage = this.vm.runtime.getTargetForStage();
    if (!stage || !stage.getCostumes) {
        return;
    }

    const backdrops = stage.getCostumes();
    const backdropExists = backdrops.some(backdrop => backdrop.name === backdropName);
    if (!backdropExists) {
        throw new RubyToBlocksConverterError(
            args[0].node,
            `backdrop "${backdropName}" does not exist`
        );
    }
};
/* eslint-enable no-invalid-this */

/**
 * Looks converter
 */
const LooksConverter = {
    register: function (converter) {
        ['say', 'think'].forEach(methodName => {
            converter.registerOnSend('sprite', methodName, 1, params => {
                const {args} = params;
                if (!converter._isNumberOrStringOrBlock(args[0])) return null;

                let opcode;
                let defaultMessage;
                if (methodName === 'say') {
                    opcode = 'looks_say';
                    defaultMessage = 'Hello!';
                } else {
                    opcode = 'looks_think';
                    defaultMessage = 'Hmm...';
                }

                return createBlockWithMessage.call(converter, opcode, args[0], defaultMessage);
            });
        });

        ['say', 'think'].forEach(methodName => {
            converter.registerOnSend('sprite', methodName, 2, params => {
                const {args} = params;
                if (!converter._isNumberOrStringOrBlock(args[0]) || !converter._isNumberOrBlock(args[1])) return null;

                let opcode;
                let defaultMessage;
                if (methodName === 'say') {
                    opcode = 'looks_sayforsecs';
                    defaultMessage = 'Hello!';
                } else {
                    opcode = 'looks_thinkforsecs';
                    defaultMessage = 'Hmm...';
                }

                const block = createBlockWithMessage.call(converter, opcode, args[0], defaultMessage);
                converter._addNumberInput(block, 'SECS', 'math_number', args[1], 2);
                return block;
            });
        });

        converter.registerOnSend('sprite', 'switch_costume', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            validateCostume.call(converter, args[0].toString(), args);
            const block = converter._createBlock('looks_switchcostumeto', 'statement');
            converter._addInput(block, 'COSTUME', converter._createFieldBlock('looks_costume', 'COSTUME', args[0]));
            return block;
        });

        converter.registerOnSend('self', 'switch_backdrop', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            validateBackdrop.call(converter, args[0].toString(), args);
            const block = converter._createBlock('looks_switchbackdropto', 'statement');
            converter._addInput(block, 'BACKDROP', converter._createFieldBlock('looks_backdrops', 'BACKDROP', args[0]));
            return block;
        });

        converter.registerOnSend('self', 'switch_backdrop_and_wait', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0])) return null;

            validateBackdrop.call(converter, args[0].toString(), args);
            const block = converter._createBlock('looks_switchbackdroptoandwait', 'statement');
            converter._addInput(block, 'BACKDROP', converter._createFieldBlock('looks_backdrops', 'BACKDROP', args[0]));
            return block;
        });

        converter.registerOnSend('sprite', 'size=', 1, params => {
            const {args} = params;
            if (!converter._isNumberOrBlock(args[0])) return null;

            const block = converter._createBlock('looks_setsizeto', 'statement');
            converter._addNumberInput(block, 'SIZE', 'math_number', args[0], 100);
            return block;
        });

        converter.registerOnSend('self', 'change_effect_by', 2, params => {
            const {args} = params;
            if (!converter._isString(args[0]) || Effects.indexOf(args[0].toString().toUpperCase()) < 0) return null;
            if (!converter._isNumberOrBlock(args[1])) return null;

            const block = converter._createBlock('looks_changeeffectby', 'statement');
            converter._addField(block, 'EFFECT', args[0].toString().toUpperCase());
            converter._addNumberInput(block, 'CHANGE', 'math_number', args[1], 25);
            return block;
        });

        converter.registerOnSend('self', 'set_effect', 2, params => {
            const {args} = params;
            if (!converter._isString(args[0]) || Effects.indexOf(args[0].toString().toUpperCase()) < 0) return null;
            if (!converter._isNumberOrBlock(args[1])) return null;

            const block = converter._createBlock('looks_seteffectto', 'statement');
            converter._addField(block, 'EFFECT', args[0].toString().toUpperCase());
            converter._addNumberInput(block, 'VALUE', 'math_number', args[1], 25);
            return block;
        });

        converter.registerOnSend('sprite', 'go_to_layer', 1, params => {
            const {args} = params;
            if (!converter._isString(args[0]) || FrontBack.indexOf(args[0].toString()) < 0) return null;

            const block = converter._createBlock('looks_gotofrontback', 'statement');
            converter._addField(block, 'FRONT_BACK', args[0]);
            return block;
        });

        converter.registerOnSend('sprite', 'go_layers', 2, params => {
            const {args} = params;
            if (!converter._isNumberOrBlock(args[0]) || ForwardBackward.indexOf(args[1].toString()) < 0) return null;

            const block = converter._createBlock('looks_goforwardbackwardlayers', 'statement');
            converter._addNumberInput(block, 'NUM', 'math_integer', args[0], 1);
            converter._addField(block, 'FORWARD_BACKWARD', args[1]);
            return block;
        });

        ['costume_number', 'costume_name'].forEach(methodName => {
            converter.registerOnSend('sprite', methodName, 0, () => {
                const a = methodName.split('_');
                const block = converter._createBlock(`looks_${a[0]}numbername`, 'value');
                converter._addField(block, 'NUMBER_NAME', a[1]);
                return block;
            });
        });

        ['backdrop_number', 'backdrop_name'].forEach(methodName => {
            converter.registerOnSend('self', methodName, 0, params => {
                const {receiver} = params;
                if (!converter._isSelf(receiver) && receiver !== Opal.nil) return null;

                const a = methodName.split('_');
                const block = converter._createBlock(`looks_${a[0]}numbername`, 'value');
                converter._addField(block, 'NUMBER_NAME', a[1]);
                return block;
            });
        });

        converter.registerOnSend('sprite', 'next_costume', 0, () =>
            converter._createBlock('looks_nextcostume', 'statement')
        );

        converter.registerOnSend('self', 'next_backdrop', 0, () =>
            converter._createBlock('looks_nextbackdrop', 'statement')
        );

        converter.registerOnSend('self', 'clear_graphic_effects', 0, () =>
            converter._createBlock('looks_cleargraphiceffects', 'statement')
        );

        converter.registerOnSend('sprite', 'show', 0, () =>
            converter._createBlock('looks_show', 'statement')
        );

        converter.registerOnSend('sprite', 'hide', 0, () =>
            converter._createBlock('looks_hide', 'statement')
        );

        converter.registerOnSend('sprite', 'size', 0, () =>
            converter._createBlock('looks_size', 'value')
        );
    },

    // eslint-disable-next-line no-unused-vars
    onOpAsgn: function (lh, operator, rh) {
        let block;
        if (this._isBlock(lh) && lh.opcode === 'looks_size' && operator === '+' && this._isNumberOrBlock(rh)) {
            block = this._changeBlock(lh, 'looks_changesizeby', 'statement');
            this._addNumberInput(block, 'CHANGE', 'math_number', rh, 10);
        }
        return block;
    }
};

export default LooksConverter;
