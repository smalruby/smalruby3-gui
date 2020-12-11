/**
 * Define Ruby code completer for Control Blocks
 */
class ControlCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'sleep(1)',
                meta: '一秒待つ'
            },
            {
                value: '10.times do\nend',
                meta: '10回繰り返す'
            },
            {
                value: 'loop do\nend',
                meta: 'ずっと繰り返す'
            },
            {
                value: 'if false\nend',
                meta: 'もし~なら'
            },
            {
                value: 'if false\nelse\nend',
                meta: 'もし~なら　でなければ'
            },
            {
                value: 'self.when(:start_as_a_clone) do\nend',
                meta: 'クローンされたとき'
            },
            {
                value: 'create_clone("_myself_")',
                meta: '自分自身のクローンを作る'
            },
            {
                value: 'delete_this_clone',
                meta: 'このクローンを削除する'
            },
            {
                value: 'stop("all")',
                meta: 'すべてを止める'
            },
            {
                value: 'stop("this script")',
                meta: 'このスクリプトを止める'
            },
            {
                value: 'stop("other scripts in sprite")',
                meta: 'スプライトの他のスクリプトをを止める'
            }
        ];
        let completions = [];
        words.forEach(function (w) {
            completions.push(w);
        });
        callback(null, completions);
    }
}

export default ControlCompleter;