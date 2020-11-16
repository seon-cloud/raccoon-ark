/**
 * @function
 * @name compileFile
 * @description Функция, которая компилирует через пакет Pug шаблон
 * @param {string} filepath полный путь к файлу
 * @returns {Function} функция, в которую откомпилировался шаблона
 * @public 
 */
const compileFile = function(filepath) {
    try {
        const { pug } = this.packages;
        return pug.compileFile(filepath);
    } catch (error) {
        throw error;
    }
};

/**
 * @function
 * @name compiledFunction
 * @description Функця, которая возвращает результат примененя откомпилированного
 *              шаболна к данным
 * @param {sting} templateName имя шаблона
 * @param {object} data данные для отображения
 * @returns {string} результат примененя функции шаблона
 * @public 
 */
const compiledFunction = function(templateName, data) {
    try {
        return (this.compiled.hasOwnProperty(templateName) === true)
            ? this.compiled[templateName](data)
            : undefined;
    } catch (error) {
        throw error;
    }
};

/**
 * @function
 * @name renderFile
 * @description Функця, которая сразу выдаёт рендер 
 * @param {string} filepath путь до файла
 * @param {object} data данные для отображения
 * @returns {string} результат примененя функции рендера файла
 * @public
 */
const renderFile = function(filepath, data) {
    try {
        const { pug } = this.packages;
        return pug.renderFile(filepath, data);
    } catch (error) {
        throw error;
    }
};

/** Объект с API файла по умолчанию.
 * compileFile - функция для компиляции шаблона
 * compiledFunction - функция для выполнения шаблона (рендера)
 * renderFile - функця для рендера в один этап */
export const DEFAULT_ACTIONS = { compileFile, compiledFunction, renderFile };

/** Значение по умолчанию для свойства, содержащего шаблоны*/
export const DEFAULT_TEMPLATES_VALUE = {};