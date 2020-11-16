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

const { getExtandedActions, getExtendedPackages } = Utils;

/**
 * @function
 * @name prepareSuperOptions
 * @description Функця, которая собирает объект опций для инициализации 
 *              родительского класса плагина Archibald
 * @param {object} options объект опций экземпляра
 * @returns {object} объект опций для инициализации родителя
 * @public 
 */
export const prepareSuperOptions = (options) => {
    const name = options?.name ? options.name : NAME;
    const defaultPackages = { pug };
    const packages = getExtendedPackages(options, defaultPackages);
    const actions = getExtandedActions(options, DEFAULT_ACTIONS);
    return { name, packages, actions };
};
