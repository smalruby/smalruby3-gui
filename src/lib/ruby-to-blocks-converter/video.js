/* global Opal */
import _ from "lodash";

/**
 * Video converter
 */
const VideoConverter = {
    // eslint-disable-next-line no-unused-vars
    onSend: function (receiver, name, args, rubyBlockArgs, rubyBlock) {
        let block;
        if ((this._isSelf(receiver) || receiver === Opal.nil) && !rubyBlock) {
            switch (name) {
                case "video_turn":
                    if (args.length === 1 && this._isStringOrBlock(args[0])) {
                        block = this._createBlock(
                            "videoSensing_videoToggle",
                            "statement"
                        );
                        this._addInput(
                            block,
                            "VIDEO_STATE",
                            this._createFieldBlock(
                                "videoSensing_menu_VIDEO_STATE",
                                "VIDEO_STATE",
                                args[0]
                            )
                        );
                    }
                    break;
            }
        }
        return block;
    },
};

export default VideoConverter;
