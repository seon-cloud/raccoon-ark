/** Импотируем родительский класс (класс Plugin),
 * от которого будет проходить наследования */
import { Plugin } from 'raccoon-sanctuary';

/** Импортируем константы */
import { 
  DEFAULT_PORT,
  DEFAULT_CONTENT_TYPE,
  DEFAULT_SUCCESS_CODE
} from './src/constants.mjs';

/** Получаем значениея по умолчанию для
 * наполнения объекта */
import {
  DEFAULT_ROUTES,
  DEFAULT_ERRORS,
  DEFAULT_ANSWERS
} from './src/defaults.mjs';

/** Импортируем стандартные плагины */
import ConsoleLogger from '../ConsoleLogger/index.mjs';


/** Импортируем функции из утилит для:
 * - формирования ответа в стандарте SeonAPI,
 * - поиск маршрута по URL запроса,
 * - инъекции данных в request. 
 */
import {
    findRoute,
    executeUses,
    injectInRequest,
    prepareReqObject,
    prepareParentOptions
 } from './src/utils.mjs';

/**
 * Импортируем библиотеку для работы с HTTP-запросами
 */
import http from 'http';

/**
 * @class Pistachio
 * @description Вторая версия плагиня для работы с HTTP запросами.
 * @extends Plugin
 * @author Dmitrii Shevelev
 */
export default class Pistachio extends Plugin {

    /** Свойство, содержит тип отдаваемого контента. */
    #contentType

    /** Свойство, содержит порт который будет слушать
     * приложение HTTP.
     */
    #port

    /** Экземпляр сервера приложения */
    #server

    /** Объект, содержащий маршруты, зарегистрированные в 
     * плагине HTTP приложения.
     */
    #routes

    /** Свойство, которое содержит маршурыт для билдеров ответов.
     * Является объектом, аналогично #routes
     */
    #answers 

    /** Свойство, которое содержит список middleware функция уровня
     * приложения
     */
    #uses

    /** Объект, содержащий маршруты ошибок, зарегистрированные
     * в приложении плагина HTTP приложения.
     */
    #errors

    /** Объект логера, который используется в приложении */
    #logger

    #dbName

    get dbName() {
        return this.#dbName;
    }

    get db() {
        const dbName = this.dbName;
        return (dbName && this.call.hasOwnProperty(dbName)) 
            ? this.call[dbName] 
            : undefined;
    }

    /**
     * @name
     * @description
     * @returns {number}
     * @memberof Pistachio
     * @readonly
     * @public
     */
    get port() {
        return this.#port;
    }

    /**
     * @name logger
     * @description Гетер логера
     * @returns {object}
     * @memberof Pistachio
     * @readOnly
     * @public
     */
    get logger() {
        return this.#logger;
    }
    
    /**
     * @name errors
     * @description Гетер маршутов ошибок
     * @returns {object} объект маршрутов ошибок
     * @memberof Pistachio
     * @readOnly
     * @public
     */
    get errors() {
        return this.#errors;
    }

    /**
     * @name routes
     * @description Гетер объектов маршрутов
     * @returns {object} объект маршрутов
     * @memberof Pistachio
     * @readOnly
     * @public
     */
    get routes() {
        return this.#routes;
    }

    /**
     * @method
     * @name listen
     * @description Метод, который запускает прослушивание сервера
     * @memberof Pistachio
     * @returns {void}}
     * @private
     */
    #listen() {
        this.#server.listen(this.#port, () => {
            const message = `listen on port ${this.#port}`;
            this.logger.actions.info(message);
        });
    }

    /**
     * @method
     * @name sendAnswer
     * @param {string} answerActionName имя обработчика ответа
     * @param {object} res объект ответа
     * @param {Array<Any>} data объект данных
     * @param {Array<Error>} errors массив объектов ошибок
     * @param {Object} meta объект метаданных
     * @returns {void}
     * @memberof Pistachio
     * @private
     */
    #sendAnswer(answerActionName = 'seonApi', res, data=[], errors=[], meta={}) {
        const action = this.#getActionByName(answerActionName);
        const result = action(data, errors, meta);
        res.end(result);
    }

    /**
     * @method
     * @name setHeaders
     * @param {object} headers объект заголовков запроса
     * @param {object} res объект ответа
     * @param {number} code код ответа
     * @memberof Pistachio
     * @private
     */
    #setHeaders(headers = {}, res, code = DEFAULT_SUCCESS_CODE) {
        const currentHeaders = {
            'Content-Type': this.#contentType,
            ...headers
        };
        res.writeHead(code, currentHeaders);
    }

    /**
     * @method
     * @name getErrorHandler
     * @description Метод, который возвращает обработчик ошибки
     * @param {string} message идентификатор ошибки
     * @returns {Function} обоработчик ошибки
     * @memberof Pistachio
     * @private
     */
    #getErrorHandler(message) {
        const errors = this.#errors;
        
        return errors.hasOwnProperty(message)
            ? errors[message]
            : errors.BadGateway;
    }

    /**
     * @method
     * @name findInRoutes
     * @description Метод, который возвращает handler маршрута по URL
     * @param {object} req объект запроса
     * @memberof Pistachio
     * @private
     */ 
    #findInRoutes(req) {
        const url = req.url;
        const routes = this.#routes;
        return findRoute(url, routes);
    }

    /**
     * @method
     * @name getAnswerActionName
     * @description Метод, который возвращает имя функции по URL 
     * @param {object} req объект запроса 
     * @returns {string} имя функции, которую требуется исполнить
     * @memberof Pistachio
     * @private
     */
    #getAnswerActionName(req) {
        const url = req.url;
        const answers = this.#answers;
        const { handler } = findRoute(url, answers);
        return handler ? handler : this.#answers['default'];
        
    }

    /** 
     * @method
     * @name getActionByName
     * @description Метод возвращает action по имени
     * @param {string} name имя action'а
     * @returns {function|object|undefined} результат (синхронная/асинхронная функция)
     * @private
     */
    #getActionByName(name) {
        const actions = this.actions;
        return actions.hasOwnProperty(name)
            ? actions[name]
            : undefined;
    }

    /**
     * @method
     * @name getActionsList
     * @description Метод возвращает список дейтвий
     * @param {Array<string>} handler
     * @returns {Array<object|function}
     * @memberof Pistachio
     * @private
     */
    #getActionsList(handler) {
        const actionsList = [];
        handler.forEach(name => {
            if (this.actions.hasOwnProperty(name)) {
                actionsList.push(this.actions[name]);
            }
        });
        return actionsList;
    }

    /**
     * @method
     * @name getRouteActions
     * @description Метод, который возвращает action по зарегистрированному маршруту. 
     *              Существует 3 основных стретагии по которым происходит выбор:
     *              а. обработчик является строкой, т.е. прямым ключом в объекте действий;
     *              б. обработчик является объектом, т.е. в нём определены обработчики для конкретных методов;
     *              в. обработчик не являяется ни строкой, ни объектом. В этом случае действие нельзя определить.
     * @param {string|object} handler 
     * @param {string} method
     * @memberof Pistachio 
     * @private
     */
    #getRouteActions(handler, method) {
        let action;
        const handlerType = typeof handler;
        switch (handlerType) {
            case 'string':
                /** Получаем действие по имени */
                action = this.#getActionByName(handler);
                break;
            case 'object':
                if (Array.isArray(handler)) {
                    action = this.#getActionsList(handler);
                } else {
                    let realHandler;
                    /** Важный момент.
                     * Либо берётся роут с ключом ALL с объекта (считаем, 
                     * что при этом нельзя перегрузить действие), либо берём
                     * действие, которое перегружено. */
                    if (Array.isArray(handler)) {
                        realHandler = handler;
                    } else if(handler?.all) {
                        realHandler = handler.all;
                    } else {
                        realHandler = handler.hasOwnProperty(method)
                            ? handler[method]
                            : undefined;
                    }

                    if (Array.isArray(realHandler)) {
                        action = this.#getActionsList(realHandler);
                    } else if (realHandler !== undefined) {
                        action = this.#getActionByName(realHandler);
                    } else {
                        action = undefined;
                    }
                }
                break;
            default:
                /** Присваиваем действию значение по умолчанию
                 * - пустое действие. */
                action = undefined;
                break;
        }
        return Array.isArray(action) ? action : [action];
    }

    /**
     * @meth
     * @name stop 
     * @description Метод, который станавливает HTTP-сервер
     * @param {Function} callback
     * @returns {void}
     * @memberof Pistachio
     * @publi
     */
    stop(callback) {
        this.#server.close(callback);
    }

    /**
     * @method
     * @name getResult
     * @description Метод последовательно выполняет фукнции из массива до тех пор
     *              пока не получит ответ, не являющийся типом boolean или undefined.
     *              После этого - результат возвращается, а оставшиеся функции выполняются
     *              асинхронно в фоновом режиме.
     * @param {Array<object|function>} actions список функция для выполнения
     * @param {object} req объект запроса
     * @param {object} res объект ответа
     * @returns {Object, Array, Number, String} данные, которые являются результатом выполнения 
     * @private
     * @async 
     */
    async #getResult(actions, req, res) {
        let result;
        let iterationResult = undefined;
    
        /** #TODO проверить, корректно ли отрабатывает во всех ситуациях
         * Для тех, кто будет поддерживать. Документация по функци shift (обычно
         * её не знают джуны и нодеры, ибо мутирует массив. Но тут вроде как не
         * критично): https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/shift*/
        const currentAction = actions.shift();
        /** Проверяем, что действие из массива существует.
         * Если функции не существует - стеляем ошибкой NotImplemented */
        if (currentAction) {
            /** Получаем результат на текущей итерации */
            iterationResult = await currentAction(req, res);

            /** Если результат не является типом boolean, то считаем его конечным и
             * запускаем оставшиеся функции асинхронно в фоновом режиме.
             * Если результат равен false, то прерываем выполнене без конкретной ошибки 
             * (вызываем ошибку BadRequest).
             * Если результат является типом boolean - вызываем рекурсивно функцю с 
             * вменьшенным на 1 массивом действий.
             */
            if (typeof iterationResult !== 'boolean') {
                result = iterationResult;
                Promise.all(actions.map(action => action(req, res)));
            } else if (iterationResult === false) {
                throw Error('BadRequest');
            } else {
                result = await this.#getResult(actions, req, res);
            }
        } else {
            throw Error('NotImplemented');
        }

        return result;
    }

    /**
     * @method
     * @name start
     * @description Метод, который создаёт сервер и запускает его прослушивание
     *              по искомому порту
     * @memberof Pistachio
     * @returns {void}
     * @public
     */
    start() {
        /** Создаём HTTP сервер и прописываем обработку запроса */
        this.#server = http.createServer(async (req, res) => {
            /** Задаём начальные значения переменных:
             * - data: массив данных
             * - errors: массив ошибок
             * - meta: объект метаданных
             * - code: код, которым отвечает сервер
             */
            let data = [];
            let meta = {};
            let errors = [];
            
            let code = DEFAULT_SUCCESS_CODE;
            
            let headers = {};

            /** Мутируем объект req:
             * - добавляем rawUrl, чтобы сохранить исходный сырой url запроса
             * - добавляем объейт query, составленный из query string
             * - добавляем body запроса (для типов не GET) 
             */
            await prepareReqObject(req);
            
            /** Запускаем мидлвари уровня сервера */
            const uses = this.#uses;
            await executeUses(uses, req, res);

            const answerActionName = this.#getAnswerActionName(req);
            /** Получаем данные для обновления переменных data, errors, meta, code */
            try {
                /** Получаем метод запроса и приводим его к нижнему регистру */
                const method = req.method.toLocaleLowerCase();
                /** Получаем имя(а) обработчика и параметры запроса из строки */
                const { handler, params } = this.#findInRoutes(req);
                
                /** Обогащаем запрос параметрами строки запроса */
                injectInRequest(req, 'params', params);

                /** Получаем массив actions, которые требуется вполняить 
                 * для получания данных ответа
                 */
                const actions = this.#getRouteActions(handler, method);

                /** Проверяем, что массив действий не пустой.
                 * Если массив не пустой - получаем результат и формируем данные для ответа.
                 * Если массив пустой - стерляем ошибкой ("Метод не определён")
                 */
                if (actions) {
                    const result = await this.#getResult(actions, req, res);
                    /** Если объект ответа содержит поле data, то им заполняем данные для ответа,
                     * иначе принимаем весь ответ за данные.
                     * Если в ответе содержится поле code и поле data, то присваиваем значение code,
                     * иначе присваиваем DEFAULT_SUCCESS_CODE.
                     */
                    data = result?.data ? result.data : result;
                    code = result?.data && result?.code ? result.code : DEFAULT_SUCCESS_CODE;

                    if (result?.headers) {
                        headers = result.headers;
                    }

                    /** Если в результате вычисления массива действий присутствует поле meta, 
                     * то расширяем текущий объект на эти значения */
                    if (result?.meta) {
                        meta = { ...meta, ...result.meta };
                    }
                } else {
                    throw Error('NotImplemented');
                }
            } catch (error) {
                /** */
                this.logger.actions.error(error);
                /** Получаем маршрут ошибки */
                const errorHandler = this.#getErrorHandler(error.message);
                /** Получаем action по маршруту ошибки */
                const errorAction = this.#getActionByName(errorHandler);
                /** Получаем результат выполенния функции и присваиваем его 
                 * массиву ошибок ответа
                 */
                const result = errorAction(req, res, meta);
                errors = result.errors;
                code = result.code;
            }
            /** Наполняем headers ответа */
            this.#setHeaders(headers, res, code);
            /** Возвращаем ответ */
            this.#sendAnswer(answerActionName, res, data, errors, meta);
        });

        /** Запускаем прослушивание сервера */
        this.#listen();
    }

    /**
     * @method
     * @name prepareInstanceProperties
     * @description Метод, который обогащает свойства объекта данными
     * @param {object} options
     * @memberof Pistachio
     * @returns {void}
     * @private
     */
    #prepareInstanceProperties(options) {
        /** Задаём порт, на который будет повещено просшуливание сервера.
         * Если опция port присутствует в объекте options, то присваиваем его.
         * Если опции port нет в объекте options, используем DEFAULT_PORT.
         */
        this.#port = options?.port ? options.port : DEFAULT_PORT;

        /** Задаём объект маршрутов билдеров ответов, которые будут вызываться пред
         * возвратом ответа (т.е. вычислять result перед res.end).
         * Если опция answers присутствует в объекте options, то присваиваем её.
         * Если опции answers нет в объекте options, используем DEFAULT_ANSWERS. 
         */
        this.#answers = options?.answers 
            ? { ...DEFAULT_ANSWERS, ...options.answers }
            : DEFAULT_ANSWERS;


        /** Задаём тип возвращаемого контента.
         * Если тип возвращаемого контента задан в опциях - используем его.
         * Если тип возвращаемого контента не задан в опцияз - используем
         * тип возвращаемого контента по умолчанию.
         */
        this.#contentType = options?.contentType
            ? options.contentType
            : DEFAULT_CONTENT_TYPE;

        /** Проверям на наличие заданныйх через опции маршрутов.
         * Если маршруты заданы - то мёрджим с маршрутами по умолчанию.
         * Если маршруты не заданы - остаются маршруты заданные по умолчанию.
         */
        this.#routes = options?.routes
            ? { ...DEFAULT_ROUTES, ...options.routes }
            : DEFAULT_ROUTES;


        /** Проверяем на наличие заданных через опции обработчиков ошибок
         * (маршруты ошибок, работают аналогично простым маршрутам).
         * Если маршруты ошибок заданы - то мёрджим с маршрутами по умолчанию.
         * Если маршруты ошибок не заданы - остаютс маршруты заданные по умолчанию.
         */
        this.#errors = options?.errors 
            ? { ...DEFAULT_ERRORS, ...options.errors }
            : DEFAULT_ERRORS;

        /** Задаём middleware для уровня приложения.
         * Если в options присутствует поле uses - присваеваем (или добавляем его)
         * в приватное свойство uses класса.
         * Если в options не пристутствует поле uses - присваеваим пустой массив.
         */
        if (options?.uses) {
            const uses = options.uses;
            if (Array.isArray(uses)) {
                this.#uses = uses;
            } else {
                this.#uses.push(uses);
            }
        } else {
            this.#uses = [];
        }

        /** Получаем класс логера */
        const logger = options?.logger
            ? options.logger
            : ConsoleLogger;
        
        /** Получаем опции логера */
        const loggerOptions = options?.loggerOptions
            ? options.loggerOptions 
            : {};
        
        /** Создаем новый экземпляр класса плагина логера */
        this.#logger = new logger(loggerOptions);

        this.#dbName = options?.dbName
            ? options.dbName
            : undefined;
    }

    /**
     * @constructor
     * @description конструктор объекта Pistachio.
     * @param {object} options опции для инициализации объекта с нужными свойтвами
     * @meberof Pistachio 
     */
    constructor(options) {
        /** */
        const parentOptions = prepareParentOptions(options);

        /** Инициализируем  класс плагина (родительский) опциями:
         * - имя плагина
         * - действия плагиа (его API)
         * - пакеты плагина (packages, библиотеки которые нужны для работы и должны
         * быть доступны по this.packages в будущем).
         */
        super(parentOptions);

        /** Вызываем функцию, которая обогащает экземпляр данными */
        this.#prepareInstanceProperties(options); 
    }
}
