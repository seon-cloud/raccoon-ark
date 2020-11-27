
/**
 * @function
 * @name info
 * @description Метод, который реализует вывод уровня info
 * @param {any} data информация, которую нужно вывести логером
 * @returns {void}
 * @memberof DEFAULT_ACTIONS
 * @public
 */
export const info = function(data) {
    try {
        const { pino } = this.packages;
        pino().info(data);
    } catch (error) {
        throw error;
    }
};

/**
 * @method
 * @name debug
 * @description Метод, который реализует вывод уровня debug
 * @param {any} data информация, которую нужно вывести логером
 * @returns {void}
 * @memberof DEFAULT_ACTIONS
 * @public
 */
export const debug = function(data) {
    try {
        const { pino } = this.packages;
        pino().debug(data);
    } catch (error) {
        throw error;
    }
};

/**
 * @method
 * @name error
 * @description Метод, который реализует вывод уровня error
 * @param {any} data информация, которую нужно вывести логером
 * @returns {void}
 * @memberof DEFAULT_ACTIONS
 * @public
 */
export const error = function(data) {
    try {
        const { pino } = this.packages;
        pino().error(data);
    } catch (error) {
        throw error;
    }
};

/**
 * @method
 * @name trace
 * @description Метод, который реализует вывод уровня trace
 * @param {any} data информация, которую нужно вывести логером
 * @returns {void}
 * @memberof DEFAULT_ACTIONS
 * @public
 */
export const trace = function(data) {
    try {
        const { pino } = this.packages;
        pino().trace(data);
    } catch (error) {
        throw error;
    }
};

/**
 * @method
 * @name warning
 * @description Метод, который реализует вывод уровня warning
 * @param {any} data информация, которую нужно вывести логером
 * @returns {void}
 * @memberof DEFAULT_ACTIONS
 * @public
 */
export const warning = function(data) {
    try {
        const { pino } = this.packages;
        pino().warn(data);
    } catch (error) {
        throw error;
    }
};

/** Объект API логера по умолчанию
 * info - функция вывода уровня info
 * debug - функция вывода уровня debug
 * trace - функция вывода уровня trace
 * warning - функция вывода уровня warn
 * error - функция вывода уровня error
 * */
export const DEFAULT_ACTIONS = { info, debug, trace, warning, error };

