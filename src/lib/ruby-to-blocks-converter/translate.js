import _ from 'lodash';

/**
 * Translate converter
 */
const TranslateConverter = {
    register: function (converter) {
        // translate method
        converter.registerOnSend('self', 'translate', 2, params => {
            const {args} = params;
            if (!converter._isNumberOrStringOrBlock(args[0]) || !converter._isStringOrBlock(args[1])) return null;

            const block = converter._createBlock('translate_getTranslate', 'value');
            converter._addTextInput(block, 'WORDS', args[0]);
            converter._addInput(
                block,
                'LANGUAGE',
                converter._createFieldBlock('translate_menu_languages', 'languages', args[1])
            );
            return block;
        });

        // language method
        converter.registerOnSend('self', 'language', 0, () =>
            converter._createBlock('translate_getViewerLanguage', 'value')
        );
    }
};

export default TranslateConverter;
