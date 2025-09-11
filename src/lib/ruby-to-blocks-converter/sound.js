/* global Opal */
import _ from 'lodash';
import {RubyToBlocksConverterError} from './errors';

const Effect = [
    'PITCH',
    'PAN'
];

/**
 * Sound converter
 */
const SoundConverter = {
    register: function (converter) {
        // play_until_done method
        converter.registerOnSend('self', 'play_until_done', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            // Check if sound exists when string is specified and target has sounds
            if (converter.isString(args[0]) && converter._context.target &&
                converter._context.target.sprite && converter._context.target.sprite.sounds) {
                const soundName = args[0].toString();
                const soundExists = converter._context.target.sprite.sounds.some(sound => sound.name === soundName);
                if (!soundExists) {
                    throw new RubyToBlocksConverterError(
                        args[0].node,
                        `sound "${soundName}" does not exist`
                    );
                }
            }

            const block = converter.createBlock('sound_playuntildone', 'statement');
            converter.addFieldInput(block, 'SOUND_MENU', 'sound_sounds_menu', 'SOUND_MENU', args[0], '');
            return block;
        });

        // play method
        converter.registerOnSend('self', 'play', 1, params => {
            const {args} = params;
            if (!converter.isStringOrBlock(args[0])) return null;

            // Check if sound exists when string is specified and target has sounds
            if (converter.isString(args[0]) && converter._context.target &&
                converter._context.target.sprite && converter._context.target.sprite.sounds) {
                const soundName = args[0].toString();
                const soundExists = converter._context.target.sprite.sounds.some(sound => sound.name === soundName);
                if (!soundExists) {
                    throw new RubyToBlocksConverterError(
                        args[0].node,
                        `sound "${soundName}" does not exist`
                    );
                }
            }

            const block = converter.createBlock('sound_play', 'statement');
            converter.addFieldInput(block, 'SOUND_MENU', 'sound_sounds_menu', 'SOUND_MENU', args[0], '');
            return block;
        });

        // stop_all_sounds method
        converter.registerOnSend('self', 'stop_all_sounds', 0, () =>
            converter.createBlock('sound_stopallsounds', 'statement')
        );

        // clear_sound_effects method
        converter.registerOnSend('self', 'clear_sound_effects', 0, () =>
            converter.createBlock('sound_cleareffects', 'statement')
        );

        converter.registerOnSend('self', 'volume', 0, params => {
            const {receiver} = params;
            if (!converter._isSelf(receiver) && receiver !== Opal.nil) return null;

            return converter.createBlock('sound_volume', 'value');
        });

        // change_sound_effect_by method
        converter.registerOnSend('self', 'change_sound_effect_by', 2, params => {
            const {args} = params;
            if (!converter.isString(args[0]) || Effect.indexOf(args[0].toString()) < 0) return null;
            if (!converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('sound_changeeffectby', 'statement');
            converter.addField(block, 'EFFECT', args[0]);
            converter.addNumberInput(block, 'VALUE', 'math_number', args[1], 10);
            return block;
        });

        // set_sound_effect method
        converter.registerOnSend('self', 'set_sound_effect', 2, params => {
            const {args} = params;
            if (!converter.isString(args[0]) || Effect.indexOf(args[0].toString()) < 0) return null;
            if (!converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('sound_seteffectto', 'statement');
            converter.addField(block, 'EFFECT', args[0]);
            converter.addNumberInput(block, 'VALUE', 'math_number', args[1], 100);
            return block;
        });

        // volume= method
        converter.registerOnSend('self', 'volume=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('sound_setvolumeto', 'statement');
            converter.addNumberInput(block, 'VOLUME', 'math_number', args[0], 100);
            return block;
        });
    },

    // Keep onOpAsgn for volume+= operator
    // eslint-disable-next-line no-unused-vars
    onOpAsgn: function (lh, operator, rh) {
        let block;
        if (this._isBlock(lh) && lh.opcode === 'sound_volume' && operator === '+' && this._isNumberOrBlock(rh)) {
            block = this._changeBlock(lh, 'sound_changevolumeby', 'statement');
            this._addNumberInput(block, 'VOLUME', 'math_number', rh, -10);
        }
        return block;
    }
};

export default SoundConverter;
