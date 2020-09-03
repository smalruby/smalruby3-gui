/* global Opal */
import _ from 'lodash';

const TranslateConverter = {
    // eslint-disable-next-line no-unused-vars
    onSend: function (receiver, name, args, rubyBlockArgs, rubyBlock) {
        let block;
        if ((this._isSelf(receiver) || receiver === Opal.nil) && !rubyBlock) {
            switch (name) {
            case 'translate':
                if (args.length === 2 && this._isNumberOrStringOrBlock(args[0])&&this._isString(args[1]))
                block = this._createBlock('translate_getTranslate', 'value');
                this._addTextInput(block,'WORDS',args[0])
                this._addInput(block,'LANGUAGE',this._createFieldBlock('translate_menu_languages','languages',args[1]));
                break;
            case 'language':
                block = this._createBlock('translate_getViewerLanguage', 'value');
                break;
            }
        }
    return block;
    }
};

export default TranslateConverter;