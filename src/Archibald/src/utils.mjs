/** Импортируем пакет шаблонизатора Pug */
import pug from 'pug';

/** Импортируем константы плагина.
 * NAME - имя плагиан по умполчанию */
import { NAME } from './constants.mjs';

/** Импротируем значения сложных данных по умполчанию
 * DEFAULT_ACTIONS - действия, которые доступны в плагине по усполчанию */
import { DEFAULT_ACTIONS } from './defaults.mjs';

/** Импртируем вспомогательные фукцнии из набора утилит.
 * getExtandedActions - получить расширенный набор действий плагина
 * getExtendedPackages - получить раширенный набор пакетов плагинов */
import { Utils } from 'raccoon-sanctuary';

/** Получаем впомогатеьные функции
 * - getExtandedActions: функция получения расширенного объекта действий 
 * - getExtendedPackages: функция получения расширенного обеъкта пакетов
 */
const { 
    getExtandedActions, 
    getExtendedPackages 
} = Utils;

/**
 * Возвращаемый функцией prepareSuperOptions объект
 * 
 * @typedef {Object} ArchibaldOptions
 * @property {string} name      имя плагина
 * @property {object} packages  объект пакетов плагина
 * @property {object} actions   объект действий плагина
 */

/**
 * Функця, которая собирает объект опций для инициализации родительского
 * класса плагина Archibald
 * 
 * @param {object} options объект опций экземпляра
 * @returns {ArchibaldOptions} объект опций для инициализации родителя
 * @exports
 */
export const prepareSuperOptions = options => {
    /** Получаем имя для плагина */
    const name = options?.name ? options.name : NAME;
    /** Получаем объект пакетов по умолчанию */
    const defaultPackages = { pug };
    /** Получаем расширенный объект пакетов */
    const packages = getExtendedPackages(options, defaultPackages);
    /** Получаем расширенный объект действий */
    const actions = getExtandedActions(options, DEFAULT_ACTIONS);
    /** */
    return { name, packages, actions };
};
