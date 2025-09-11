import Primitive from './primitive';

const Text2Speech = 'text2speech';

const VoiceMenu = [
    'ALTO',
    'TENOR',
    'SQUEAK',
    'GIANT',
    'KITTEN'
];

const LanguageMenu = [
    'ar',
    'zh-cn',
    'da',
    'nl',
    'en',
    'fr',
    'de',
    'hi',
    'is',
    'it',
    'ja',
    'ko',
    'nb',
    'pl',
    'pt-br',
    'pt',
    'ro',
    'ru',
    'ES',
    'es-419',
    'sv',
    'tr',
    'cy'
];

/**
 * Text to Speech converter
 */
const Text2SpeechConverter = {
    register: function (converter) {
        converter.registerOnSend('self', Text2Speech, 0, params => {
            const {node} = params;

            return converter.createRubyExpressionBlock(Text2Speech, node);
        });

        converter.registerOnSend(Text2Speech, 'speak', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;

            const block = converter.changeRubyExpressionBlock(receiver, 'text2speech_speakAndWait', 'statement');
            converter.addTextInput(block, 'WORDS', args[0], 'hello');
            return block;
        });

        converter.registerOnSend(Text2Speech, 'voice=', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = VoiceMenu.indexOf(args[0].toString().toUpperCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', VoiceMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'text2speech_setVoice', 'statement');
            converter.addFieldInput(
                block, 'VOICE', 'text2speech_menu_voices', 'voices', args[0], 'ALTO'
            );
            return block;
        });

        converter.registerOnSend(Text2Speech, 'language=', 1, params => {
            const {receiver, args} = params;

            if (!converter.isStringOrBlock(args[0])) return null;
            if (converter.isString(args[0])) {
                const index = LanguageMenu.indexOf(args[0].toString().toLowerCase());
                if (index < 0) return null;

                args[0] = new Primitive('str', LanguageMenu[index], args[0].node);
            }

            const block = converter.changeRubyExpressionBlock(receiver, 'text2speech_setLanguage', 'statement');

            let defaultLanguage = 'en';
            const stage = converter.vm.runtime.getTargetForStage();
            if (stage && stage.textToSpeechLanguage) {
                defaultLanguage = stage.textToSpeechLanguage;
            }
            converter.addFieldInput(
                block, 'LANGUAGE', 'text2speech_menu_languages', 'languages', args[0], defaultLanguage
            );
            return block;
        });
    }
};

export default Text2SpeechConverter;
