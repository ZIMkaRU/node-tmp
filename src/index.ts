import AsyncInterfaceImpl from './internal/AsyncInterfaceImpl';
import PromiseInterfaceImpl from './internal/PromiseInterfaceImpl';
import SyncInterfaceImpl from './internal/SyncInterfaceImpl';

import GarbageCollector from './internal/GarbageCollector';
import PathUtils from './internal/PathUtils';

/**
 * The interface Options represents an object that is used for passing in options to either of the available methods
 * of the public API.
 *
 * Please consult the tutorial on {@tutorial 15-configuration} for more information on how this can be applied.
 *
 * @see {@link sync}
 * @see {@link async}
 * @see {@link promise}
 * @see {@link file}
 * @see {@link fileSync}
 * @see {@link dir}
 * @see {@link dirSync}
 * @see {@link tmpName}
 * @see {@link tmpNameSync}
 *
 * @category Common
 */
export interface Options {
    /**
     * Instructs the name generator to append this to the root tmp dir.
     *
     * ### Note
     * - This must resolve to a path that is relative to the root tmp dir, otherwise an error will be reported
     * - The resolved path must exist, otherwise an error will be reported
     * - All leading and trailing whitespace will be removed
     * - Whitespace only strings will be treated as if the option was not set
     * - Any whitespace only path components will be eliminated
     * - Always use `path.join()` when building paths, otherwise the behaviour might be inconsistent
     *
     * @example
     * ```
     * console.log(tmp.sync.name({dir: 'custom-dir'})); // <tmpdir>/custom-dir/tmp-234-a75xkVzj43Ac
     * console.log(tmp.sync.name({dir: '   /hidden-no'})); // <tmpdir>/hidden-no/tmp-234-a75xkVzj43Ac
     * console.log(tmp.sync.name({dir: 'custom-dir/.hidden  yes'})); // <tmpdir>/custom-dir/.hidden  yes/tmp-234-a75xkVzj43Ac
     * ```
     */
    dir?: string;
    /**
     * Instructs the garbage collector to forcefully clean a non empty directory.
     *
     * This is overridden by the [keep](#keep) option.
     *
     * Keep in mind that the disposal of a directory may still fail, especially if the temporary directory or any
     * child resources were locked by the same or a different process or thread, also depending on the operating
     * system being used.
     *
     * @default false
     *
     * @see [keep](#keep)
     */
    forceClean?: boolean;
    /**
     * Instructs the garbage collector to keep the temporary file or directory.
     *
     * This overrides the [forceClean](#forceClean) option.
     *
     * If the temporary file or directory is a child of another temporary directory that was configured to be
     * [forceClean](#forceClean)ed or if either {@link AsyncInterface#forceClean}, {@link SyncInterface#forceClean},
     * or {@link PromiseInterface#forceClean} has been called, that file or directory will still be disposed off on
     * {@link $tmp_exit_listener|process exit}. Similarly, all objects configured for keeping will be disposed of,
     * whenever their associated dispose method is called, see {@link AsyncResult#dispose}, {@link SyncResult#dispose}
     * or {@link AsyncResult#dispose}.
     *
     * Also note that if the process' configured temporary directory is under control of either the operating
     * system or similar processes, then these so kept directories and files might be disposed off on next
     * system reboot or process restart.
     *
     * If the temporary data is valuable to you, move it out of the way and into a different location of the filesystem,
     * that is being controlled by your application.
     *
     * @default false
     *
     * @see [forceClean](#forceClean)
     */
    keep?: boolean;
    /**
     * Instructs the random name generator to generate the specified length of random names.
     * The provided value will be clamped to `[6, 24]`.
     *
     * @default 12
     */
    length?: number;
    /**
     * Instructs the temporary object creator to create files and directories with the specified access mode.
     *
     * The default mode for files is `0o700` and the default mode for directories is `0o600`.
     */
    mode?: number;
    /**
     * Instructs the name generator to always generate the same fixed name, with no process pid, prefix or postfix
     * applied.
     *
     * ### Note
     * - This must not include any path separators, otherwise an error will be reported
     * - All leading and trailing whitespace will be removed
     * - Whitespace only strings will be treated as if the option was not set
     *
     * @example
     * console.log(tmp.sync.name({name: 'fixed-name'})); // <tmpdir>[/<dir>]/fixed-name
     */
    name?: string;
    /**
     * Instructs the name generator to postfix the generated name by this.
     *
     * ### Note
     * - This must not include any path separators, otherwise an error will be reported
     * - All leading and trailing whitespace will be removed
     * - Whitespace only strings will be treated as if the option was not set
     *
     * @example
     * console.log(tmp.sync.name({postfix: 'postfix'})); // <tmpdir>[/<dir>]/tmp-234-a75xkVzj43Ac-postfix
     *
     * @see [prefix](#prefix)
     */
    postfix?: string;
    /**
     * Instructs the name generator to prefix the generated name by this.
     *
     * ### Note
     * - This must not include any path separators, otherwise an error will be reported
     * - All whitespace will be preserved, except for a whitespace only string, in which case the option will be ignored
     *
     * @example
     * console.log(tmp.sync.name({prefix: 'prefix'})); // <tmpdir>[/<dir>]/prefix-234-a75xkVzj43Ac
     * console.log(tmp.sync.name()); // <tmpdir>[/<dir>]/tmp-234-a94864eaVqFy
     *
     * @default 'tmp'
     *
     * @see [postfix](#postfix)
     */
    prefix?: string;
    /**
     * Instructs the name generator to generate a six characters wide random name which will not be prefixed and which
     * will also not include the process pid.
     *
     * ### Note
     * - This must include the template string `XXXXXX` (six times X) somewhere in the string, otherwise an error will
     *   be reported
     * - This must not include any path separators, otherwise an error will be reported
     * - All leading and trailing whitespace will be removed
     * - Whitespace only strings will be treated as if the option was not set
     *
     * @example
     * console.log(tmp.sync.name({template: 'temp-XXXXXX'})); // <tmpdir>[/<dir>]/temp-a75xkV
     *
     * @deprecated this will be removed in v1.0.0, use the options prefix, postfix and length instead.
     *
     * @see [length](#length)
     * @see [prefix](#prefix)
     * @see [postfix](#postfix)
     */
    template?: string;
    /**
     * Instructs the system to override the standard tmpdir returned by os.tmpdir().
     *
     * @example
     * console.log(tmp.sync.name({tmpdir: '/other-tmp'})); // /other-tmp[/<dir>]/tmp-234-a75xkVzj43Ac
     */
    tmpdir?: string;
    /**
     * Instructs the name generator to try at most the configured number of times to generate a unique name, before that
     * it will fail with an `Error`. The provided value will be clamped to `[1, 10]`.
     *
     * This will be ignored when using a fixed [name](#name).
     *
     * @default 3
     */
    tries?: number;
    /**
     * Alias for [forceClean](#forceClean).
     *
     * @deprecated this will be be removed in v1.0.0, use the forceClean option instead.
     *
     * @see [forceClean](#forceClean)
     */
    unsafeCleanup?: boolean;
}

/**
 * @callback {Function} tmp/AsyncNamingCallback
 */
export type AsyncNamingCallback = (err: Error|null, name?: string) => void;

/**
 * @callback {Function}
 */
export type AsyncCreationCallback = (err: Error|null, result?: AsyncResult) => void;

/**
 * @callback {Function}
 *
 * @deprecated this will be removed in v1.0.0
 */
export type DirOrFileCallback = (err: Error|null, name: string, dispose: DisposeCallback) => void;

/**
 * @callback {Function}
 *
 * @deprecated this will be removed in v1.0.0
 */
export type DisposeCallback = (next?: ChainedCallback) => void;

/**
 * @callback {Function}
 */
export type ChainedCallback = (err?: Error) => void;

/**
 * AsyncResult
 *
 * @category Interfaces / Async
 */
export interface AsyncResult {
    /**
     * @readonly
     */
    readonly name: string;
    /**
     * @method
     * @param {ChainedCallback?} next
     */
    dispose(next?: ChainedCallback): void;
}

/**
 * SyncResult
 *
 * @category Interfaces / Sync
 */
export interface SyncResult {
    /**
     *
     */
    readonly name: string;
    /**
     * @method
     */
    dispose(): void;
    /**
     * @deprecated this will be removed in v1.0.0, use dispose() instead.
     */
    removeCallback(): void;
}

/**
 * PromiseResult
 *
 * @category Interfaces / Promise
 */
export interface PromiseResult {
    /**
     * @property {string}
     * @readonly
     */
    readonly name: string;
    /**
     *
     */
    dispose(): Promise<void>;
}

/**
 * The promise based version of the API.
 *
 * @category Interfaces / Promise
 */
export interface PromiseInterface {
    /**
     * @property {string}
     * @readonly
     */
    readonly tmpdir: string;
    /**
     * @method
     */
    forceClean(): void;
    /**
     * @method
     * @param {Options?} [options={}] the options
     */
    name(options?: Options): Promise<string>;
    /**
     * @method
     * @param {Options?} [options={}] the options
     */
    file(options?: Options): Promise<PromiseResult>;
    /**
     * @method
     * @param {Options?} [options={}] the options
     */
    dir(options?: Options): Promise<PromiseResult>;
}

/**
 * The asynchronous version of the API.
 *
 * @category Interfaces / Async
 */
export interface AsyncInterface {
    /**
     * @property {string}
     * @readonly
     */
    readonly tmpdir: string;
    /**
     * @method
     */
    forceClean(): void;
    /**
     * @method
     * @param {AsyncNamingCallback} callback
     * @param {Options?} [options={}] the options
     */
    name(callback: AsyncNamingCallback, options?: Options): void;
    /**
     * @method
     * @param {AsyncCreationCallback} callback
     * @param {Options?} [options={}] the options
     */
    file(callback: AsyncCreationCallback, options?: Options): void;
    /**
     * Creates a temporary directory.
     *
     * @method
     * @param {AsyncCreationCallback} callback
     * @param {Options?} [options={}] the options
     */
    dir(callback: AsyncCreationCallback, options?: Options): void;
}

/**
 * The synchronous version of the API.
 *
 * @public
 * @interface
 * 
 * @category Interfaces / Sync
 */
export interface SyncInterface {
    /**
     * @property {string}
     * @readonly
     */
    readonly tmpdir: string;
    /**
     * @method
     */
    forceClean(): void;
    /**
     * Creates a temporary directory.
     *
     * @method
     * @param {Options?} [options={}] the options
     */
    name(options?: Options): string;
    /**
     * Creates a temporary directory.
     *
     * @method
     * @param {Options?} [options={}] the options
     */
    file(options?: Options): SyncResult;
    /**
     * Creates a temporary directory.
     *
     * @method
     * @param {Options?} [options={}] the options
     */
    dir(options?: Options): SyncResult;
}

/**
 * This is the singleton instance of the {@link SyncInterface}.
 *
 * @public
 *
 * @example
 * import {sync as tmp} from 'tmp';
 *
 * @example
 * const tmp = require('tmp').sync;
 *
 * @category Interfaces / Sync
 */
export const sync = new SyncInterfaceImpl();
/**
 * This is the singleton instance of the {@link AsyncInterface}.
 *
 * @example
 * import {async as tmp} from 'tmp';
 *
 * @example
 * const tmp = require('tmp').async;
 *
 * @category Interfaces / Async
 */
export const async = new AsyncInterfaceImpl();
/**
 * This is the singleton instance of the {@link PromiseInterface}.
 *
 * @example
 * import {promise as tmp} from 'tmp';
 *
 * @example
 * const tmp = require('tmp').promise;
 *
 * @category Interfaces / Promise
 */
export const promise = new PromiseInterfaceImpl();

/**
 * @function
 *
 * @deprecated this will be removed in v1.0.0, use (sync|async|promise).forceClean() instead.
 *
 * @category Tmp Legacy Interface
 */
export function setGracefulCleanup() {
    GarbageCollector.INSTANCE.forceClean = true;
}

/**
 * @member {string}
 *
 * @deprecated this will be removed in v1.0.0, use (sync|async|promise).tmpdir instead.
 *
 * @category Tmp Legacy Interface
 */
export const tmpdir: string = PathUtils.normalizedOsTmpDir;

/**
 * @function
 * @param {Options} options
 * @returns {string}
 *
 * @deprecated this will be removed in v1.0.0, use sync.name() instead
 *
 * @category Tmp Legacy Interface
 */
export function tmpNameSync(options: Options = {}): string {
    return sync.name(options);
}

/**
 * @function
 * @param {Options} options
 * @returns {SyncResult}
 *
 * @deprecated this will be removed in v1.0.0, use #sync.file() instead
 *
 * @category Tmp Legacy Interface
 */
export function fileSync(options: Options = {}): SyncResult {
    return sync.file(options);
}

/**
 * @function
 * @param {Options} options
 * @returns {SyncResult}
 *
 * @deprecated this will be removed in v1.0.0, use sync.dir() instead
 *
 * @category Tmp Legacy Interface
 */
export function dirSync(options: Options = {}): SyncResult {
    return sync.dir(options);
}

/**
 * @function
 * @param {Options | AsyncNamingCallback} callbackOrOptions
 * @param {AsyncNamingCallback?} callback
 *
 * @deprecated this will be removed in v1.0.0, use async.name() instead
 *
 * @category Tmp Legacy Interface
 */
export function tmpName(callbackOrOptions: Options | AsyncNamingCallback, callback?: AsyncNamingCallback): void {
    const [opts, cb] = _parseArguments(callbackOrOptions, callback);
    return async.name(cb, opts);
}

/**
 * @function
 * @param {Options | DirOrFileCallback} callbackOrOptions
 * @param {DirOrFileCallback?} callback
 *
 * @deprecated this will be removed in v1.0.0, use async.file() instead
 *
 * @category Tmp Legacy Interface
 */
export function file(callbackOrOptions: Options | DirOrFileCallback, callback?: DirOrFileCallback): void {
    const [opts, cb] = _parseArguments(callbackOrOptions, callback);
    return async.file((err, result) => {
        if (err) {
            return cb(err);
        } else {
            return cb(null, result.name, result.dispose);
        }
    }, opts);
}

/**
 * @function
 * @param {Options | DirOrFileCallback} callbackOrOptions
 * @param {DirOrFileCallback?} callback
 *
 * @deprecated this will be removed in v1.0.0, use async.dir() instead
 *
 * @category Tmp Legacy Interface
 */
export function dir(callbackOrOptions: Options | DirOrFileCallback, callback?: DirOrFileCallback): void {
    const [opts, cb] = _parseArguments(callbackOrOptions, callback);
    return async.dir((err, result) => {
        if (err) {
            return cb(err);
        } else {
            return cb(null, result.name, result.dispose);
        }
    }, opts);
}

/**
 * Parses the arguments.
 *
 * @private
 * @function
 * @param {(Options|null|undefined|Function)} callbackOrOptions
 * @param {?Function} callback
 * @returns {Array} parsed arguments
 *
 * @deprecated this will be removed in v1.0.0
 */
function _parseArguments(callbackOrOptions, callback) {
    if (typeof callbackOrOptions === 'function') {
        return [callback, callbackOrOptions];
    } else {
        return [callbackOrOptions, callback];
    }
}

/**
 * Process exit listener.
 *
 * This gets installed by default in order to make sure that all remaining garbage will be removed on process exit.
 *
 * Note that if a process keeps an active lock on any of the temporary objects created by tmp, then these objects
 * will remain in place and cannot be removed.
 *
 * Note also, that for all file and directory objects that have been configured for {@link Options#keep}ing but which
 * are children of a temporary directory that can be removed by tmp, especially when the {@link Options#forceClean}
 * option has been set, then these objects will be removed as well.
 *
 * In order to clean up on SIGINT, e.g. CTRL-C, you will have to install a handler yourself, see the below example.
 *
 * @example
 * process.on('SIGINT', process.exit);
 *
 * @function exit_listener
 * @protected
 *
 * @category Installed Listeners
 */
process.on('exit', function () {
    GarbageCollector.INSTANCE.dispose();
});