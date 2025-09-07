import BaseCompleter from './base-completer';

import MotionSnippets from './motion-snippets.json';
import LooksSnippets from './looks-snippets.json';
import SoundSnippets from './sound-snippets.json';
import EventsSnippets from './events-snippets.json';
import ControlSnippets from './control-snippets.json';
import SensingSnippets from './sensing-snippets.json';
import OperatorsSnippets from './operators-snippets.json';
import VariablesSnippets from './variables-snippets.json';
import ProcedureSnippets from './procedure-snippets.json';

import MusicSnippets from './music-snippets.json';
import PenSnippets from './pen-snippets.json';
import VideoSensingSnippets from './video-sensing-snippets.json';
import TextToSpeechSnippets from './text-to-speech-snippets.json';
import TranslateSnippets from './translate-snippets.json';
import MicrobitSnippets from './microbit-snippets.json';
import MeshSnippets from './mesh-snippets.json';
import SmalrubotS1Snippets from './smalrubot-s1-snippets.json';
import MicrobitMoreSnippets from './microbit-more-snippets.json';
import KoshienSnippets from './koshien-snippets.json';
import MakeySnippets from './makey-snippets.json';
import GdxForSnippets from './gdx_for-snippets.json';

class SnippetsCompleter extends BaseCompleter {
    #completions = [];

    constructor () {
        super();

        const snippetsList = [
            MotionSnippets,
            LooksSnippets,
            SoundSnippets,
            EventsSnippets,
            ControlSnippets,
            SensingSnippets,
            OperatorsSnippets,
            VariablesSnippets,
            ProcedureSnippets,

            MusicSnippets,
            PenSnippets,
            VideoSensingSnippets,
            TextToSpeechSnippets,
            TranslateSnippets,
            MicrobitSnippets,
            MeshSnippets,
            SmalrubotS1Snippets,
            MicrobitMoreSnippets,
            KoshienSnippets,
            MakeySnippets,
            GdxForSnippets
        ];
        snippetsList.forEach(snippets => {
            for (const [caption, item] of Object.entries(snippets)) {
                item.caption = caption;
                item.type = 'snippet';
                this.#completions.push(item);
            }
        });
    }

    getCompletions (editor, session, pos, prefix, callback) {
        callback(null, this.#completions);
    }
}

export default SnippetsCompleter;
