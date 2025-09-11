import _ from 'lodash';

/**
 * Music converter
 */
const MusicConverter = {
    register: function (converter) {
        converter.registerOnSend('self', 'play_drum', 1, params => {
            const {args} = params;
            if (!converter._isHash(args[0]) || args[0].size !== 2) return null;

            const drum = args[0].get('sym:drum');
            const beats = args[0].get('sym:beats');
            if (!converter.isNumberOrBlock(drum) || !converter.isNumberOrBlock(beats)) return null;

            const block = converter.createBlock('music_playDrumForBeats', 'statement');
            converter.addInput(
                block,
                'DRUM',
                converter._createFieldBlock('music_menu_DRUM', 'DRUM', drum)
            );
            converter.addNumberInput(block, 'BEATS', 'math_number', beats, 0.25);
            return block;
        });

        converter.registerOnSend('self', 'rest', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('music_restForBeats', 'statement');
            converter.addNumberInput(block, 'BEATS', 'math_number', args[0], 0.25);
            return block;
        });

        converter.registerOnSend('self', 'play_note', 1, params => {
            const {args} = params;
            if (!converter._isHash(args[0]) || args[0].size !== 2) return null;

            const note = args[0].get('sym:note');
            const beats = args[0].get('sym:beats');
            if (!converter.isNumberOrBlock(note) || !converter.isNumberOrBlock(beats)) return null;

            const block = converter.createBlock('music_playNoteForBeats', 'statement');
            converter._addNoteInput(block, 'NOTE', note, 60);
            converter.addNumberInput(block, 'BEATS', 'math_number', beats, 0.25);
            return block;
        });

        converter.registerOnSend('self', 'instrument=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('music_setInstrument', 'statement');
            converter.addInput(
                block,
                'INSTRUMENT',
                converter._createFieldBlock('music_menu_INSTRUMENT', 'INSTRUMENT', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'tempo=', 1, params => {
            const {args} = params;
            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.createBlock('music_setTempo', 'statement');
            converter.addNumberInput(block, 'TEMPO', 'math_number', args[0], 60);
            return block;
        });

        converter.registerOnSend('self', 'tempo', 0, () =>
            converter.createBlock('music_getTempo', 'value')
        );
    },

    // Keep onOpAsgn for tempo+= operator
    // eslint-disable-next-line no-unused-vars
    onOpAsgn: function (lh, operator, rh) {
        let block;
        if (this._isBlock(lh) && operator === '+' && this._isNumberOrBlock(rh)) {
            switch (lh.opcode) {
            case 'music_getTempo':
                block = this._changeBlock(lh, 'music_changeTempo', 'statement');
                this._addNumberInput(block, 'TEMPO', 'math_number', rh, 20);
                break;
            }
        }
        return block;
    }
};

export default MusicConverter;
