/** Импотируем из констант стандартный код успешного выполнения запросов */
import { DEFAULT_SUCCESS_CODE } from '../constants.mjs';

/**
 * @function
 * @name seonApi
 * @description Функция, которая фомирует ответ в стандарте SEON
 * @param {Array<any>} data список объектов данных
 * @param {Array<Error>} errors список объектов ошибок
 * @param {object} meta объект с метаинформацией
 * @returns {String} JSON объект приведённый к строк
 * @public
 */
export const seonApi = function (data=[], errors=[], meta={}) {
    try {
        return JSON.stringify({ data, errors, meta });
    } catch (error) {
        throw error;
    }
};

export const db = function() {
    const pluginName = this.dbName;
    return (pluginName && this.call.hasOwnProperty(pluginName)) ? this.call[pluginName] : undefined;
};

/**
 * @function
 * @name allHealth
 * @description метод возвращает ответ для маршрута /health
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} 
 * @public
 */
export const allHealth = function (_req, _res) {
    return { data: [{ message: 'HEALTH'}], code: DEFAULT_SUCCESS_CODE };
};


/**
 * @function
 * @name allInfo
 * @description метод возвращает ответ для маршрута /info
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} 
 * @public
 */
export const allInfo = function (_req, _res) {
    return { data: [{ message: 'INFO'}], code: DEFAULT_SUCCESS_CODE };
};

/**
 * @function
 * @name allMap
 * @description метод возвращает ответ для маршрута /map
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} 
 * @public
 */
export const allMap = function (_req, _res) {
    return { data: [{ message: 'MAP'}], code: DEFAULT_SUCCESS_CODE };
};

/**
 * @function
 * @name getErrorObject
 * @description Метод, который фомирует стандартный объект ошибки из кода и сообщения
 * @param {number} code код ошибки
 * @param {string} message сообщение ошибки
 * @returns {object} объект с информацией обо ошибке
 * @private
 */
export const getErrorObject = (code, message) => {
    return { code, errors: [message] };
};

/**
 * @function
 * @name paymentRequired
 * @description Обработчик для ошибки требования оплаты
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const paymentRequired = function (_req, _res) { 
    return getErrorObject(402, 'Payment Required');
}

/**
 * @function
 * @name badRequest
 * @description Обработчик для ошибки не корректного запроса
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const badRequest = function (_req, _res) { 
    return getErrorObject(400, 'Bas request');
};

/**
 * @function
 * @name unauthorized
 * @description Обработчик для ошибки требования автризации (запросы был сделан
 *              не автризованным пользователем)
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const unauthorized = function (_req, _res) { 
    return getErrorObject(401, 'Unauthorized');
};

/**
 * @function
 * @name forbidden
 * @description Обработчик для ошибки, если метод запрещён (по умолчанию)
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const forbidden = function (_req, _res) { 
    return getErrorObject(403, 'Forbidden');
};

/**
 * @function
 * @name notFound
 * @description Обработчик для ошибки, если объект(ы) не найдены
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const notFound = function (_req, _res) {
    return getErrorObject(404, 'Not found');
};

/**
 * @function
 * @name methodNotAllowed
 * @description Обработчик для ошибки не поддерживаемого метода
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const methodNotAllowed = function (_req, _res) {
    return getErrorObject(405, 'Method Not Allowed');
};

/**
 * @function
 * @name notAcceptable
 * @description Обработчик для ошибки случая, когда после выполнения действия не был
 *              найден контент, отвечающий критериям User Agent
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const notAcceptable = function (_req, _res) {
    return getErrorObject(405, 'Not Acceptable');
};

/**
 * @function
 * @name proxyAuthenticationRequired
 * @description Обработчик для ошибки возникающей при необходимости автризации за прокси
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const proxyAuthenticationRequired = function (_req, _res) {
    return getErrorObject(407, 'Proxy Authentication Required');
};

/**
 * @function
 * @name requestTimeout
 * @description Обработчик для ошибки возникающий, когда действие отваливается по таймауту
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const requestTimeout = function (_req, _res) {
    return getErrorObject(408, 'Request Timeout');
};

/**
 * @function
 * @name conflict
 * @description Обработчик для ошибки "Требуется оплаты"
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const conflict = function (_req, _res) {
    return getErrorObject(409, 'Conflict');
};

/**
 * @function
 * @name gone
 * @description Обработчик для ошибки конфликта запроса и текущего состояния сервера
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const gone = function (_req, _res) {
    return getErrorObject(410, 'Gone');
};

/**
 * @function
 * @name lengthRequired
 * @description Обработчик для ошибки возникающей из-за отсутвтия заголовка Content-Length
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const lengthRequired = function (_req, _res) {
    return getErrorObject(411, 'Length Required');
};

/**
 * @function
 * @name preconditionFailed
 * @description Обработчик для ошибки, возникающей при наличии в заголовках условий, которые
 *              клиент не может выполнить
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const preconditionFailed = function (_req, _res) {
    return getErrorObject(412, 'Precondition Failed');
};

/**
 * @function
 * @name payloadTooLarge
 * @description Обработчик для ошибки, возникающей когда запрос превышает лимит, указанный севером. Может
 *              закрыть соединене с заголовом Retry-After
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const payloadTooLarge = function (_req, _res) {
    return getErrorObject(413, 'Payload Too Large');
};

/**
 * @function
 * @name uriTooLong
 * @description Обработчик для ошибки слишком большого url
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const uriTooLong = function (_req, _res) {
    return getErrorObject(414, 'URI Too Long'); 
};

/**
 * @function
 * @name unsupportedMediaType
 * @description Обработчик для ошибки для случая, когда сервер не поддерживает фомат данных запроса
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const unsupportedMediaType = function (_req, _res) {
    return getErrorObject(415, 'Unsupported Media Type');
};

/**
 * @function
 * @name rangeNotSatisfiable
 * @description Обработчик для ошибки, которая возникает когда указанный заголовком Range запроса
 *              привышает пределы переданного URL.
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const rangeNotSatisfiable = function (_req, _res) {
    return getErrorObject(416, 'Range Not Satisfiable');
};

/**
 * @function
 * @name expectationFailed
 * @description Обработчик для ошибки, которая означаает, что ожидание, полученное из закпроса Expect, не
 *              может быть выполнено сервером
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const expectationFailed = function (_req, _res) {
    return getErrorObject(417, 'Expectation Failed');
};

/**
 * @function
 * @name teapot
 * @description Обработчик для ошибки, которая означает "Я - чайник"
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const teapot = function (_req, _res) { 
    return getErrorObject(418, 'I\'m a teapot');
};

/**
 * @function
 * @name authTimeout
 * @description Обработчик для ошибки, которая возникает что произошёл таймаут на автризацию
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const authTimeout = function (_req, _res) {
    return getErrorObject(419, 'Authentication Timeout (not in RFC 2616)');
};

/**
 * @function
 * @name misdirectedRequest
 * @description Обработчик для ошибки, которая означает ошибочную маршрутизацию
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const misdirectedRequest = function (_req, _res) {
    return getErrorObject(421, 'Misdirected Request');
};

/**
 * @function
 * @name unprocessableEntity
 * @description Обработчик для ошибки, который возвращается когда передан необрабатываемый
 *              экземпляр данных в запросе
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const unprocessableEntity = function (_req, _res) {
    return getErrorObject(422, 'Unprocessable Entity'); 
};

/**
 * @function
 * @name locked
 * @description Обработчик для ошибки, которая возвращается если маршрут 
 *              или операция сервера заблокирован(а)
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const locked = function (_req, _res) {
    return getErrorObject(423, 'Locked');
};

/**
 * @function
 * @name failedDependency
 * @description Обработчик для ошибки, которая говорит о том, что была передана невыполнимая
 *              зависимость
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const failedDependency = function (_req, _res) {
    return getErrorObject(424, 'Failed Dependency');
};

/**
 * @function
 * @name tooEarly
 * @description Обработчик для ошибки, которая говорит о том, что были переданны данные
 *              слишком рано (для примера - мы создали черновик, который пытаемся привязать
 *              к другой опубликованной единицы данных)
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const tooEarly = function (_req, _res) {
    return getErrorObject(425, 'Too Early');
};

/**
 * @function
 * @name upgradeRequired
 * @description Обработчик для ошибки, которая говорит, что данные нуждаются в обновлении
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const upgradeRequired = function (_req, _res) {
    return getErrorObject(426, 'Upgrade Required');
};

/**
 * @function
 * @name preconditionRequired
 * @description Обработчик для ошибки, которая говорит, что нужно выполнение предусловия
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const preconditionRequired = function (_req, _res) {
    return getErrorObject(428, 'Precondition Required');
};

/**
 * @function
 * @name tooManyRequests
 * @description Обработчик для ошибки, которая говорит о том, что было отправлено слишком много
 *              аналогичных запросов
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const tooManyRequests = function (_req, _res) {
    return getErrorObject(429, 'Too Many Requests'); 
};

/**
 * @function
 * @name largeHeaders
 * @description Обработчик для ошибки, которая возникает из-за слишком большой длинны заголовка
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const largeHeaders = function (_req, _res) {
    return getErrorObject(431, 'Request Header Fields Too Large');
};

/**
 * @function
 * @name retryWith
 * @description Обработчик для ошибки, каоторая возникает если требуется повторить запрос с
 *              дополнительными условиями/данными
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const retryWith = function (_req, _res) {
    return getErrorObject(449, 'Retry With'); 
};

/**
 * @function
 * @name unavailableReasons
 * @description Обработчик для ошибки, которая возникает, если получение результата невозможно
 *              по юридическим причинам
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const unavailableReasons = function (_req, _res) {
    return getErrorObject(451, 'Unavailable For Legal Reasons');
};

/**
 * @function
 * @name clientClosedRequest
 * @description Обработчик для ошибки, которая возникает если клиент неожиданно закрыл соединение
 *              (закрыл соединене слишком рано)
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const clientClosedRequest = function (_req, _res) {
    return getErrorObject(499, 'Client Closed Request');
};

/**
 * @function
 * @name internalError
 * @description Обработчик для ошибки, которая возвращается при непредвиденной ошибке сервера
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const internalError = function (_req, _res) {
    return getErrorObject(500, 'Internal Server Error');
};

/**
 * @function
 * @name notImplemented
 * @description метод возвращает ответ для ошибки, если метод/функция не реализованы
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} 
 * @public
 */
export const notImplemented = function (_req, _res) {
    return getErrorObject(501, 'Not Implemented');
};

/**
 * @function
 * @name badGateway
 * @description метод возвращает ответ для ошибки, если произошла ошибка шлюза
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} 
 * @public
 */
export const badGateway = function (_req, _res) {
    return getErrorObject(502, 'Bad Gateway');
};

/**
 * @function
 * @name unavailableService
 * @description Обработчик для ошибки, которая возвращается если какой-либо сервис
 *              не доступен
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const unavailableService = function (_req, _res) { 
    return getErrorObject(503, 'Service Unavailable'); 
};

/**
 * @function
 * @name gatewayTimeout
 * @description Обработчик для ошибки, которая возникает если шлюз отпал по таймауту
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const gatewayTimeout = function(_req, _res) { 
    getErrorObject(504, 'Gateway Timeout'); 
};

/**
 * @function
 * @name notSupported
 * @description Обработчик для ошибки, если HTTP версия не поддерживается
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const notSupported = function (_req, _res) { 
    return getErrorObject(505, 'HTTP Version Not Supported');
};

/**
 * @function
 * @name variantAlsoNegotiates
 * @description Обработчик для ошибки, если вариант ответа требуется согласования
 *              (не консистентные данные)
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const variantAlsoNegotiates = function (_req, _res) {
    return getErrorObject(506, 'Variant Also Negotiates');
};

/**
 * @function
 * @name insufficientStorage
 * @description Обработчик для ошибки, которая возникает если хранилище переполнено
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const insufficientStorage = function (_req, _res) {
    return getErrorObject(507, 'Insufficient Storage');
};

/**
 * @function
 * @name loopDetected
 * @description Обработчик для ошибки, которая возникает при обнаружении циклической
 *              зависимости/действий
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const loopDetected = function (_req, _res) { 
    return getErrorObject(508, 'Loop Detected');
};

/**
 * @function
 * @name bandwidthLimitExceeded
 * @description Обработчик для ошибки, которая возникает если достигнут максимум
 *              пропускной способности канала
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const bandwidthLimitExceeded = function (_req, _res) {
    return getErrorObject(509, 'Bandwidth Limit Exceeded');
};

/**
 * @function
 * @name notExtended
 * @description Обработчик для ошибки, которая возникает если ответ не может быть расширен
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const notExtended = function (_req, _res) {
    return getErrorObject(510, 'Not Extended');
};

/**
 * @function
 * @name networkAuthRequired
 * @description Обработчик для ошибки, которая возвращается если требуется авторизация в сети
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const networkAuthRequired = function (_req, _res) {
    return getErrorObject(511, 'Network Authentication Required');
};

/**
 * @function
 * @name unknownError
 * @description Обработчик для ошибки, который возвращает неизвестную ошибку
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const unknownError = function (_req, _res) {
    return getErrorObject(520, 'Unknown Error');
};

/**
 * @function
 * @name webServerIsDown
 * @description Обработчик для ошибки, если сервер не работает
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const webServerIsDown = function (_req, _res) {
    return getErrorObject(521, 'Web Server Is Down');
};

/**
 * @function
 * @name connectionTimedOut
 * @description Обработчик для ошибки, которая возникает если соединене с сервером
 *              прервано из-за таймаута
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const connectionTimedOut = function (_req, _res) {
    return getErrorObject(522, 'Connection Timed Out');
};

/**
 * @function
 * @name originUnreachable
 * @description Обработчик для ошибки источник недоступен
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const originUnreachable = function (_req, _res) {
    return getErrorObject(523, 'Origin Is Unreachable');
};

/**
 * @function
 * @name timeoutOccurred
 * @description Обработчик для ошибки, которая возникает если время ожидания истекло
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const timeoutOccurred = function (_req, _res) {
    return getErrorObject(524, 'A Timeout Occurred'); 
};

/**
 * @function
 * @name sslHandshakeFailed
 * @description Обработчик для ошибки сопоставления SSL
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const sslHandshakeFailed = function (_req, _res) {
    return getErrorObject(525, 'SSL Handshake Failed');
};

/**
 * @function
 * @name invalidSsl
 * @description Обработчик для ошибки не корректного сертефиката SSL
 * @param {object} _req объект запроса
 * @param {object} _res объект ответа
 * @returns {object} объект, содержаший информаци об ошибке
 * @public
 */
export const invalidSsl = function (_req, _res) {
    return getErrorObject(526, 'Invalid SSL Certificate');
};