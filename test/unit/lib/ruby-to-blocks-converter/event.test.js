import RubyToBlocksConverter from '../../../../src/lib/ruby-to-blocks-converter';
import {
    convertAndExpectRubyBlockError
} from '../../../helpers/expect-to-equal-blocks';

describe('RubyToBlocksConverter/Event', () => {
    let converter;
    let target;
    let code;

    beforeEach(() => {
        converter = new RubyToBlocksConverter(null);
        target = null;
        code = null;
    });

    describe('event_whenflagclicked', () => {
        test('invalid', () => {
            [
                'self.when(:flag_clicked)'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });

            [
                'self.when(:flag_clicked, 1) { bounce_if_on_edge }',
                'self.when(:flag_click) { bounce_if_on_edge }',
                'when_flag_click { bounce_if_on_edge }'
            ].forEach(s => {
                convertAndExpectRubyBlockError(converter, target, s);
            });
        });

        test('error', () => {
            code = `
                forever do
                  self.when(:flag_clicked) do
                  end
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].row).toEqual(2);
            expect(res).toBeFalsy();
        });
    });

    describe('event_whenkeypressed', () => {
        test('invalid', () => {
            [
                'self.when(:key_pressed)',
                'self.when("space")',
                'self.when(:key_pressed, "space", 1)',
                'self.when(:key_pressed, "invalid key")'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });

            [
                'self.when(:key_pressed) { bounce_if_on_edge }',
                'self.when(:key_pressed, "space", 1) { bounce_if_on_edge }',
                'self.when(:key_pressed, "invalid key") { bounce_if_on_edge }'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });
        });

        test('error', () => {
            code = `
                forever do
                  self.when(:key_pressed, "space") do
                  end
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].row).toEqual(2);
            expect(res).toBeFalsy();
        });
    });

    [
        {
            opcode: 'event_whenthisspriteclicked',
            isStage: false
        },
        {
            opcode: 'event_whenstageclicked',
            isStage: true
        }
    ].forEach(info => {
        describe(`${info.opcode}`, () => {
            beforeEach(() => {
                target = {
                    isStage: info.isStage
                };
            });

            test('invalid', () => {
                [
                    'self.when(:clicked)'
                ].forEach(s => {
                    convertAndExpectRubyBlockError(converter, target, s);
                });

                [
                    'self.when(:clicked, 1) { sleep(1) }',
                    'self.when(:click) { sleep(1) }'
                ].forEach(s => {
                    convertAndExpectRubyBlockError(converter, target, s);
                });
            });

            test('error', () => {
                code = `
                    forever do
                      self.when(:clicked) do
                      end
                    end
                `;
                const res = converter.targetCodeToBlocks(target, code);
                expect(converter.errors).toHaveLength(1);
                expect(converter.errors[0].row).toEqual(2);
                expect(res).toBeFalsy();
            });
        });
    });

    describe('event_whenbackdropswitchesto', () => {
        test('invalid', () => {
            [
                'self.when(:backdrop_switches)',
                'self.when("backdrop1")',
                'self.when(:backdrop_switches, "backdrop1", 1)'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });

            [
                'self.when(:backdrop_switches) { bounce_if_on_edge }',
                'self.when(:backdrop_switches, "backdrop1", 1) { bounce_if_on_edge }'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });
        });

        test('error', () => {
            code = `
                forever do
                  self.when(:backdrop_switches, "backdrop1") do
                  end
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].row).toEqual(2);
            expect(res).toBeFalsy();
        });
    });

    describe('event_whengreaterthan', () => {
        test('invalid', () => {
            [
                'self.when(:greater_than)',
                'self.when("loudness")',
                'self.when(:greater_than, "loudness")',
                'self.when(:greater_than, "loudness", 10, 11)'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });

            [
                'self.when(:greater_than) { bounce_if_on_edge }',
                'self.when(:greater_than, "loudness") { bounce_if_on_edge }',
                'self.when(:greater_than, "invalid", 10) { bounce_if_on_edge }',
                'self.when(:greater_than, "loudness", 10, 11) { bounce_if_on_edge }'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });
        });

        test('error', () => {
            code = `
                forever do
                  self.when(:greater_than, "loudness", 10) do
                  end
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].row).toEqual(2);
            expect(res).toBeFalsy();
        });
    });

    describe('event_whenbroadcastreceived', () => {
        test('invalid', () => {
            [
                'self.when(:receive)',
                'self.when("message1")',
                'self.when(:receive, "message1")'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });

            [
                'self.when(:receive) { bounce_if_on_edge }',
                'self.when(:receive, "message1", 1) { bounce_if_on_edge }'
            ].forEach(c => {
                convertAndExpectRubyBlockError(converter, target, c);
            });
        });

        test('error', () => {
            code = `
                forever do
                  self.when(:receive, "message1") do
                  end
                end
            `;
            const res = converter.targetCodeToBlocks(target, code);
            expect(converter.errors).toHaveLength(1);
            expect(converter.errors[0].row).toEqual(2);
            expect(res).toBeFalsy();
        });
    });

    [
        {
            opcode: 'event_broadcast',
            methodName: 'broadcast'
        },
        {
            opcode: 'event_broadcastandwait',
            methodName: 'broadcast_and_wait'
        }
    ].forEach(info => {
        describe(`${info.opcode}`, () => {
            test('invalid', () => {
                [
                    `${info.methodName}`,
                    `${info.methodName}()`,
                    `${info.methodName}(1)`,
                    `${info.methodName}("message1", 1)`
                ].forEach(c => {
                    convertAndExpectRubyBlockError(converter, target, c);
                });
            });
        });
    });
});
