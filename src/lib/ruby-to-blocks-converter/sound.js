/* global Opal */
import _ from 'lodash';

/**
 * Sound converter
 */
const SoundConverter = {
    // eslint-disable-next-line no-unused-vars
    onSend: function (receiver, name, args, rubyBlockArgs, rubyBlock) {
        let block;
        if ((this._isSelf(receiver) || receiver === Opal.nil) && !rubyBlock) {
            switch (name) {
            case 'play_until_done':
            case 'play':
                if (args.length === 1 && this._isStringOrBlock(args[0])) {
                    let opcode;
                    if (name === 'play_until_done') {
                        opcode = 'sound_playuntildone';
                    } else {
                        opcode = 'sound_play';
                    }
                    const menuBlock = this._createBlock('sound_sounds_menu', 'value', {
                        shadow: true
                    });
                    let inputBlock;
                    let shadowBlock;
                    if (this._isString(args[0])) {
                        this._addField(menuBlock, 'SOUND_MENU', args[0]);
                        inputBlock = menuBlock;
                        shadowBlock = menuBlock;
                    } else {
                        this._addField(menuBlock, 'SOUND_MENU', '');
                        inputBlock = args[0];
                        shadowBlock = menuBlock;
                    }
                    block = this._createBlock(opcode, 'statement');
                    this._addInput(block, 'SOUND_MENU', inputBlock, shadowBlock);
                }
                break;
            case 'stop_all_sounds':
                if (args.length === 0) {
                    block = this._createBlock('sound_stopallsounds', 'statement');
                }
                break;
            }
        }
        return block;
    },

    // eslint-disable-next-line no-unused-vars
    onOpAsgn: function (lh, operator, rh) {
        let block;
        if (this._isBlock(lh) && operator === '+' && this._isNumberOrBlock(rh)) {
            let xy;
            switch (lh.opcode) {
            case 'motion_xposition':
            case 'motion_yposition':
                if (lh.opcode === 'motion_xposition') {
                    xy = 'x';
                } else {
                    xy = 'y';
                }
                block = this._changeBlock(lh, `motion_change${xy}by`, 'statement');
                this._addNumberInput(block, `D${_.toUpper(xy)}`, 'math_number', rh, 10);
                break;
            }
        }
        return block;
    }
};

export default SoundConverter;