/**
 * Define Ruby code completer for Motion Blocks
 */
class SoundCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        const words = [
            {
                value: 'play_until_done("ニャー")',
                meta: '終わるまでニャーの音を鳴らす'
            },
            {
                value: 'play("ニャー")',
                meta: 'ニャーの音を鳴らす'
            },
            {
                value: 'stop_all_sounds',
                meta: 'すべての音を止める'
            },
            {
                value: 'change_sound_effect_by("PITCH",10)',
                meta: 'ピッチの効果を10ずつ変える'
            },
            {
                value: 'set_sound_effect("PITCH", 100)',
                meta: 'ピッチの効果を100にする'
            },
            {
                value: 'clear_sound_effects',
                meta: '音の効果をなくす'
            },
            {
                value: 'self.volume += -10',
                meta: '音量を-10ずつ変える'
            },
            {
                value: 'self.volume =100',
                meta: '音量を100%にする'
            },
            {
                value: 'volume',
                meta: '音量'
            }
        ];
        const completions = [];
        words.forEach(
            w => completions.push(w)
        );
        callback(null, completions);
    }
}

export default SoundCompleter;
