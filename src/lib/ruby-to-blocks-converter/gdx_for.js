import _ from 'lodash';

const GdxFor = 'gdx_for';

/**
 * GdxFor converter
 */
const GdxForConverter = {
    register: function (converter) {
        // Create the initial Ruby expression block
        converter.registerOnSend('self', GdxFor, 0, params => {
            const {node} = params;
            
            return converter.createRubyExpressionBlock(GdxFor, node);
        });

        // New Ruby expression pattern methods
        converter.registerOnSend(GdxFor, 'acceleration', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_getAcceleration', 'value');
            converter.addInput(
                block,
                'DIRECTION',
                converter.createFieldBlock('gdxfor_menu_axisOptions', 'axisOptions', args[0])
            );
            return block;
        });

        converter.registerOnSend(GdxFor, 'force', 0, params => {
            const {receiver} = params;
            
            return converter.changeRubyExpressionBlock(receiver, 'gdxfor_getForce', 'value');
        });

        converter.registerOnSend(GdxFor, 'tilted?', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_isTilted', 'value');
            converter.addInput(
                block,
                'TILT',
                converter.createFieldBlock('gdxfor_menu_tiltAnyOptions', 'tiltAnyOptions', args[0])
            );
            return block;
        });

        converter.registerOnSend(GdxFor, 'tilt_angle', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_getTilt', 'value');
            converter.addInput(
                block,
                'TILT',
                converter.createFieldBlock('gdxfor_menu_tiltOptions', 'tiltOptions', args[0])
            );
            return block;
        });

        converter.registerOnSend(GdxFor, 'falling?', 0, params => {
            const {receiver} = params;
            
            return converter.changeRubyExpressionBlock(receiver, 'gdxfor_isFreeFalling', 'value');
        });

        converter.registerOnSend(GdxFor, 'spin_speed', 1, params => {
            const {receiver, args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_getSpinSpeed', 'value');
            converter.addInput(
                block,
                'DIRECTION',
                converter.createFieldBlock('gdxfor_menu_axisOptions', 'axisOptions', args[0])
            );
            return block;
        });

        // New Ruby expression pattern event handlers
        converter.registerOnSendWithBlock(GdxFor, 'when_gesture', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_whenGesture', 'hat');
            converter.addInput(
                block,
                'GESTURE',
                converter.createFieldBlock('gdxfor_menu_gestureOptions', 'gestureOptions', args[0])
            );
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock(GdxFor, 'when_sensor', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_whenForcePushedOrPulled', 'hat');
            converter.addInput(
                block,
                'PUSH_PULL',
                converter.createFieldBlock('gdxfor_menu_pushPullOptions', 'pushPullOptions', args[0])
            );
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock(GdxFor, 'when_tilted', 1, 0, params => {
            const {receiver, args, rubyBlock} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.changeRubyExpressionBlock(receiver, 'gdxfor_whenTilted', 'hat');
            converter.addInput(
                block,
                'TILT',
                converter.createFieldBlock('gdxfor_menu_tiltAnyOptions', 'tiltAnyOptions', args[0])
            );
            converter.setParent(rubyBlock, block);
            return block;
        });

        // Backward compatibility - old API support
        converter.registerOnSend('self', 'gdx_for_acceleration', 1, params => {
            const {args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.createBlock('gdxfor_getAcceleration', 'value');
            converter.addInput(
                block,
                'DIRECTION',
                converter.createFieldBlock('gdxfor_menu_axisOptions', 'axisOptions', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'gdx_for_force', 0, () =>
            converter.createBlock('gdxfor_getForce', 'value')
        );

        converter.registerOnSend('self', 'gdx_for_tilted?', 1, params => {
            const {args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.createBlock('gdxfor_isTilted', 'value');
            converter.addInput(
                block,
                'TILT',
                converter.createFieldBlock('gdxfor_menu_tiltAnyOptions', 'tiltAnyOptions', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'gdx_for_tilt_angle', 1, params => {
            const {args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.createBlock('gdxfor_getTilt', 'value');
            converter.addInput(
                block,
                'TILT',
                converter.createFieldBlock('gdxfor_menu_tiltOptions', 'tiltOptions', args[0])
            );
            return block;
        });

        converter.registerOnSend('self', 'gdx_for_falling?', 0, () =>
            converter.createBlock('gdxfor_isFreeFalling', 'value')
        );

        converter.registerOnSend('self', 'gdx_for_spin_speed', 1, params => {
            const {args} = params;
            
            if (!converter.isStringOrBlock(args[0])) return null;
            
            const block = converter.createBlock('gdxfor_getSpinSpeed', 'value');
            converter.addInput(
                block,
                'DIRECTION',
                converter.createFieldBlock('gdxfor_menu_axisOptions', 'axisOptions', args[0])
            );
            return block;
        });

        // Backward compatibility - old event handlers
        converter.registerOnSendWithBlock('self', 'when', 2, 0, params => {
            const {args, rubyBlock} = params;
            
            if (args[0].type !== 'sym' || !converter.isStringOrBlock(args[1])) return null;
            
            let block;
            switch (args[0].value) {
            case 'gdx_for_gesture': {
                block = converter.createBlock('gdxfor_whenGesture', 'hat');
                converter.addInput(
                    block,
                    'GESTURE',
                    converter.createFieldBlock('gdxfor_menu_gestureOptions', 'gestureOptions', args[1])
                );
                converter.setParent(rubyBlock, block);
                break;
            }
                
            case 'gdx_force_sensor': {
                block = converter.createBlock('gdxfor_whenForcePushedOrPulled', 'hat');
                converter.addInput(
                    block,
                    'PUSH_PULL',
                    converter.createFieldBlock('gdxfor_menu_pushPullOptions', 'pushPullOptions', args[1])
                );
                converter.setParent(rubyBlock, block);
                break;
            }
                
            case 'gdx_for_tilted': {
                block = converter.createBlock('gdxfor_whenTilted', 'hat');
                converter.addInput(
                    block,
                    'TILT',
                    converter.createFieldBlock('gdxfor_menu_tiltAnyOptions', 'tiltAnyOptions', args[1])
                );
                converter.setParent(rubyBlock, block);
                break;
            }
            }
            
            return block;
        });
    }
};

export default GdxForConverter;
