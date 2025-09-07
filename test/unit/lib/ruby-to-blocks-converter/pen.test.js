import RubyToBlocksConverter from '../../../../src/lib/ruby-to-blocks-converter';
import {
    convertAndExpectToEqualBlocks,
    convertAndExpectRubyBlockError,
    rubyToExpected,
    expectedInfo
} from '../../../helpers/expect-to-equal-blocks';

describe('RubyToBlocksConverter/Pen', () => {
    let converter;
    let target;
    let code;
    let expected;

    beforeEach(() => {
        converter = new RubyToBlocksConverter(null);
        target = null;
        code = null;
        expected = null;
    });

    test('pen_setPenColorToColor', () => {
        code = 'pen.color = "#e36e1a"';
        expected = [
            {
                opcode: 'pen_setPenColorToColor',
                inputs: [
                    {
                        name: 'COLOR',
                        block: {
                            opcode: 'colour_picker',
                            fields: [
                                {
                                    name: 'COLOUR',
                                    value: '#e36e1a'
                                }
                            ],
                            shadow: true
                        }
                    }
                ]
            }
        ];
        convertAndExpectToEqualBlocks(converter, target, code, expected);

        [
            'pen.color = "10"',
            'pen.color = :symbol',
            'pen.color = abc'
        ].forEach(s => {
            convertAndExpectRubyBlockError(converter, target, s);
        });
    });

    const colorParamNames = [
        'color',
        'saturation',
        'brightness',
        'transparency'
    ];

    colorParamNames.forEach(colorParamName => {
        const colorParam = {
            name: 'COLOR_PARAM',
            block: {
                opcode: 'pen_menu_colorParam',
                fields: [
                    {
                        name: 'colorParam',
                        value: `${colorParamName}`
                    }
                ],
                shadow: true
            }
        };

        describe(colorParamName, () => {
            test('pen_changePenColorParamBy', () => {
                code = `pen.${colorParamName} += 10`;
                expected = [
                    {
                        opcode: 'pen_changePenColorParamBy',
                        inputs: [
                            colorParam,
                            {
                                name: 'VALUE',
                                block: expectedInfo.makeNumber(10)
                            }
                        ]
                    }
                ];
                convertAndExpectToEqualBlocks(converter, target, code, expected);

                code = `pen.${colorParamName} += y`;
                expected = [
                    {
                        opcode: 'pen_changePenColorParamBy',
                        inputs: [
                            colorParam,
                            {
                                name: 'VALUE',
                                block: rubyToExpected(converter, target, 'y')[0],
                                shadow: expectedInfo.makeNumber(10)
                            }
                        ]
                    }
                ];
                convertAndExpectToEqualBlocks(converter, target, code, expected);

                [
                    `pen.${colorParamName} += "10"`,
                    `pen.${colorParamName} += :symbol`,
                    `pen.${colorParamName} += abc`
                ].forEach(s => {
                    convertAndExpectRubyBlockError(converter, target, s);
                });
            });

            test('pen_setPenColorParamTo', () => {
                code = `pen.${colorParamName} = 50`;
                expected = [
                    {
                        opcode: 'pen_setPenColorParamTo',
                        inputs: [
                            colorParam,
                            {
                                name: 'VALUE',
                                block: expectedInfo.makeNumber(50)
                            }
                        ]
                    }
                ];
                convertAndExpectToEqualBlocks(converter, target, code, expected);

                code = `pen.${colorParamName} = y`;
                expected = [
                    {
                        opcode: 'pen_setPenColorParamTo',
                        inputs: [
                            colorParam,
                            {
                                name: 'VALUE',
                                block: rubyToExpected(converter, target, 'y')[0],
                                shadow: expectedInfo.makeNumber(50)
                            }
                        ]
                    }
                ];
                convertAndExpectToEqualBlocks(converter, target, code, expected);

                [
                    `pen.${colorParamName} = "10"`,
                    `pen.${colorParamName} = :symbol`,
                    `pen.${colorParamName} = abc`
                ].forEach(s => {
                    convertAndExpectRubyBlockError(converter, target, s);
                });
            });
        });
    });
});
