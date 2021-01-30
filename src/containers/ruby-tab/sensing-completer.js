/**
 * Define Ruby code completer for Sensing Blocks
 */
class SensingCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'touching?("_mouse_")',
                meta: 'マウスのポインターに触れた'
            },
            {
                value: 'touching_color?("#571332")',
                meta: '#571332の色に触れた'
            },
            {
                value: 'color_is_touching_color?("#ce2ef7", "#6a7a0e")',
                meta: '#ce2ef7が#6a7a0eの色に触れた'
            },
            {
                value: 'distance("_mouse_")',
                meta: 'マウスのポインターまでの距離'
            },
            {
                value: 'ask("あなたの名前は何ですか?")',
                meta: 'あなたの名前は何ですかと聞いて待つ'
            },
            {
                value: 'answer',
                meta: '答え'
            },
            {
                value: 'Keyboard.pressed?("space")',
                meta: 'スペースキーが押された'
            },
            {
                value: 'Mouse.down?',
                meta: 'マウスが押された'
            },
            {
                value: 'Mouse.x',
                meta: 'マウスのx座標'
            },
            {
                value: 'Mouse.y',
                meta: 'マウスのy座標'
            },
            {
                value: 'self.drag_mode = "draggable"',
                meta: 'ドラッグできるようにする'
            },
            {
                value: 'loudness',
                meta: '音量'
            },
            {
                value: 'Timer.value',
                meta: 'タイマー'
            },
            {
                value: 'Timer.reset',
                meta: 'タイマーをリセット'
            },
            {
                value: 'stage.backdrop_number',
                meta: 'ステージの背景#'
            },
            {
                value: 'stage.backdrop_number',
                meta: 'ステージの背景#'
            },
            {
                value: 'Time.now.year',
                meta: '現在の年'
            },
            {
                value: 'days_since_2000',
                meta: '2000年からの日数'
            },
            {
                value: 'user_name',
                meta: 'ユーザー名'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default SensingCompleter;
