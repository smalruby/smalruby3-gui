/**
 * Define Ruby code completer for Motion Blocks
 */
class MotionCompleter {
    getCompletions (editor, session, pos, prefix, callback) {
        console.log("pos: ", pos);
        const words = [
            "move(10)",
            "turn_right(15)",
            "turn_left(15)",
            'go_to("_random_")',
            "go_to([0, 0])",
            'glide("_random_", secs: 1)',
            "glide([0, 0], secs: 1)",
            "self.direction = 90",
        ];
        let completions = [];
        words.forEach(function(w) {
            completions.push({
                value: w,
                meta: "my completion"
            });
        });
        callback(null, completions);
    }
}

export default MotionCompleter;
