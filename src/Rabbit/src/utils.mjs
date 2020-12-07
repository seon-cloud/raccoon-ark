import { Utils } from 'raccoon-sanctuary';

import {
    NAME
} from './constants.mjs';

import {
    DEFAULT_ACTIONS,
    DEFAULT_PACKAGES
} from './defaults.mjs'

/** Получаем впомогатеьные функции
 * - getExtandedActions: функция получения расширенного объекта действий 
 * - getExtendedPackages: функция получения расширенного обеъкта пакетов
 */
const { 
    getExtandedActions, 
    getExtendedPackages 
} = Utils;

export const prepareSuperOptions = options => {
    const name = options?.name ? options.name : NAME;
    const packages = getExtendedPackages(options, DEFAULT_PACKAGES);
    /** Получаем расширенный объект действий */
    const actions = getExtandedActions(options, DEFAULT_ACTIONS);
    return { name, packages, actions };
};