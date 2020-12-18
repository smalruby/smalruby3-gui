/**
 * Define Ruby code completer for Go Direct Force & Acceleration Blocks
 */
class Gdx_forCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'self.when(:gdx_for_gesture, "shaken") do\nend',
                meta: '振られたとき'
            },
            {
                value: 'self.when(:gdx_force_sensor, "pushed") do\nend',
                meta: 'force sensor押されたとき'
            },
            {
                value: 'gdx_for_force',
                meta: 'force'
            },
            {
                value: 'self.when(:gdx_for_tilted, "any") do\nend',
                meta: 'どれかの向きに傾いたとき'
            },
            {
                value: 'gdx_for_tilted?("any")',
                meta: 'どれかの向きに傾いた'
            },
            {
                value: 'gdx_for_tilt_angle("front")',
                meta: '前方向の傾き'
            },
            {
                value: 'gdx_for_falling?',
                meta: '落下中'
            },
            {
                value: 'gdx_for_spin_speed("z")',
                meta: 'z回転の速さ'
            },
            {
                value: 'gdx_for_acceleration("x")',
                meta: 'x方向への加速度'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default Gdx_forCompleter;
