import RubyToBlocksConverter from '../../../../src/lib/ruby-to-blocks-converter';
import {
    convertAndExpectToEqualBlocks,
    convertAndExpectToEqualRubyStatement,
    rubyToExpected,
    expectedInfo,
    expectNoArgsMethod
} from '../../../helpers/expect-to-equal-blocks';

describe('RubyToBlocksConverter/Looks', () => {
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

    describe('looks_sayforsecs', () => {
        test('normal', () => {
            code = 'say("Hello!", 2)';
            expected = [
                {
                    opcode: 'looks_sayforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('Hello!')
                        },
                        {
                            name: 'SECS',
                            block: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'say(1, 2)';
            expected = [
                {
                    opcode: 'looks_sayforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('1')
                        },
                        {
                            name: 'SECS',
                            block: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'say(x, 2)';
            expected = [
                {
                    opcode: 'looks_sayforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeText('Hello!')
                        },
                        {
                            name: 'SECS',
                            block: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'say(x, y)';
            expected = [
                {
                    opcode: 'looks_sayforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeText('Hello!')
                        },
                        {
                            name: 'SECS',
                            block: rubyToExpected(converter, target, 'y')[0],
                            shadow: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'say("Hello!", "2")',
                'say("Hello!", 2, 3)',
                'say(false, 2)',
                'say("Hello!", false)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_say', () => {
        test('normal', () => {
            code = 'say("Hello!")';
            expected = [
                {
                    opcode: 'looks_say',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('Hello!')
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'say(1)';
            expected = [
                {
                    opcode: 'looks_say',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('1')
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'say(x)';
            expected = [
                {
                    opcode: 'looks_say',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeText('Hello!')
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'say',
                'say(false)',
                'say(true)',
                'say(1, 2, 1)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_thinkforsecs', () => {
        test('normal', () => {
            code = 'think("Hmm...", 2)';
            expected = [
                {
                    opcode: 'looks_thinkforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('Hmm...')
                        },
                        {
                            name: 'SECS',
                            block: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'think(1, 2)';
            expected = [
                {
                    opcode: 'looks_thinkforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('1')
                        },
                        {
                            name: 'SECS',
                            block: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'think(x, 2)';
            expected = [
                {
                    opcode: 'looks_thinkforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeText('Hmm...')
                        },
                        {
                            name: 'SECS',
                            block: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'think(x, y)';
            expected = [
                {
                    opcode: 'looks_thinkforsecs',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeText('Hmm...')
                        },
                        {
                            name: 'SECS',
                            block: rubyToExpected(converter, target, 'y')[0],
                            shadow: expectedInfo.makeNumber(2)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'think("Hello!", "2")',
                'think("Hello!", 2, 3)',
                'think(false, 2)',
                'think("Hello!", false)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_think', () => {
        test('normal', () => {
            code = 'think("Hmm...")';
            expected = [
                {
                    opcode: 'looks_think',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('Hmm...')
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'think(1)';
            expected = [
                {
                    opcode: 'looks_think',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: expectedInfo.makeText('1')
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'think(x)';
            expected = [
                {
                    opcode: 'looks_think',
                    inputs: [
                        {
                            name: 'MESSAGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeText('Hmm...')
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'think',
                'think(false)',
                'think(true)',
                'think(1, 2, 1)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_switchcostumeto', () => {
        test('normal', () => {
            code = 'switch_costume("costume2")';
            expected = [
                {
                    opcode: 'looks_switchcostumeto',
                    inputs: [
                        {
                            name: 'COSTUME',
                            block: {
                                opcode: 'looks_costume',
                                fields: [
                                    {
                                        name: 'COSTUME',
                                        value: 'costume2'
                                    }
                                ],
                                shadow: true
                            }
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'switch_costume',
                'switch_costume(false)',
                'switch_costume(true)',
                'switch_costume(1)',
                'switch_costume(x)',
                'switch_costume("costume2", 1)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    expectNoArgsMethod('looks_nextcostume', 'next_costume');

    describe('looks_switchbackdropto', () => {
        test('normal', () => {
            code = 'switch_backdrop("backdrop2")';
            expected = [
                {
                    opcode: 'looks_switchbackdropto',
                    inputs: [
                        {
                            name: 'BACKDROP',
                            block: {
                                opcode: 'looks_backdrops',
                                fields: [
                                    {
                                        name: 'BACKDROP',
                                        value: 'backdrop2'
                                    }
                                ],
                                shadow: true
                            }
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'switch_backdrop',
                'switch_backdrop(false)',
                'switch_backdrop(true)',
                'switch_backdrop(1)',
                'switch_backdrop(x)',
                'switch_backdrop("backdrop2", 1)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    expectNoArgsMethod('looks_nextbackdrop', 'next_backdrop');

    describe('looks_changesizeby', () => {
        test('normal', () => {
            code = 'self.size += 10';
            expected = [
                {
                    opcode: 'looks_changesizeby',
                    inputs: [
                        {
                            name: 'CHANGE',
                            block: expectedInfo.makeNumber(10)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'self.size += x';
            expected = [
                {
                    opcode: 'looks_changesizeby',
                    inputs: [
                        {
                            name: 'CHANGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeNumber(10)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'self.size += "10"',
                'self.size += :symbol',
                'self.size += abc'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_setsizeto', () => {
        test('normal', () => {
            code = 'self.size = 10';
            expected = [
                {
                    opcode: 'looks_setsizeto',
                    inputs: [
                        {
                            name: 'SIZE',
                            block: expectedInfo.makeNumber(10)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'self.size = x';
            expected = [
                {
                    opcode: 'looks_setsizeto',
                    inputs: [
                        {
                            name: 'SIZE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeNumber(100)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'self.size = "10"',
                'self.size = :symbol',
                'self.size = abc'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_changeeffectby', () => {
        test('normal', () => {
            code = 'change_effect_by("COLOR", 25)';
            expected = [
                {
                    opcode: 'looks_changeeffectby',
                    fields: [
                        {
                            name: 'EFFECT',
                            value: 'COLOR'
                        }
                    ],
                    inputs: [
                        {
                            name: 'CHANGE',
                            block: expectedInfo.makeNumber(25)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'change_effect_by("COLOR", x)';
            expected = [
                {
                    opcode: 'looks_changeeffectby',
                    fields: [
                        {
                            name: 'EFFECT',
                            value: 'COLOR'
                        }
                    ],
                    inputs: [
                        {
                            name: 'CHANGE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeNumber(25)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'change_effect_by',
                'change_effect_by()',
                'change_effect_by("COLOR")',
                'change_effect_by(25)',
                'change_effect_by("invalid effect", 25)',
                'change_effect_by(1, 25)',
                'change_effect_by("COLOR", 25, 1)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    describe('looks_seteffectto', () => {
        test('normal', () => {
            code = 'set_effect("COLOR", 25)';
            expected = [
                {
                    opcode: 'looks_seteffectto',
                    fields: [
                        {
                            name: 'EFFECT',
                            value: 'COLOR'
                        }
                    ],
                    inputs: [
                        {
                            name: 'VALUE',
                            block: expectedInfo.makeNumber(25)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);

            code = 'set_effect("COLOR", x)';
            expected = [
                {
                    opcode: 'looks_seteffectto',
                    fields: [
                        {
                            name: 'EFFECT',
                            value: 'COLOR'
                        }
                    ],
                    inputs: [
                        {
                            name: 'VALUE',
                            block: rubyToExpected(converter, target, 'x')[0],
                            shadow: expectedInfo.makeNumber(25)
                        }
                    ]
                }
            ];
            convertAndExpectToEqualBlocks(converter, target, code, expected);
        });

        test('invalid', () => {
            [
                'set_effect',
                'set_effect()',
                'set_effect("COLOR")',
                'set_effect(25)',
                'set_effect("invalid effect", 25)',
                'set_effect(1, 25)',
                'set_effect("COLOR", 25, 1)'
            ].forEach(c => {
                convertAndExpectToEqualRubyStatement(converter, target, c, c);
            });
        });
    });

    expectNoArgsMethod('looks_cleargraphiceffects', 'clear_graphic_effects');
    expectNoArgsMethod('looks_show', 'show');
    expectNoArgsMethod('looks_hide', 'hide');
    expectNoArgsMethod('looks_size', 'size');
});
