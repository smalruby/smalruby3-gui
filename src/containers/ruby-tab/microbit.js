/**
 * Define Ruby code completer for micro:bit Blocks
 */
class MicrobitCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'self.when(:microbit_button_pressed, "A") do\nend',
                meta: 'ボタンAが押されたとき'
            },
            {
                value: 'microbit.button_pressed?("A")',
                meta: 'ボタンAが押された'
            },
            {
                value: 'self.when(:microbit_gesture, "moved") do\nend',
                meta: '動いたとき'
            },
            {
                value: 'microbit.display_text("Hello!")',
                meta: 'Hello!を表示する'
            },
            {
                value: 'microbit.display(\n".1.1.",\n"1.1.1",\n"1...1",\n".1.1.",\n"..1.."\n)',
                meta: 'ハートマークを表示する'
            },
            {
                value: 'self.when(:microbit_tilted, "any") do\nend',
                meta: 'どれかの向きに傾いたとき'
            },
            {
                value: 'microbit.tilted?("any")',
                meta: 'どれかの向きに傾いた'
            },
            {
                value: 'microbit.tilt_angle("front")',
                meta: '前方向の傾き'
            },
            {
                value: 'self.when(:microbit_pin_connected, 0) do\nend',
                meta: 'ピン0がつながったとき'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default MicrobitCompleter;
