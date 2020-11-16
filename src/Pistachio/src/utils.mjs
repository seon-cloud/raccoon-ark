
import {
    Utils
} from 'raccoon-sanctuary';
const {
    getExtandedActions,
    getExtendedPackages
} = Utils;

import {
    APPLICATiON_NAME,
    MIN_INDEX,
    INDEX_STEP,
    POSITIVE_RESULT,
    URL_PARAM_SEPARATOR,
    URL_TOKEN_SEPARATOR,
    NEGATIVE_RESULT,
    FIRST_REAL_INDEX,
    MINIMAL_URL_LENGTH,
    NOT_IN_STRING,
    QUERY_PARAM_SEPARATOR,
    QUERY_PARAM_PAIR_SEPARATOR,
    QUERY_PARAM_KEY_VALUE_SEPARATOR,
    DATA_EVENT,
    END_EVENT,
    ERROR_EVENT
} from './constants.mjs';

import {
    DEFAULT_ACTIONS
} from './defaults.mjs';

/**
 * @function
 * @name executeMiddleware
 * @description Функция исполненя middleware уровня приложения.
 *              Обеспечивает совместимость с middleware фреймворка
 *              Express.
 * @param {AsyncFunction} middleware middleware функция 
 * @param {object} req объект запроса
 * @param {object} res объект ответа
 * @returns {Promise} обещание выполнения
 * @private
 */
const executeMiddleware = (middleware, req, res) => {
  /** Возвращаем обещание выполнения middleware функции (асинхронная
   * функция).
   * Если middleware функция передана (существует), то возвращаем обещание
   * вызыванной функции.
   * Если middleware функция не передана, то возвращаем обещание с успешным
   * выполнением */
  if (!middleware) {
    return new Promise((resolve) => resolve(POSITIVE_RESULT));
  } else {
    return new Promise((resolve) => {
      middleware(req, res, function () {
        resolve(POSITIVE_RESULT);
      });
    });
  }
}

/**
 * @function
 * @name executeUses
 * @description Функция, которая последовательно выполняет асинхронные middleware
 *              функции (рекурсивная функция). Обеспечивает совместимость с системой
 *              middleware фреймворка Express.
 * @param {Array<AsyncFunction>} uses массив асинхронных функций
 * @param {object} req объект запроса
 * @param {object} res объект ответа
 * @param {number} index индекс текущего элемента в массиве
 * @returns {boolean} результат выполнения массива
 * @public
 */
export const executeUses = async (uses, req, res, index=MIN_INDEX) => {
    /** Проверяем значение текущего индекса.
     * Если значение текущего индекса меньше или равно максимальной
     * длине массива middleware функций, то выполняем middleware для текущего
     * индекса и вызываем функцию рекурсивно (увеличив индекс на значение заданного
     * шага).
     * Если индекс больше максимального индекса массива middleware функция, то
     * возвращаем успешный результат выполенниия */
    if (index < uses.length) {
        const middleware = uses[index];
        const result = await executeMiddleware(middleware, req, res);
        return await executeUses(uses, req, res, index + INDEX_STEP); 
    } else {
        return POSITIVE_RESULT;
    }
};

/**
 * @function
 * @name compareWithPattern
 * @description Функция, которая проверяет совпадения url и паттерна
 * @param {string} url относительная ссылка запроса
 * @param {string} pattern паттерн маршрута
 * @returns {object} результирующий результат (обработчик и параметры)
 * @private
 */
const compareWithPattern = (url, pattern) => {
    try {
        /** Инициализируем результат */
        let result;
        /** Инициализируем пустой объект параметров запроса */
        let params = {};

        /** Разделяем на токены URL и паттерн маршрута */
        const urlTokens = url.split(URL_TOKEN_SEPARATOR).slice(FIRST_REAL_INDEX);
        const patternTokens = pattern.split(URL_TOKEN_SEPARATOR).slice(FIRST_REAL_INDEX);

        /** Получаем длинну списков токенов для URL и паттерна */
        const urlTokensLength = urlTokens.length;
        const patternTokensLength = patternTokens.length;

        /** Проверяем. Если длина ссылки соответствует минимальной длине списка токено и 
         * длинна список токенов для URL и паттерна маршрута равны - проверяем паттерн и URL
         * на соответствие.
         * Если длина сссылки равна минимальной длине и/или длина списков токенов не совпадает -
         * возвращаем отрицательный результат */
        if (urlTokensLength !== MINIMAL_URL_LENGTH && urlTokensLength === patternTokensLength) {
            /** Задаём начальный текущий индекс */
            let currentIndex = 0;
            /** Задаём начальное значение результата проверки как положительное */
            result = POSITIVE_RESULT;

            /** Инициализируем переменные со значенем токена паттерна
             * и токена URL с пустым (undefined) значением */
            let patternToken;
            let urlToken;

            /** Перебираем в цикле значения токенов URL и паттерна маршрута.
             * Если хотя бы один токен не совпадает и при этом не является переменной составляющей
             * считаем, что паттерно маршрута не соответствует анализируемому URL запроса.
             * Если токен является переменной частью - делаем присвоение по имени в объект параметров
             * запроса URL */
            for (currentIndex; currentIndex < urlTokensLength; currentIndex++) {
                urlToken = urlTokens[currentIndex];
                patternToken = patternTokens[currentIndex];
                if (urlToken !== patternToken) {
                    if (patternToken.indexOf(URL_PARAM_SEPARATOR) !== NOT_IN_STRING) {
                        params[patternToken.slice(FIRST_REAL_INDEX)] = urlToken;
                    } else {
                        result = NEGATIVE_RESULT;
                        break;
                    }
                }
            }
        } else {
            result = NEGATIVE_RESULT;
        }

        return { result, params };
    } catch(error) {
        throw error;
    }
};

/**
 * @function
 * @name findRoute
 * @desctiption Функция поиска обработчика маршрута по URL
 * @param {string} url ссылка маршрута (относительная)
 * @param {object} routes объект маршрутов
 * @returns {object} объект, содержащий обработчик и параметры URL запроса
 * @public
 */
export const findRoute = (url, routes) => {
    /** Определяем переменную обоработчика */
    let handler = undefined;

    /** Задаём параметры запроса в URL */
    let params = {};

    /** Получаем список паттерной маршрутов */
    const patterns = Object.keys(routes);

    /** Проверяем паттерны на полное совпадение */
    patterns.forEach(pattern => {
        if (pattern === url) {
            handler = routes[pattern];
        }
    });
  
    /** Если паттернов с полным совпадением нет - проверяем каждый паттерн
    * по отдельности, через вызов функции compareWithPattern */
    if (!handler) {
        let compareResult;
        patterns.forEach(pattern => {
            compareResult = compareWithPattern(url, pattern);
            if (compareResult.result) {
                /** Обновляем значение обработчика и параметров маршрута */
                handler = routes[pattern];
                params = compareResult.params;
            }
        });
    }

    return { handler, params };
};

/**
 * @function
 * @name injectInRequest 
 * @description Функция, которая добавляет к обеъкту запроса свойство 
 *              по ключу с определённым значением
 * @param {object} req   объект запроса
 * @param {string} key   имя свойства
 * @param {any}    value значение свойства
 * @returns {void}
 * @public
 */
export const injectInRequest = (req, key, value) => {
    req[key] = value;
};

/**
 * @function
 * @name prepareParentOptions 
 * @description Функция, которая подготоавливает объект опций для родительского класса
 *              (класса Plugin из экосистемы Raccoon)
 * @param {object} options объект опций для текущего экземпляра
 * @returns {object} объект опций родителя
 * @public
 */
export const prepareParentOptions = (options) => {
    /** Задаём имя плагина */
    const name = APPLICATiON_NAME;
    
    /** Задаём действия для плагина */
    const actions = getExtandedActions(options, DEFAULT_ACTIONS);

    /** Получаем пакеты */
    const packages = getExtendedPackages(options);

    const application = options?.application
        ? options.application
        : undefined;

    return { name, packages, actions, application };
};

/**
 * @function
 * @name queryStringProcessor 
 * @description Функция, которая отделяет строку от query параметров, которые
 *              могут быть использованы для обогащения запроса
 * @param {object} req объект запроса
 * @returns {object} объект с очищенной ссылкой и объектом query параметров
 * @private
 */
const queryStringProcessor = (req) => {
    let query = {};
    let url;

    const rawUrl = req.url;
    
    
    if (rawUrl.indexOf(QUERY_PARAM_SEPARATOR) !== -1) {
        const pureUrlIndex = 0;
        const queryParamsIndex = 1;

        const urlAndQuery = rawUrl.split(QUERY_PARAM_SEPARATOR);

        url = urlAndQuery[pureUrlIndex];
        
        const queryParams = urlAndQuery[queryParamsIndex].split(QUERY_PARAM_PAIR_SEPARATOR);
        
        let paramAndValueArr;
        let key;
        let value;

        const keyIndex = 0;
        const valueIndex = 1;
        queryParams.forEach(paramAndValue => {
            paramAndValueArr = paramAndValue.split(QUERY_PARAM_KEY_VALUE_SEPARATOR);
            key = paramAndValueArr[keyIndex];
            value = paramAndValueArr[valueIndex];
            query[key] = value;
        });
    } else {
        url = rawUrl;
    }
    return { query, url };
};

/**
 * @function
 * @name readBody
 * @description Функция для чтения данных тела запроса из потока
 * @param {object} req объект запроса
 * @returns {Promise<string>} обещание чтения данных запроса
 * @private
 */
const readBody = (req) => {
    return new Promise((resolve, reject) => {
        /** Инициализируем пустую строку body */
        let body = '';

        /** Начинаем чтение по событию (объединяем строки) */
        req.on(DATA_EVENT, chunk => {
            body += "" + chunk;
        });

        /** При событии окончания передачи - делаем resolve строки */
        req.on(END_EVENT, () => {
            resolve(body);
        });

        /** При возникновении ошибки при передаче делаем reject */
        req.on(ERROR_EVENT, error => {
            reject(error);
        });
    });
};

/**
 * @async
 * @function
 * @name prepareReqObject 
 * @description Функция подготовки объекта запроса к использованию
 *              (обогащает объект запроса url, rawUrl, body и query)
 * @param {object} req обеъект запроса
 * @returns {Promise<void>} обещание подготовки объекта запроса
 * @public
 */
export const prepareReqObject = async (req) => {
    try {
        req.rawUrl = req.url;
        const { url, query } = queryStringProcessor(req);
        req.url = url;
        
        req.query = query;

        const body = await readBody(req);

        req.body = body ? body : {};
    } catch(error) {
        throw error;
    }
};
