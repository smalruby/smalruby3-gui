/**
 * Define Ruby code completer for Motion Blocks
 */
class MotionCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        console.log("pos: ", pos);
        const words = [
            {
                value: "move(10)",
                meta: "10歩動かす" 
            },
            {
                value: "turn_right(15)",
                meta: "15度回す"
            }
        ];
        let completions = [];
        words.forEach(function(w) {
            completions.push(w);
        });
        callback(null, completions);
    }
}

export default MotionCompleter;
