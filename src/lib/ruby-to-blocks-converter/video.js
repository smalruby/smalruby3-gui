import Primitive from './primitive';

const VideoSensing = 'video_sensing';

const SensingAttributeMenu = [
    'motion',
    'direction'
];

const SensingSubjectMenu = [
    'Stage',
    'this sprite'
];
const SensingSubjectMenuLower = SensingSubjectMenu.map(x => x.toLowerCase());

const VideoStateMenu = [
    'off',
    'on',
    'on-flipped'
];

/**
 * Video converter
 */
const VideoConverter = {
    register: function (converter) {
        converter.registerOnSend('self', VideoSensing, 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(VideoSensing, node);
        });

        converter.registerOnSendWithBlock(VideoSensing, 'when_video_motion_greater_than', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;

            if (!converter.isNumberOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'videoSensing_whenMotionGreaterThan', 'hat');
            converter.addNumberInput(block, 'REFERENCE', 'math_number', args[0], 10);
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSend(VideoSensing, 'video_on', 2, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = SensingAttributeMenu.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', SensingAttributeMenu[index], args[0].node);
            }
            if (!converter.isStringOrBlock(args[1])) return null;
            if (converter.isString(args[1])) {
                const index = SensingSubjectMenuLower.indexOf(args[1].toString().toLowerCase());
                if (index < 0) return null;

                args[1] = new Primitive('str', SensingSubjectMenu[index], args[1].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'videoSensing_videoOn', 'value');
            converter.addFieldInput(
                block, 'ATTRIBUTE', 'videoSensing_menu_ATTRIBUTE', 'ATTRIBUTE', args[0], 'motion'
            );
            converter.addFieldInput(
                block, 'SUBJECT', 'videoSensing_menu_SUBJECT', 'SUBJECT', args[1], 'this sprite'
            );
            return block;
        });

        converter.registerOnSend(VideoSensing, 'video_turn', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = VideoStateMenu.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', VideoStateMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'videoSensing_videoToggle', 'statement');
            converter.addFieldInput(
                block, 'VIDEO_STATE', 'videoSensing_menu_VIDEO_STATE', 'VIDEO_STATE', args[0], 'on'
            );
            return block;
        });

        converter.registerOnSend(VideoSensing, 'video_transparency=', 1, params => {
            const {receiver, args} = params;

            if (!converter.isNumberOrBlock(args[0])) return null;

            const block =
                  converter.changeRubyExpressionBlock(receiver, 'videoSensing_setVideoTransparency', 'statement');
            converter.addNumberInput(block, 'TRANSPARENCY', 'math_number', args[0], 50);
            return block;
        });
    }
};

export default VideoConverter;
