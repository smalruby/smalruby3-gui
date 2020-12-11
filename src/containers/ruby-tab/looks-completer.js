/**
 * Define Ruby code completer for Looks Blocks
 */
class LooksCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        console.log("pos: ", pos);
        const words = [
            {
                value:'say("こんにちは！", 2)',
                meta:'こんにちは！と2秒言う'
            },
            {
                value:'say("こんにちは！")',
                meta:'こんにちは！と言う'
            },
            {
                value:'think("うーん・・・", 2)',
                meta:'うーん・・・と2秒考える'
            },
            {
                value:'think("うーん...")',
                meta:'うーん・・・と考える'
            },            {
                value:'switch_costume("コスチューム1")',
                meta:'コスチュームをコスチューム1にする'
            },
            {
                value:'next_costume',
                meta:'次のコスチュームにする'
            },
            {
                value:'switch_backdrop("背景1")',
                meta:'背景を背景1にする'
            },
            {
                value:'next_backdrop',
                mata:'次の背景にする'
            },
            {
                value:'self.size += 10',
                meta:'大きさを10ずつ変える'
            },
            {
                value:'self.size = 100',
                meta:'大きさを100%にする'
            },
            {
                value:'change_effect_by("color", 25)',
                meta:'色の効果を25ずつかえる'
            },
            {
                value:'set_effect("color", 0)',
                meta:'色の効果を0にする'
            },
            {
                value:'clear_graphic_effects',
                meta:'画像効果をなくす'
            },
            {
                value:'show',
                meta:'表示する'
            },
            {
                value:'hide',
                meta:'隠す'
            },
            {
                value:'go_layers(1, "forward")',
                meta:'一層手前にだす'
            },
            {
                value:'costume_number',
                meta:'コスチュームの番号'
            },
            {
                value:'backdrop_number',
                meta:'背景の番号'
            },
            {
                value:'size',
                meta:'大きさ'
            }
        ];

        let completions = [];
        words.forEach(function(w) {
            completions.push({
                value: w.value,
                meta: w.meta,                               
            });
        });
        callback(null, completions);
    }
}

export default LooksCompleter;
