/**
 * Suppress certain console warnings that are known upstream issues or intentional.
 */

const ignoredWarnings = [
    'Object freezing is not supported by Opal',
    'Canvas2D: Multiple readback operations using getImageData are faster ' +
        'with the willReadFrequently attribute set to true',
    'Support for defaultProps will be removed from function components',
    'React does not recognize the colorMode prop on a DOM element',
    'React does not recognize the showNewFeatureCallouts prop on a DOM element',
    'React does not recognize the localesOnly prop on a DOM element',
    'React does not recognize the setTheme prop on a DOM element',
    'React does not recognize the',
    'The prop `projectId` is marked as required in `StageHeaderComponent`, but its value is `null`',
    'Invalid prop `projectId` of type `string` supplied to `StageHeaderComponent`, expected `number`',
    'The prop projectId is marked as required in StageHeaderComponent, but its value is null',
    'Invalid prop projectId of type string supplied to StageHeaderComponent, expected number',
    'componentWillMount has been renamed',
    'componentWillReceiveProps has been renamed',
    'findDOMNode is deprecated',
    'The AudioContext was not allowed to start',
    'apple-mobile-web-app-capable',
    'GenerateSW has been called multiple times'
];

/**
 * Check if a message should be ignored.
 * @param {string} message The message to check.
 * @param {Array} args Additional arguments.
 * @returns {boolean} True if the message should be ignored.
 */
const shouldIgnore = (message, ...args) => {
    const allStrings = [message, ...args].filter(arg => typeof arg === 'string');
    return allStrings.some(str =>
        ignoredWarnings.some(ignored => str.includes(ignored))
    );
};

/* eslint-disable no-console */
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function (message, ...args) {
    if (shouldIgnore(message, ...args)) return;
    originalWarn.apply(console, [message, ...args]);
};

console.error = function (message, ...args) {
    if (shouldIgnore(message, ...args)) return;
    originalError.apply(console, [message, ...args]);
};
/* eslint-enable no-console */
