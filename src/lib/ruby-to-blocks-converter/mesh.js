const Mesh = 'mesh';

/**
 * Mesh extension converter
 */
const MeshConverter = {
    register: function (converter) {
        converter.registerOnSend('self', Mesh, 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(Mesh, node);
        });

        converter.registerOnSend(Mesh, 'sensor_value', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'mesh_getSensorValue', 'value');
            converter.addFieldInput(block, 'NAME', 'mesh_menu_variableNames', 'variableNames', args[0], ' ');
            return block;
        });
    }
};

export default MeshConverter;
