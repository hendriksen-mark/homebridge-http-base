'use strict';

import chalk from 'chalk';
import util from 'util';

// Ensure 'console' is defined (for environments where it might be missing)
if (typeof console === 'undefined') {
    globalThis.console = {
        log: function() {},
        error: function() {},
        warn: function() {},
        info: function() {}
    };
}

export { Logger, setDebugEnabled, setTimestampEnabled, forceColor };
export const _system = new Logger(); // system logger, for internal use only

let DEBUG_ENABLED = false;
let TIMESTAMP_ENABLED = true;

// Turns on debug level logging
function setDebugEnabled(enabled) {
    DEBUG_ENABLED = enabled;
}

// Turns off timestamps in log messages
function setTimestampEnabled(timestamp) {
    TIMESTAMP_ENABLED = timestamp;
}

// Force color in log messages, even when output is redirected
function forceColor() {
    chalk.enabled = true;
    chalk.level = 1;
}

// global cache of logger instances by plugin name
const loggerCache = {};

/**
 * Logger class
 */

function Logger(prefix) {
    this.prefix = prefix;
}

Logger.prototype.debug = function() {
    if (DEBUG_ENABLED)
        this.log.apply(this, ['debug'].concat(Array.prototype.slice.call(arguments)));
};

Logger.prototype.info = function() {
    this.log.apply(this, ['info'].concat(Array.prototype.slice.call(arguments)));
};

Logger.prototype.warn = function() {
    this.log.apply(this, ['warn'].concat(Array.prototype.slice.call(arguments)));
};

Logger.prototype.error = function() {
    this.log.apply(this, ['error'].concat(Array.prototype.slice.call(arguments)));
};

Logger.prototype.log = function(level, msg) {

    msg = util.format.apply(util, Array.prototype.slice.call(arguments, 1));
    let func = globalThis.console.log;

    if (level === 'debug') {
        msg = chalk.gray(msg);
    }
    else if (level === 'warn') {
        msg = chalk.yellow(msg);
        func = globalThis.console.error;
    }
    else if (level === 'error') {
        msg = chalk.bold.red(msg);
        func = globalThis.console.error;
    }

    // prepend prefix if applicable
    if (this.prefix)
        msg = chalk.cyan("[" + this.prefix +  "]") + " " + msg;

    // prepend timestamp
    if (TIMESTAMP_ENABLED) {
        const date = new Date();
        msg =  chalk.white("[" + date.toLocaleString() + "]") + " " + msg;
    }

    func(msg);
};

Logger.withPrefix = function(prefix) {

    if (!loggerCache[prefix]) {
        // create a class-like logger thing that acts as a function as well
        // as an instance of Logger.
        const logger = new Logger(prefix);
        const log = logger.info.bind(logger);
        log.debug = logger.debug;
        log.info = logger.info;
        log.warn = logger.warn;
        log.error = logger.error;
        log.log = logger.log;
        log.prefix = logger.prefix;
        loggerCache[prefix] = log;
    }

    return loggerCache[prefix];
};
