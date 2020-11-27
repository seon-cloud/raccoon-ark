import pino from 'pino';

/** Импортируем константы плагина.
 * NAME - имя плагина по умполчанию */
import { NAME } from './constants.mjs';

/** Импротируем значения сложных данных по умполчанию
 * DEFAULT_ACTIONS - действия, которые доступны в плагине по умолчанию */
import { DEFAULT_ACTIONS } from './defaults.mjs';

/** Импртируем вспомогательные фукцнии из набора утилит.
 * getExtandedActions - получить расширенный набор действий плагина
 * getExtendedPackages - получить раширенный набор пакетов плагинов */
import { Utils } from 'raccoon-sanctuary';

const { getExtandedActions, getExtendedPackages } = Utils;

/**
 * @function
 * @name prepareSuperOptions
 * @description Функция, которая собирает объект опций для инициализации 
 *              родительского класса плагина Pinocolada
 * @param {object} options объект опций экземпляра
 * @returns {object} объект опций для инициализации родителя
 * @public 
 */
export const prepareSuperOptions = (options) => {
    const name = options?.name ? options.name : NAME;
    const defaultPackages = { pino };
    const packages = getExtendedPackages(options, defaultPackages);
    const actions = getExtandedActions(options, DEFAULT_ACTIONS);
    return { name, packages, actions };
}