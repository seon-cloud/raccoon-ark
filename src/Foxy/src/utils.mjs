/** Импотируем имя плагина (NAME) из констант */
import { NAME } from './constants.mjs';
/** Импортируем вспомогательные функции из констант */
import { Utils } from 'raccoon-sanctuary';

/**
 * Импортируем из значений по умолчанию
 * - DEFAULT_ACTIONS: объект actions с функциями по умолчанию
 * - DEFAULT_PACKAGES: объект packages с пакетами по умолчанию
 */
import {
    DEFAULT_ACTIONS,
    DEFAULT_PACKAGES
 } from './defaults.mjs';

 /**
  * Объект опций для инициализации родителя плагина Foxy
  * 
  * @typedef {Object} FoxyParentOptions
  * @property {object} actions
  * @property {object} packages
  * @property {string} name 
  */

/**
 * Функция подготаливает объек опций для инициализации родителя (super)
 * 
 * @function prepareSuperOptions
 * @param {FoxyParentOptions} options объект опций
 * @returns
 */
export const prepareSuperOptions = options => {
    const actions = Utils.getExtandedActions(options, DEFAULT_ACTIONS);
    const packages = Utils.getExtendedPackages(options, DEFAULT_PACKAGES);
    const name = options?.name ? options.name : NAME; 
    return { name, actions, packages };
}