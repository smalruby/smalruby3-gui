/* global Opal */
import _ from 'lodash';

/**
 * Video converter
 */
const VideoConverter = {
    // eslint-disable-next-line no-unused-vars
    onSend: function (receiver, name, args, rubyBlockArgs, rubyBlock) {
        let block;
        if ((this._isSelf(receiver) || receiver === Opal.nil) && !rubyBlock) {
            switch (name) {
                case 'video_turn':
                    if (args.length === 1 && this._isStringOrBlock(args[0])) {
                        block = this._createBlock(
                            'videoSensing_videoToggle',
                            'statement'
                        );
                        this._addInput(
                            block,
                            'VIDEO_STATE',
                            this._createFieldBlock(
                                'videoSensing_menu_VIDEO_STATE',
                                'VIDEO_STATE',
                                args[0]
                            )
                        );
                    }
                    break;
                case 'video_motion':
                    if (args.length === 0) {
                        block = this._createBlock(
                            'videoSensing_videoOn',
                            'value'
                        );
                        // this._addInput(
                        //     block,
                        //     'ATTRIBUTE',
                        //     this._createFieldBlock(
                        //         'videoSensing_menu_ATTRIBUTE',
                        //         'ATTRIBUTE',
                        //         args[0]
                        //     )
                        // );
                        // this._addInput(
                        //     block,
                        //     'SUBJECT',
                        //     this._createFieldBlock(
                        //         'videoSensing_menu_SUBJECT',
                        //         'SUBJECT',
                        //         args[0]
                        //     )
                        // );
                    }
                    break;
                case 'video_transparency=':
                    // done
                    if (args.length === 1 && this._isNumberOrBlock(args[0])) {
                        block = this._createBlock(
                            'videoSensing_setVideoTransparency',
                            'statement'
                        );
                        this._addNumberInput(
                            block,
                            'TRANSPARENCY',
                            'math_number',
                            args[0],
                            50
                        );
                    }
                    break;
            }
        } else if (
            (this._isSelf(receiver) || receiver === Opal.nil) &&
            name === 'when' &&
            args.length == 2 &&
            args[0].type === 'sym' &&
            this._isNumberOrBlock(args[1]) &&
            rubyBlockArgs &&
            rubyBlockArgs.length === 0 &&
            rubyBlock
        ) {
            switch (args[0].value) {
                case 'video_motion_greater_than':
                    console.log('video_motion_geater_than');
                    if (args.length === 2 && this._isNumberOrBlock(args[1])) {
                        block = this._createBlock(
                            'videoSensing_whenMotionGreaterThan',
                            'hat'
                        );
                        this._addNumberInput(block, 'REFERENCE', 'math_number', args[1], 10);
                        this._setParent(rubyBlock, block);
                    }
                    break;
            }
        }
        return block;
    },
};

export default VideoConverter;
