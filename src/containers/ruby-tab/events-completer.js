/**
 * Define Ruby code completer for Motion Blocks
 */
class EventsCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'self.when(:flag_clicked) do\nend',
                meta: '旗が押されたとき'
            },
            {
                value: 'self.when(:key_pressed, "space") do\nend',
                meta: 'スペースキーが押されたとき'
            },
            {
                value: 'self.when(:clicked) do\nend',
                meta: 'このスプライトがクリックされたとき'
            },
            {
                value: 'self.when(:backdrop_switches, "背景1") do\nend',
                meta: '背景が背景1になったとき'
            },
            {
                value: 'self.when(:greater_than, "loudness", 10) do\nend',
                meta: '音量が10より小さいとき'
            },
            {
                value: 'self.when(:receive, "メッセージ1") do\nend',
                meta: 'メッセージ1を受け取ったとき'
            },
            {
                value: 'broadcast("メッセージ1")',
                meta: 'メッセージ1を送る'
            },
            {
                value: 'broadcast_and_wait("メッセージ1")',
                meta: 'メッセージ1を送って待つ'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default EventsCompleter;
