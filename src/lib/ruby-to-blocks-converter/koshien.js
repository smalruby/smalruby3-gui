const Koshien = 'koshien';

const KoshienConverter = {
    register: function (converter) {
        converter.registerOnSend('self', Koshien, 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(Koshien, node);
        });

        converter.registerOnSend(Koshien, 'connect_game', 1, params => {
            const {receiver, args} = params;

            const name = args[0].get('sym:name');
            if (!converter.isStringOrBlock(name)) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_connectGame', 'statement');
            converter.addTextInput(block, 'NAME', name, 'player1');
            return block;
        });

        const checkPosition = block => {
            if (converter.isBlock(block)) return true;
            if (!converter.isString(block)) return false;
            const position = block.value.split(':');
            const x = Number(position[0]);
            const y = Number(position[1]);
            return x >= 0 && x <= 14 && y >= 0 && y <= 14;
        };

        converter.registerOnSend(Koshien, 'get_map_area', 1, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_getMapArea', 'statement');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            return block;
        });

        converter.registerOnSend(Koshien, 'map', 1, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_map', 'value');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            return block;
        });

        converter.registerOnSend(Koshien, 'move_to', 1, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_moveTo', 'statement');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            return block;
        });

        converter.registerOnSend(Koshien, 'calc_route', 1, params => {
            const {receiver, args} = params;

            const src = args[0].get('sym:src');
            const dst = args[0].get('sym:dst');
            const exceptCells = args[0].get('sym:except_cells');
            const result = args[0].get('sym:result');

            if (!src && !dst && !exceptCells) {
                if (!converter.isListBlock(result) && !converter.isNil(result)) return null;

                const block = converter.changeRubyExpressionBlock(receiver, 'koshien_calcGoalRoute', 'statement');
                converter.addField(block, 'RESULT', converter.lookupListFromListBlock(result)?.name || ' ');
                converter.removeBlock(result);
                return block;
            }

            if (!checkPosition(src)) return null;
            if (!checkPosition(dst)) return null;
            if (!converter.isListBlock(exceptCells) && !converter.isNil(exceptCells)) return null;
            if (!converter.isListBlock(result) && !converter.isNil(result)) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_calcRoute', 'statement');
            converter.addTextInput(block, 'SRC', src, '0:0');
            converter.addTextInput(block, 'DST', dst, '0:0');
            converter.addField(block, 'EXCEPT_CELLS', converter.lookupListFromListBlock(exceptCells)?.name || ' ');
            converter.removeBlock(exceptCells);
            converter.addField(block, 'RESULT', converter.lookupListFromListBlock(result)?.name || ' ');
            converter.removeBlock(result);
            return block;
        });

        converter.registerOnSend(Koshien, 'set_dynamite', 1, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_setItem', 'statement');
            converter.addField(block, 'ITEM', 'dynamite');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            return block;
        });

        converter.registerOnSend(Koshien, 'set_bomb', 1, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_setItem', 'statement');
            converter.addField(block, 'ITEM', 'bomb');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            return block;
        });

        converter.registerOnSend(Koshien, 'map_all', 0, params => {
            const {receiver} = params;

            return converter.changeRubyExpressionBlock(receiver, 'koshien_mapAll', 'value');
        });

        converter.registerOnSend(Koshien, 'map_from', 2, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;
            if (!converter.isVariableBlock(args[1]) && !converter.isNil(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_mapFrom', 'value');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            converter.addField(block, 'MAP', converter.lookupVariableFromVariableBlock(args[1])?.name || ' ');
            converter.removeBlock(args[1]);
            return block;
        });

        converter.registerOnSend(Koshien, 'locate_objects', 1, params => {
            const {receiver, args} = params;

            const sqSize = args[0].get('sym:sq_size');
            const cent = args[0].get('sym:cent');
            const objects = args[0].get('sym:objects');
            const result = args[0].get('sym:result');

            if (!converter.isNumberOrBlock(sqSize)) return null;
            if (!checkPosition(cent)) return null;
            if (!converter.isStringOrBlock(objects)) return null;
            if (!converter.isListBlock(result) && !converter.isNil(result)) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_locateObjects', 'statement');
            converter.addNumberInput(block, 'SQ_SIZE', 'math_number', sqSize, 0);
            converter.addTextInput(block, 'POSITION', cent, '0:0');
            converter.addTextInput(block, 'OBJECTS', objects, 'ABCD');
            converter.addField(block, 'RESULT', converter.lookupListFromListBlock(result)?.name || ' ');
            converter.removeBlock(result);
            return block;
        });

        converter.registerOnSend(Koshien, 'other_player', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'other_player');
            converter.addField(block, 'COORDINATE', 'position');
            return block;
        });

        converter.registerOnSend(Koshien, 'other_player_x', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'other_player');
            converter.addField(block, 'COORDINATE', 'x');
            return block;
        });

        converter.registerOnSend(Koshien, 'other_player_y', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'other_player');
            converter.addField(block, 'COORDINATE', 'y');
            return block;
        });

        converter.registerOnSend(Koshien, 'enemy', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'enemy');
            converter.addField(block, 'COORDINATE', 'position');
            return block;
        });

        converter.registerOnSend(Koshien, 'enemy_x', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'enemy');
            converter.addField(block, 'COORDINATE', 'x');
            return block;
        });

        converter.registerOnSend(Koshien, 'enemy_y', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'enemy');
            converter.addField(block, 'COORDINATE', 'y');
            return block;
        });

        converter.registerOnSend(Koshien, 'goal', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'goal');
            converter.addField(block, 'COORDINATE', 'position');
            return block;
        });

        converter.registerOnSend(Koshien, 'goal_x', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'goal');
            converter.addField(block, 'COORDINATE', 'x');
            return block;
        });

        converter.registerOnSend(Koshien, 'goal_y', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'goal');
            converter.addField(block, 'COORDINATE', 'y');
            return block;
        });

        converter.registerOnSend(Koshien, 'player', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'player');
            converter.addField(block, 'COORDINATE', 'position');
            return block;
        });

        converter.registerOnSend(Koshien, 'player_x', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'player');
            converter.addField(block, 'COORDINATE', 'x');
            return block;
        });

        converter.registerOnSend(Koshien, 'player_y', 0, params => {
            const {receiver} = params;
            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_targetCoordinate', 'value');
            converter.addField(block, 'TARGET', 'player');
            converter.addField(block, 'COORDINATE', 'y');
            return block;
        });

        converter.registerOnSend(Koshien, 'turn_over', 0, params => {
            const {receiver} = params;
            return converter.changeRubyExpressionBlock(receiver, 'koshien_turnOver', 'statement');
        });

        const checkX = block => {
            if (converter.isBlock(block)) return true;
            if (!converter.isNumber(block)) return false;
            return block.value >= 0 && block.value <= 14;
        };
        const checkY = checkX;
        converter.registerOnSend(Koshien, 'position', 2, params => {
            const {receiver, args} = params;

            if (!checkX(args[0])) return null;
            if (!checkY(args[1])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_position', 'value');
            converter.addNumberInput(block, 'X', 'math_number', args[0], 0);
            converter.addNumberInput(block, 'Y', 'math_number', args[1], 0);
            return block;
        });

        converter.registerOnSend(Koshien, 'position_of_x', 1, params => {
            const {receiver, args} = params;

            if (!checkPosition(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_positionOf', 'value');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            converter.addField(block, 'COORDINATE', 'x');
            return block;
        });

        converter.registerOnSend(Koshien, 'position_of_y', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_positionOf', 'value');
            converter.addTextInput(block, 'POSITION', args[0], '0:0');
            converter.addField(block, 'COORDINATE', 'y');
            return block;
        });

        converter.registerOnSend(Koshien, 'object', 1, params => {
            const {receiver, args} = params;

            if (!converter.isString(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'koshien_object', 'value');
            converter.addField(block, 'OBJECT', args[0]);
            return block;
        });
    }
};

export default KoshienConverter;
