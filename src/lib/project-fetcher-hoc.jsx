import React from 'react';
import PropTypes from 'prop-types';
import {intlShape, injectIntl} from 'react-intl';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import xhr from 'xhr';

import {setProjectUnchanged} from '../reducers/project-changed';
import {
    LoadingStates,
    getIsCreatingNew,
    getIsFetchingWithId,
    getIsLoading,
    getIsShowingProject,
    onFetchedProjectData,
    projectError,
    setProjectId
} from '../reducers/project-state';
import {
    activateTab,
    BLOCKS_TAB_INDEX
} from '../reducers/editor-tab';

import log from './log';
import storage from './storage';

/* Higher Order Component to provide behavior for loading projects by id. If
 * there's no id, the default project is loaded.
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const ProjectFetcherHOC = function (WrappedComponent) {
    class ProjectFetcherComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'fetchProject',
                'fetchProjectFromUrl',
                'getFilenameFromUrl',
                'getProjectTitleFromFilename'
            ]);
            storage.setProjectHost(props.projectHost);
            storage.setProjectToken(props.projectToken);
            storage.setAssetHost(props.assetHost);
            storage.setTranslatorFunction(props.intl.formatMessage);
            // props.projectId might be unset, in which case we use our default;
            // or it may be set by an even higher HOC, and passed to us.
            // Either way, we now know what the initial projectId should be, so
            // set it in the redux store.
            if (
                props.projectId !== '' &&
                props.projectId !== null &&
                typeof props.projectId !== 'undefined'
            ) {
                this.props.setProjectId(props.projectId.toString());
            }
        }
        componentDidUpdate (prevProps) {
            if (prevProps.projectHost !== this.props.projectHost) {
                storage.setProjectHost(this.props.projectHost);
            }
            if (prevProps.projectToken !== this.props.projectToken) {
                storage.setProjectToken(this.props.projectToken);
            }
            if (prevProps.assetHost !== this.props.assetHost) {
                storage.setAssetHost(this.props.assetHost);
            }
            if (this.props.isFetchingWithId && !prevProps.isFetchingWithId) {
                this.fetchProject(this.props.reduxProjectId, this.props.loadingState);
            }
            if (this.props.isShowingProject && !prevProps.isShowingProject) {
                this.props.onProjectUnchanged();
            }
            if (this.props.isShowingProject && (prevProps.isLoadingProject || prevProps.isCreatingNew)) {
                this.props.onActivateTab(BLOCKS_TAB_INDEX);
            }
        }
        fetchProject (projectId, loadingState) {
            // Check if projectId is a URL
            if (projectId.match(/^https?:\/\//)) {
                return this.fetchProjectFromUrl(projectId, loadingState);
            }
            
            if (projectId !== '0' && !this.props.projectToken) {
                const errorHandler = err => {
                    this.props.onError(err);
                    log.error(err);
                };
                return new Promise((resolve, reject) => {
                    const options = {
                        method: 'GET',
                        uri: `https://api.smalruby.app/scratch-api-proxy/projects/${projectId}`,
                        json: true
                    };
                    xhr(options, (error, response) => {
                        if (error || response.statusCode !== 200) {
                            return reject(new Error(response.status));
                        }
                        resolve(response.body.project_token);
                    });
                })
                    .then(projectToken => {
                        storage.setProjectToken(projectToken);
                        storage
                            .load(storage.AssetType.Project, projectId, storage.DataFormat.JSON)
                            .then(projectAsset => {
                                if (projectAsset) {
                                    this.props.onFetchedProjectData(projectAsset.data, loadingState);
                                } else {
                                    // Treat failure to load as an error
                                    // Throw to be caught by catch later on
                                    throw new Error('Could not find project');
                                }
                            })
                            .catch(errorHandler);
                    }, errorHandler)
                    .catch(errorHandler);
            }
            return storage
                .load(storage.AssetType.Project, projectId, storage.DataFormat.JSON)
                .then(projectAsset => {
                    if (projectAsset) {
                        this.props.onFetchedProjectData(projectAsset.data, loadingState);
                    } else {
                        // Treat failure to load as an error
                        // Throw to be caught by catch later on
                        throw new Error('Could not find project');
                    }
                })
                .catch(err => {
                    this.props.onError(err);
                    log.error(err);
                });
        }
        
        async fetchProjectFromUrl (projectUrl, loadingState) {
            try {
                // Download SB3 file from URL
                const response = await fetch(projectUrl);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                // Get as ArrayBuffer
                const arrayBuffer = await response.arrayBuffer();
                
                // Load project using vm.loadProject
                if (this.props.vm) {
                    await this.props.vm.loadProject(arrayBuffer);
                    
                    // Set project title (inferred from URL)
                    const filename = this.getFilenameFromUrl(projectUrl);
                    if (filename && this.props.onSetProjectTitle) {
                        const projectTitle = this.getProjectTitleFromFilename(filename);
                        this.props.onSetProjectTitle(projectTitle);
                    }
                    
                    // Notify load completion
                    this.props.onFetchedProjectData(null, loadingState);
                } else {
                    throw new Error('VM instance not available');
                }
                
            } catch (error) {
                this.props.onError(error);
                log.error(error);
            }
        }
        
        getFilenameFromUrl (url) {
            try {
                // Extract filename from URL path
                const urlObj = new URL(url);
                const path = urlObj.pathname;
                const filename = path.substring(path.lastIndexOf('/') + 1);
                // If no filename in path, try to extract from search params (e.g., Google Drive)
                if (!filename || filename === '') {
                    const params = new URLSearchParams(urlObj.search);
                    // Google Drive specific: try to extract from id parameter
                    const id = params.get('id');
                    if (id) {
                        return `project_${id}.sb3`;
                    }
                    return 'project.sb3';
                }
                return filename;
            } catch (e) {
                return 'project.sb3';
            }
        }
        
        getProjectTitleFromFilename (fileInputFilename) {
            if (!fileInputFilename) return '';
            // Only parse title with valid scratch project extensions (.sb, .sb2, and .sb3)
            const matches = fileInputFilename.match(/^(.*)\\.sb[23]?$/);
            if (!matches) return '';
            return matches[1].substring(0, 100); // truncate project title to max 100 chars
        }
        
        render () {
            const {
                /* eslint-disable no-unused-vars */
                assetHost,
                intl,
                isLoadingProject: isLoadingProjectProp,
                loadingState,
                onActivateTab,
                onError: onErrorProp,
                onFetchedProjectData: onFetchedProjectDataProp,
                onProjectUnchanged,
                projectHost,
                projectId,
                reduxProjectId,
                setProjectId: setProjectIdProp,
                /* eslint-enable no-unused-vars */
                isFetchingWithId: isFetchingWithIdProp,
                ...componentProps
            } = this.props;
            return (
                <WrappedComponent
                    fetchingProject={isFetchingWithIdProp}
                    {...componentProps}
                />
            );
        }
    }
    ProjectFetcherComponent.propTypes = {
        assetHost: PropTypes.string,
        canSave: PropTypes.bool,
        intl: intlShape.isRequired,
        isCreatingNew: PropTypes.bool,
        isFetchingWithId: PropTypes.bool,
        isLoadingProject: PropTypes.bool,
        isShowingProject: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        onActivateTab: PropTypes.func,
        onError: PropTypes.func,
        onFetchedProjectData: PropTypes.func,
        onProjectUnchanged: PropTypes.func,
        onSetProjectTitle: PropTypes.func,
        projectHost: PropTypes.string,
        projectToken: PropTypes.string,
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        setProjectId: PropTypes.func,
        vm: PropTypes.shape({
            loadProject: PropTypes.func
        })
    };
    ProjectFetcherComponent.defaultProps = {
        assetHost: 'https://assets.scratch.mit.edu',
        projectHost: 'https://projects.scratch.mit.edu'
    };

    const mapStateToProps = state => ({
        isCreatingNew: getIsCreatingNew(state.scratchGui.projectState.loadingState),
        isFetchingWithId: getIsFetchingWithId(state.scratchGui.projectState.loadingState),
        isLoadingProject: getIsLoading(state.scratchGui.projectState.loadingState),
        isShowingProject: getIsShowingProject(state.scratchGui.projectState.loadingState),
        loadingState: state.scratchGui.projectState.loadingState,
        reduxProjectId: state.scratchGui.projectState.projectId
    });
    const mapDispatchToProps = dispatch => ({
        onActivateTab: tab => dispatch(activateTab(tab)),
        onError: error => dispatch(projectError(error)),
        onFetchedProjectData: (projectData, loadingState) =>
            dispatch(onFetchedProjectData(projectData, loadingState)),
        setProjectId: projectId => dispatch(setProjectId(projectId)),
        onProjectUnchanged: () => dispatch(setProjectUnchanged())
    });
    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );
    return injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(ProjectFetcherComponent));
};

export {
    ProjectFetcherHOC as default
};
