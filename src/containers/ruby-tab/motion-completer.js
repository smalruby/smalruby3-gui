/**
 * Define Ruby code completer for Motion Blocks
 */
class MotionCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'move(10)',
                meta: '10歩動かす'
            },
            {
                value: 'turn_right(15)',
                meta: '時計回りに15度回す'
            },
            {
                value: 'turn_left(15)',
                meta: '反時計回りに15度回す'
            },
            {
                value: 'go_to("_random_")',
                meta: 'どこかの場所へ行く'
            },
            {
                value: 'go_to([0, 0])',
                meta: 'x座標を0、y座標を0にする'
            },
            {
                value: 'glide("_random_", secs: 1)',
                meta: '1秒でどこかの場所へ行く'
            },
            {
                value: 'glide([0, 0], secs: 1)',
                meta: '1秒でx座標を0に、y座標を0にする'
            },
            {
                value: 'self.direction = 90',
                meta: '90度に向ける'
            },
            {
                value: 'point_towards("_mouse_")',
                meta: 'マウスのポインターへ向ける'
            },
            {
                value: 'self.x += 10',
                meta: 'x座標を10ずつ変える'
            },
            {
                value: 'self.x = 0',
                meta: 'x座標を0にする'
            },
            {
                value: 'self.y += 10',
                meta: 'y座標を10ずつ変える'
            },
            {
                value: 'self.y = 0',
                meta: 'y座標を9にする'
            },
            {
                value: 'bounce_if_on_edge',
                meta: 'もし端についたら、跳ね返る'
            },
            {
                value: 'self.rotation_style = "left-right"',
                meta: '回転方法を左右のみにする'
            },
            {
                value: 'x',
                meta: 'x座標'
            },
            {
                value: 'y',
                meta: 'y座標'
            },
            {
                value: 'direction',
                meta: '向き'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default MotionCompleter;
