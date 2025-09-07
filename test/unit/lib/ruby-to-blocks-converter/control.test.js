import RubyToBlocksConverter from '../../../../src/lib/ruby-to-blocks-converter';
import {
    convertAndExpectRubyBlockError
} from '../../../helpers/expect-to-equal-blocks';

describe('RubyToBlocksConverter/Control', () => {
    let converter;
    let target;
    let code;

    beforeEach(() => {
        converter = new RubyToBlocksConverter(null);
        target = null;
        code = null;
    });

    describe('control_wait', () => {
        test('invalid', () => {
            [
                'sleep',
                'sleep()',
                'sleep(abc)',
                'sleep("abc")',
                'sleep(1, 2)'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });
        });
    });

    describe('control_repeat', () => {
        test('invalid', () => {
            [
                '10.times',
                '10.times(1)'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });

            [
                '10.times { |i| }',
                '"10".times { }'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });
        });

        describe('repeat', () => {
            test('invalid', () => {
                [
                    'repeat(10)',
                    'repeat(10, 1)'
                ].forEach(c => {
                    convertAndExpectRubyBlockError(converter, target, c);
                });

                [
                    'repeat(10) { |i| }',
                    'repeat("10") { }'
                ].forEach(c => {
                    convertAndExpectRubyBlockError(converter, target, c);
                });
            });
        });
    });

    describe('control_forever', () => {
        test('invalid', () => {
            [
                'loop()',
                'loop(1)',
                'forever()',
                'forever(1)'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });

            [
                'loop { |a| bounce_if_on_edge; wait }',
                'loop(1) { bounce_if_on_edge; wait }',
                'forever(1) { bounce_if_on_edge }',
                'forever(1) { |a| bounce_if_on_edge }'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });
        });
    });

    describe('control_if', () => {
        test('error', () => {
            code = `
                if move(10)
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].text).toMatch(/condition is not boolean: move\(10\)/);
            expect(res).toBeFalsy();
        });
    });

    describe('control_if_else', () => {
        test('error', () => {
            code = `
                if move(10)
                else
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].text).toMatch(/condition is not boolean: move\(10\)/);
            expect(res).toBeFalsy();
        });
    });

    describe('control_wait_until', () => {
        test('error', () => {
            code = 'wait until move(10)';
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].text).toMatch(/condition is not boolean: move\(10\)/);
            expect(res).toBeFalsy();
        });
    });

    describe('control_repeat_until', () => {
        test('error', () => {
            code = `
                until move(10)
                  bounce_if_on_edge
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].text).toMatch(/condition is not boolean: move\(10\)/);
            expect(res).toBeFalsy();
        });
    });

    describe('control_stop', () => {
        test('invalid', () => {
            [
                'stop',
                'stop()',
                'stop(1)',
                'stop("invalid option")',
                'stop("all", 1)'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });
        });
    });

    describe('control_create_clone_of', () => {
        test('invalid', () => {
            [
                'create_clone',
                'create_clone()',
                'create_clone(1)',
                'create_clone(move(10))',
                'create_clone("_myself_", 1)'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });
        });
    });

    describe('control_delete_this_clone', () => {
        test('invalid', () => {
            [
                '12.delete_this_clone',
                'delete_this_clone(1)'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });
        });
    });

    describe('control_start_as_clone', () => {
        test('invalid', () => {
            [
                'self.when(:start_as_a_clone)',
                'self.when(:start_as_a_clone, 1)'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });

            [
                '12.when(:start_as_a_clone) {}'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });
        });
    });

    describe('Stage/Clone validation', () => {
        let stageTarget;

        beforeEach(() => {
            stageTarget = {
                isStage: true,
                variables: {},
                sprite: {}
            };
        });

        test('sprite-only clone blocks should throw error on stage', () => {
            const spriteOnlyCommands = [
                'delete_this_clone',
                'self.when_start_as_a_clone {}'
            ];

            spriteOnlyCommands.forEach(command => {
                const result = converter.targetCodeToBlocks(stageTarget, command);
                expect(result).toBeFalsy();
                expect(converter.errors).toHaveLength(1);
                expect(converter.errors[0].text).toMatch(/"\{SOURCE\}" is the wrong instruction\./);
                converter.reset();
            });
        });

        test('stage-common blocks should work on stage', () => {
            const stageCommonCommands = [
                'create_clone("Sprite1")',
                'sleep(1)',
                'repeat(3) {}',
                'forever {}',
                'stop("all")'
            ];

            stageCommonCommands.forEach(command => {
                const result = converter.targetCodeToBlocks(stageTarget, command);
                expect(result).toBeTruthy();
                expect(converter.errors).toHaveLength(0);
                converter.reset();
            });
        });

        test('all blocks should work on sprite', () => {
            const allCommands = [
                'delete_this_clone',
                'self.when_start_as_a_clone {}',
                'create_clone("Sprite1")',
                'sleep(1)',
                'repeat(3) {}',
                'forever {}',
                'stop("all")'
            ];

            allCommands.forEach(command => {
                const result = converter.targetCodeToBlocks(target, command);
                expect(result).toBeTruthy();
                expect(converter.errors).toHaveLength(0);
                converter.reset();
            });
        });
    });
});
