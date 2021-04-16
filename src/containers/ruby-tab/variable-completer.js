/**
 * Define Ruby code completer for Variable Blocks
 */
class VariableCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'show_variable("$変数")',
                meta: '変数 変数 を表示する'
            },
            {
                value: 'hide_variable("$変数")',
                meta: '変数 変数 を隠す'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default VariableCompleter;
