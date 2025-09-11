// eslint-disable-next-line import/no-unresolved
import Variable from 'scratch-vm/src/engine/variable';
import {KeyOptions} from './constants';

const GreaterThanMenu = [
    'LOUDNESS',
    'TIMER'
];

/**
 * Event converter
 */
const EventConverter = {
    register: function (converter) {
        converter.registerOnSendWithBlock('self', 'when_flag_clicked', 0, 0, params => {
            const {rubyBlock} = params;

            const block = converter.createBlock('event_whenflagclicked', 'hat');
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock('self', 'when_key_pressed', 1, 0, params => {
            const {args, rubyBlock} = params;

            if (!converter.isString(args[0])) return null;
            if (KeyOptions.indexOf(args[0].toString()) < 0) return null;

            const block = converter.createBlock('event_whenkeypressed', 'hat');
            converter.addField(block, 'KEY_OPTION', args[0]);
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock('self', 'when_clicked', 0, 0, params => {
            const {receiverName, rubyBlock} = params;

            let opcode = 'event_whenthisspriteclicked';
            if (receiverName === 'stage') opcode = 'event_whenstageclicked';
            const block = converter.createBlock(opcode, 'hat');
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock('self', 'when_backdrop_switches', 1, 0, params => {
            const {args, rubyBlock} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.createBlock('event_whenbackdropswitchesto', 'hat');
            converter.addField(block, 'BACKDROP', args[0]);
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock('self', 'when_greater_than', 2, 0, params => {
            const {args, rubyBlock} = params;

            if (!converter.isString(args[0])) return null;
            const args0 = args[0].toString().toUpperCase();
            if (GreaterThanMenu.indexOf(args0) < 0) return null;
            if (!converter.isNumberOrBlock(args[1])) return null;

            const block = converter.createBlock('event_whengreaterthan', 'hat');
            converter.addField(block, 'WHENGREATERTHANMENU', args0);
            converter.addNumberInput(block, 'VALUE', 'math_number', args[1], 10);
            converter.setParent(rubyBlock, block);
            return block;
        });

        converter.registerOnSendWithBlock('self', 'when_receive', 1, 0, params => {
            const {args, rubyBlock} = params;

            if (!converter.isString(args[0])) return null;

            const broadcastMsg = converter.lookupOrCreateBroadcastMsg(args[0]);
            const block = converter.createBlock('event_whenbroadcastreceived', 'hat');
            converter.addField(block, 'BROADCAST_OPTION', broadcastMsg.name, {
                id: broadcastMsg.id,
                variableType: Variable.BROADCAST_MESSAGE_TYPE
            });
            converter.setParent(rubyBlock, block);
            return block;
        });

        const createBroadcastBlockFunc = (params, opcode) => {
            const {args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const menuBlock = converter.createBlock('event_broadcast_menu', 'value', {
                shadow: true
            });
            let broadcastMsg;
            let inputBlock;
            let shadowBlock;
            if (converter.isString(args[0])) {
                broadcastMsg = converter.lookupOrCreateBroadcastMsg(args[0]);
                inputBlock = menuBlock;
                shadowBlock = menuBlock;
            } else {
                broadcastMsg = converter.defaultBroadcastMsg();
                inputBlock = args[0];
                shadowBlock = menuBlock;
            }
            converter.addField(menuBlock, 'BROADCAST_OPTION', broadcastMsg.name, {
                id: broadcastMsg.id,
                variableType: Variable.BROADCAST_MESSAGE_TYPE
            });

            const block = converter.createBlock(opcode, 'statement');
            converter.addInput(block, 'BROADCAST_INPUT', inputBlock, shadowBlock);
            return block;
        };
        converter.registerOnSend(
            'self', 'broadcast', 1,
            params => createBroadcastBlockFunc(params, 'event_broadcast')
        );
        converter.registerOnSend(
            'self', 'broadcast_and_wait', 1,
            params => createBroadcastBlockFunc(params, 'event_broadcastandwait')
        );

        // backward compatibility
        converter.registerOnSendWithBlock('self', 'when', 1, 0, params => {
            const {args} = params;

            if (args[0].type !== 'sym') return null;

            switch (args[0].value) {
            case 'flag_clicked':
                return converter.callMethod(
                    params.receiver, 'when_flag_clicked', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            case 'clicked':
                return converter.callMethod(
                    params.receiver, 'when_clicked', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            }

            return null;
        });

        // backward compatibility
        converter.registerOnSendWithBlock('self', 'when', 2, 0, params => {
            const {args} = params;

            if (args[0].type !== 'sym') return null;

            switch (args[0].value) {
            case 'key_pressed':
                return converter.callMethod(
                    params.receiver, 'when_key_pressed', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            case 'backdrop_switches':
                return converter.callMethod(
                    params.receiver, 'when_backdrop_switches', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            case 'receive':
                return converter.callMethod(
                    params.receiver, 'when_receive', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            }

            return null;
        });

        // backward compatibility
        converter.registerOnSendWithBlock('self', 'when', 3, 0, params => {
            const {args} = params;

            if (args[0].type !== 'sym') return null;

            switch (args[0].value) {
            case 'greater_than':
                return converter.callMethod(
                    params.receiver, 'when_greater_than', params.args.slice(1),
                    params.rubyBlockArgs, params.rubyBlock, params.node
                );
            }

            return null;
        });
    }
};

export default EventConverter;
