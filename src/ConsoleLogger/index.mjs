import { Plugin } from 'raccoon-sanctuary';
import { DEFAULT_ACTIONS } from './defaults.mjs';

/**
 * @class
 * @name ConsoleLoger
 * @description Плагин, который использует в качестве логирования
 *              console.ConsoleLogerg из стандартной библиотеки JavaScript/Nodejs
 * @extends Plugin
 * @public
 */
export default class ConsoleLoger extends Plugin {
    constructor(options) {
        const name = 'ConsoleLoger';
        const actions = options?.actions
            ? { ...options.actions, ...DEFAULT_ACTIONS }
            : DEFAULT_ACTIONS;
        super({ name, actions });
    }
}