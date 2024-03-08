import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import AceEditor from 'react-ace';
import {
    rubyCodeShape,
    updateRubyCode,
    updateRubyCodeTarget
} from '../reducers/ruby-code';
import VM from 'scratch-vm';
import {BLOCKS_TAB_INDEX} from '../reducers/editor-tab';

import RubyToBlocksConverterHOC from '../lib/ruby-to-blocks-converter-hoc.jsx';

import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/theme-clouds';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-language_tools';

import SnippetsCompleter from './ruby-tab/snippets-completer';

import rubyIcon from './ruby-tab/icon--ruby.svg';
import RubyDownloader from './ruby-downloader.jsx';
import collectMetadata from '../lib/collect-metadata.js';
import { closeFileMenu } from '../reducers/menus.js';
import styles from './ruby-tab/ruby-tab.css';
class RubyTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setAceEditorRef'
        ]);
    }

    componentDidUpdate (prevProps) {
        let modified = this.props.rubyCode.modified;
        if (modified) {
            const targetId = this.props.rubyCode.target ? this.props.rubyCode.target.id : null;
            const changedTarget =
                  this.props.vm.editingTarget && this.props.rubyCode.target &&
                  this.props.vm.editingTarget.id !== targetId;
            if (changedTarget || this.props.blocksTabVisible) {
                const converter = this.props.targetCodeToBlocks(this.props.intl);
                if (converter.result) {
                    converter.apply().then(() => {
                        modified = false;

                        if (!modified) {
                            if ((this.props.isVisible && !prevProps.isVisible) ||
                                (this.props.editingTarget && this.props.editingTarget !== prevProps.editingTarget)) {
                                this.props.updateRubyCodeTargetState(this.props.vm.editingTarget);
                            }
                        }

                        if (this.props.isVisible && !prevProps.isVisible) {
                            this.aceEditorRef.editor.renderer.updateFull();
                            this.aceEditorRef.editor.focus();
                        }
                    });
                    return;
                }
                const error = converter.errors[0];
                this.aceEditorRef.editor.moveCursorTo(error.row, error.column);
                this.aceEditorRef.editor.focus();
            }
        }

        if (!modified) {
            if ((this.props.isVisible && !prevProps.isVisible) ||
                (this.props.editingTarget && this.props.editingTarget !== prevProps.editingTarget)) {
                this.props.updateRubyCodeTargetState(this.props.vm.editingTarget);
            }
        }

        if (this.props.isVisible && !prevProps.isVisible) {
            this.aceEditorRef.editor.renderer.updateFull();
            this.aceEditorRef.editor.focus();
        }
    }

    setAceEditorRef (ref) {
        this.aceEditorRef = ref;
    }

    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.local);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        }
    }

    render () {
        const {
            onChange,
            rubyCode
        } = this.props;
        const {
            code,
            errors,
            markers
        } = rubyCode;

        const completers = [new SnippetsCompleter()];

        return (
            <>
                <AceEditor
                    annotations={errors}
                    editorProps={{$blockScrolling: true}}
                    fontSize={16}
                    height="inherit"
                    markers={markers}
                    mode="ruby"
                    name="ruby-editor"
                    ref={this.setAceEditorRef}
                    setOptions={{
                        tabSize: 2,
                        useSoftTabs: true,
                        showInvisibles: true,
                        enableAutoIndent: true,
                        enableBasicAutocompletion: completers,
                        enableLiveAutocompletion: true
                    }}
                    style={{
                        border: '1px solid hsla(0, 0%, 0%, 0.15)',
                        borderBottomRightRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                        fontFamily: ['Monaco', 'Menlo', 'Consolas', 'source-code-pro', 'monospace']
                    }}
                    theme="clouds"
                    value={code}
                    width="100%"
                    onChange={onChange}
                />
                <RubyDownloader>{(_, downloadProjectCallback) => (
                    <button
                        style={{
                            bottom: "1rem",
                            right: "1rem",
                            position: "absolute",
                            zIndex: "50",
                            width: "2.75rem",
                            height: "2.75rem",
                            border: "none",
                            borderRadius: "100%",
                            backgroundColor: "hsla(260, 60%, 60%, 1)",
                        }}
                        onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                    >
                        <img
                            src={rubyIcon}
                            alt="ruby download"
                            style={{
                                width: "2rem",
                                zIndex: "51"
                            }}
                        />
                    </button>
                )}
                </RubyDownloader>
            </>
        );
    }
}

RubyTab.propTypes = {
    blocksTabVisible: PropTypes.bool,
    editingTarget: PropTypes.string,
    intl: intlShape.isRequired,
    isVisible: PropTypes.bool,
    onChange: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    rubyCode: rubyCodeShape,
    targetCodeToBlocks: PropTypes.func,
    updateRubyCodeTargetState: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired,
    projectTitle: PropTypes.string,
    locale: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    blocksTabVisible: state.scratchGui.editorTab.activeTabIndex === BLOCKS_TAB_INDEX,
    editingTarget: state.scratchGui.targets.editingTarget,
    rubyCode: state.scratchGui.rubyCode,
    vm: state.scratchGui.vm,
    projectTitle: state.scratchGui.projectTitle,
    locale: state.locales.local,
});

const mapDispatchToProps = dispatch => ({
    onChange: code => dispatch(updateRubyCode(code)),
    updateRubyCodeTargetState: target => dispatch(updateRubyCodeTarget(target)),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
});

export default RubyToBlocksConverterHOC(injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(RubyTab)));
