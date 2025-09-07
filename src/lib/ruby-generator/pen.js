/**
 * Define Ruby code generator for Pen Blocks
 * @param {RubyGenerator} Generator The RubyGenerator
 * @return {RubyGenerator} same as param.
 */
export default function (Generator) {
    Generator.pen_clear = function () {
        return 'Pen.clear\n';
    };

    Generator.pen_stamp = function () {
        return 'pen.stamp\n';
    };

    Generator.pen_penDown = function () {
        return 'pen.down\n';
    };

    Generator.pen_penUp = function () {
        return 'pen.up\n';
    };

    Generator.pen_setPenColorToColor = function (block) {
        const color = Generator.valueToCode(block, 'COLOR', Generator.ORDER_NONE) || null;
        return `pen.color = ${color}\n`;
    };

    Generator.pen_changePenColorParamBy = function (block) {
        const colorParam = Generator.valueToCode(block, 'COLOR_PARAM', Generator.ORDER_NONE) || null;
        const value = Generator.valueToCode(block, 'VALUE', Generator.ORDER_NONE) || 0;
        return `pen.${colorParam} += ${value}\n`;
    };

    Generator.pen_setPenColorParamTo = function (block) {
        const colorParam = Generator.valueToCode(block, 'COLOR_PARAM', Generator.ORDER_NONE) || null;
        const value = Generator.valueToCode(block, 'VALUE', Generator.ORDER_NONE) || 0;
        return `pen.${colorParam} = ${value}\n`;
    };

    Generator.pen_menu_colorParam = function (block) {
        const colorParam = Generator.getFieldValue(block, 'colorParam') || 'color';
        return [colorParam, Generator.ORDER_ATOMIC];
    };

    Generator.pen_changePenSizeBy = function (block) {
        const size = Generator.valueToCode(block, 'SIZE', Generator.ORDER_NONE) || 0;
        return `pen.size += ${size}\n`;
    };

    Generator.pen_setPenSizeTo = function (block) {
        const size = Generator.valueToCode(block, 'SIZE', Generator.ORDER_NONE) || 0;
        return `pen.size = ${size}\n`;
    };

    return Generator;
}
