/**
 * @typeof DEFAULT_ACTIONS
 * @description Объект, эмулирующий объект библиотеки-логера
 * @property {Function} info  функция вывода уровня info
 * @property {Function} error функция вывода уровня error
 * @private
 **/
export const DEFAULT_ACTIONS = {
    /**
     * @method
     * @name info
     * @description Метод, который реализует вывод уровня info
     * @param {any} data информация, которую нужно вывести логером
     * @returns {void}
     * @memberof DEFAULT_ACTIONS
     * @public
     */
    info(data) {
        console.log(`[${new Date().getTime()}]: ${data}`);
    },
    /**
     * @method
     * @name error
     * @description Метод, который реалзует вывод уровня error
     * @param {any} error информация, которую нужно вывести логером
     * @returns {void}
     * @memberof DEFAULT_ACTIONS
     * @public
     */
    error(error) {
        console.log(`[${new Date().getTime()}] Error! Data: ${error}`);
    } 
};