/**
 * Импортируем пакет ODM для MongoDB (Mongoose)
 * */
import mongoose from 'mongoose';

/** 
 * Значения по умолчанию:
 * DEFAULT_LIMIT - количество записей, которое требуется получить
 * DEFAULT_SKIP - количество записей, которое требуется пропустить 
 * DEFAULT_SORT - заданная сортировка списка полученных документов
 * DEFAULT_FILTER - фильтр для запроса 
 * DEFAULT_LEAN  - свойство необходимости приведения документа  к чистому объекту
 * DEFAULT_SELECT - выводимые поля документа
 * IS_REMOVED - значение свойства isRemoved для удалённого документа
 * IS_NOT_REMOVED - значние свойства для не удаленного документа
 * DEFAULT_PAGE - страница, передаваемая по умолчанию
 * DEFAULT_PAGE_STEP - шаг страницы
 */
import {
    DEFAULT_LIMIT,
    DEFAULT_SKIP,
    DEFAULT_SORT,
    DEFAULT_FILTER,
    DEFAULT_LEAN,
    DEFAULT_SELECT,
    IS_REMOVED,
    IS_NOT_REMOVED,
    DEFAULT_PAGE,
    DEFAULT_PAGE_STEP,
    INDEX_DATA,
    INDEX_COUNT
} from './constants.mjs';

/**
 * Функция получения результатов вычисления количества документов
 * из результирующего массива (результат выполнения обещания из
 * массива Promise.all)
 * 
 * @function _getCountFromResult
 * @param {Array<any>} result массив результатов (результат выполнения Promise.all)
 * @returns {number} результат выполнения запроса подсчёта  
 * @private
 */
const _getCountFromResult = result => {
    return result[INDEX_COUNT]?.data
        ? result[INDEX_COUNT].data
        : result[INDEX_COUNT];
};

/**
 * Функция получения результатов запроса поиска документа(ов)
 * из результирующего массива (результат выполнения обещания из
 * массива Promise.all)
 * 
 * @function _getDataFromResult
 * @param   {Array<any>}             массив результатов (результат вычисления Promise.all)
 * @returns {object|Array<any>|null} result массив документов или документ, или пустое значение
 * @private
 */
const _getDataFromResult = result => {
    return result[INDEX_DATA]?.data
        ? result[INDEX_DATA].data
        : result[INDEX_DATA];
};

/**
 * @function
 * @name _find
 * @description функция, которая реалзует списочный метод обращеия к данным.
 *              Кроме имени модели может быть задан фильтр,  количество элементов 
 *              для выводы, количество элементово от начала для пропуска,
 *              порядок сортировки, возрврат чистого объекта данных.
 *              Является приватной функцией, которая используется в обработчиках.
 * @param       {object}     self       объект текущего контекста
 * @param       {sting}      modelName  имя модели
 * @param       {object}     filter     фильтр запроса к БД
 * @param       {object}     select     фильтр полей
 * @param       {number}     limit      количество для вывода
 * @param       {number}     skip       количество для пропуска от начала
 * @param       {Array<any>} sort       порядок сортировки
 * @param       {boolean}    lean       опция, возвращающая чистые объекты
 * @returns     {Promise<object>}       объект содержащий список найденный записей и
 *                                      количественную инфомацию
 * @private
 * @async
 */
const _find = async function(
    self,
    modelName,
    filter=DEFAULT_FILTER, 
    select=DEFAULT_SELECT, 
    limit=DEFAULT_LIMIT, 
    skip=DEFAULT_SKIP, 
    sort=DEFAULT_SORT, 
    lean=DEFAULT_LEAN
) {
    let errors = null;
    let data = null;
    let meta = null;
    
    try {
        /** Получаем модель из объекта моделей */
        const model = _getModel(self.models, modelName);
        /** Составляем запрос */
        const query = model.find(filter)
                            .limit(limit)
                            .skip(skip)
                            .sort(sort)
                            .select(select);
        /** Получаем асинхронно 2 запроса.
         * Соотвествующий INDEX_DATA - запрос списка документов
         * Соответствующий INDEX_COUNT - запрос количества документов
         */
        const result = await Promise.all([
            lean ? await query.lean() : await query,
            _count(self, modelName, filter),
        ]);
        /** Наполняем данными переменную data*/
        data = _getDataFromResult(result);
        /** Наполняем данными переменную count */
        const count = _getCountFromResult(result);
        /** Формируем объект мета-информации */
        meta = { limit, skip, count };
    } catch (error) {
        errors = [error];
    }

    return { data, errors, meta };
};

/**
 * @function
 * @name _paginated
 * @description Функця, выводит пагинированный список. Сахар над _find.
 * @param   {object}        self        объект текущего контекста
 * @param   {string}        modelName   имя модели 
 * @param   {object}        filter      объект фильтров
 * @param   {number}        page        номер страницы
 * @param   {number}        select      список полей по выводу
 * @param   {object}        sort        сортировака полученного списка
 * @param   {boolean}       lean        опция, возвращающая чистые объекты
 * @param   {number}        perPage     количество документов на странице
 * @returns {Promise<object>}           объект содержащий список найденных докумнетов
 *                                      и инфомацию по пагинации
 * @private
 * @async 
 */
const _paginated = async function(
    self,
    modelName, 
    filter,
    page,
    select,
    sort,
    lean,
    perPage
) {
    let errors = null;
    let data = null;
    let meta = null;

    try {
        const limit = perPage;
        const skip = (page - DEFAULT_PAGE_STEP) * perPage;
        
        const result = await Promise.all([
            _find(self, modelName, filter, select, limit, skip, sort, lean),
            _count(self, modelName, filter)
        ]);

        const pageCount = Math.ceil(result[INDEX_COUNT].data/perPage);

        const nextPage = (pageCount > page)
            ? page + DEFAULT_PAGE_STEP
            : page;
        
        data = result[INDEX_DATA].data;
        const count = result[INDEX_COUNT].data;

        meta = { page, nextPage, pageCount, count, limit, filter }; 
    } catch (error) {
        errors = [error];
    }
    return {data, meta, errors };
};

/**
 * @function
 * @name _findOne
 * @description Функция-обработчик для получения одной запипси из БД
 *              по фильтру
 * @param   {object}         self      объект текущего контекста
 * @param   {string}         modelName имя модели
 * @param   {object}         filter    объект фильтров
 * @param   {object|string}  select    поля, которые будут содержаться в ответе
 * @param   {boolean}        lean      опция, которая "отрезает" методы модели
 * @returns {Promise<object|null>}     найденный объект докуента или null
 * @private
 * @async
 */
const _findOne = async function(
    self,
    modelName, 
    filter=DEFAULT_FILTER, 
    select=DEFAULT_SELECT, 
    lean=DEFAULT_LEAN
) {
    let errors = null;
    let data = null;
    let meta = null;
    try {
        const model = _getModel(self.models, modelName);
        const query = model.findOne(filter).select(select);
        
        data = lean ? await query.lean() : await query;
        meta = { filter }; 
    } catch (error) {
        errors = [error];
    }

    return { data, meta, errors };
};

/**
 * @function
 * @name _count
 * @description Функция получения количества записей в БД
 * @param   {object}    self        объект текущего контекста
 * @param   {string}    modelName   имя модели
 * @param   {object}    filter      объект фильтра
 * @returns {Promise<number>}       количество записей    
 * @private
 * @async 
 */
const _count = async function(self, modelName, filter) {
    let data = null;
    let meta = null;
    let errors = null;

    try {
        const model = _getModel(self.models, modelName);
        data = await model.countDocuments(filter);
        meta = { filter };
    } catch (error) {
        errors = [error];
    }
    return { data, meta, errors };
};


/**
 * @function
 * @name _filterRemoved
 * @description функция, вовзращающая объект фильтров с корретно выставленным значением 
 *              isRemoved (в true, т.е. помечен к удалению)
 * @param   {object} filter объект фильтров 
 * @returns {object}        объект фильтров с корретно выставленным параметром isRemoved
 * @private
 */
const _filterRemoved = filter => {
    return {
        ...filter,
        isRemoved: IS_REMOVED
    };
};

/**
 * @function
 * @name _filterNotRemoved
 * @description функция, вовзращающая объект фильтров с корретно выставленным значением isRemoved
 *              (в false, т.е. не помечен к удалению)
 * @param   {object} filter объект фильтров
 * @returns {object}        объект фильтров с корректно выставленным
 *                          параметром isRemoved
 * @private 
 */
const _filterNotRemoved = filter => {
    return {
        ...filter,
        isRemoved: IS_NOT_REMOVED
    };
};

/**
 * @function
 * @name _updateOne
 * @description Функция обновления одной записи в БД
 * @param   {object}    self        объект текущего контекста
 * @param   {string}    modelName   имя модели
 * @param   {object}    filter      фильтр для поиска записи
 * @param   {object}    update      объект свойство для обновления
 * @param   {boolean}   lean        опция, которая "отрезает" методы модели
 * @param   {object}    updated     опция, которая позволяет вернуть старое или 
 *                                  новое состояние документа
 * @returns {Promise<object>}       документ в выбранном состоянии (до или после 
 *                                  функци сохранения)
 * @private
 * @async 
 */
const _updateOne = async function (self, modelName, filter, update, lean, updated) {
    let data = null;
    let errors = null;
    let meta = null;

    try {
        const model = _getModel(self.models, modelName);
        const query = model.findOneAndUpadate(filter, update, { new: updated });    
        
        data = lean  ? await query.lean() : await query;
        meta = { filter };
    } catch (error) {
        errors = [error];
    }

    return { data, meta, errors }
};

/**
 * @function
 * @name _getModel
 * @description Функция получения их объекта моделей модель по имени
 * @param {object} models    объект моделей плагина Foxy
 * @param {string} modelName имя модели
 * @returns {object}         модель, полученная по переданному
 *                           имени
 * @private
 */
const _getModel = function(models, modelName) {
    if (models.hasOwnProperty(modelName) === true) {
        return models[modelName];
    } else {
        throw new Error(`Не получается найти модель с именем ${modelName}`);
    }
};

/**
 * @function
 * @name getModels
 * @description функция получения объекта с моделями, которые зарегистрированных в
 *              плагине Foxy 
 * @returns {object} объеки моделей
 * @exports
 */
const getModels = function() {
    return this.models;
};

/**
 * @function
 * @nane getModel
 * @description функция получения объекта модели по имени этой модели
 * @param   {string} modelName имя модели
 * @returns {object|undefined} объект модели или пустое значение
 * @exports 
 */
const getModel = function(modelName) {
    try {
        if (modelName) {
            return this.models.hasOwnProperty(modelName)
                ? this.models[modelName]
                : undefined;
        } else {
            throw new Error('Не передана имя модели')
        }
    } catch (error) {
        return undefined;
    }
};

/**
 * @function
 * @name find
 * @description Функция-обработчик, которая реалзует списочный метод обращеия к данным.
 *              Кроме имени модели может быть задан фильтр (по умолчанию - {}), 
 *              количество элементов для выводы (по умолчанию - 10),
 *              количество элементово от начала для пропуска (по умолчанию - 0),
 *              порядок сортировки (по умолчанию undefined),
 *              возрврат чистого объекта данных (по умолчанию false).
 * @param {sting}      modelName        имя модели
 * @param {object}     filter           фильтр запроса к БД
 * @param {object}     select           фильтр полей
 * @param {number}     limit            количество для вывода
 * @param {number}     skip             количество для пропуска от начала
 * @param {Array<any>} sort             порядок сортировки
 * @param {boolean}    lean             опция, возвращающая чистые объекты
 * @returns {Promise<object>}           объект, содержащий список найденный записей
 *                                      и количественную информацию об списке
 * @exports
 * @async
 */
const find = async function(
        modelName, 
        filter=DEFAULT_FILTER, 
        select=DEFAULT_SELECT, 
        limit=DEFAULT_LIMIT, 
        skip=DEFAULT_SKIP, 
        sort=DEFAULT_SORT, 
        lean=DEFAULT_LEAN
) {
    const extFilter = _filterNotRemoved(filter);
    return await _find(this, modelName, extFilter, select, limit, skip, sort, lean); 
};

/**
 * @function
 * @name findById 
 * @description Метод получения записи по UUID
 * @param {string}  modelName имя модели
 * @param {string}  uuid      идентификатор
 * @param {object}  select    поля, которые будут содержаться в ответе
 * @param {boolean} lean      опция, которая "отрезает" методы модели
 * @returns {object|null}     результат поиска по коллекции
 * @exports
 * @async
 */
const findById = async function(modelName, uuid, select=DEFAULT_SELECT, lean=DEFAULT_LEAN) {
    const filter = _filterNotRemoved({ _id: mongoose.Types.ObjectId(uuid) });
    return await _findOne(this, modelName, filter, select, lean);
};

/**
 * @function
 * @name findByIds
 * @description Функция-обработчик получения докумнетов из базы по списку UUIDS
 * @param   {string}            modelName   имя модели
 * @param   {Array<string>}     uuids       список UUID
 * @param   {number}            limit       количество выводимых документов
 * @param   {number}            skip        количество пропущенных документов
 * @param   {object|string}     select      список полей для вывода
 * @param   {boolean}           lean        необходимост возврата чистого объекта
 * @returns {Promise<object>}               объект, содержаший список найденных документов
 *                                          и информацию по общему количеству
 * @exports
 * @async
 */
const findByIds = async function(
    modelName, 
    uuids=[], 
    limit=DEFAULT_LIMIT,
    skip=DEFAULT_SKIP,
    select=DEFAULT_SELECT, 
    lean=DEFAULT_LEAN
) {
    let data = null;
    let errors = null;
    let meta = null;

    try {
        const model = _getModel(this.models, modelName);
        const self = this;
        
        const filter = _filterNotRemoved({
            '_id': {
                $in: uuids.map(uuid => mongoose.Types.ObjectId(uuid))
            }
        });
        
        const query = model.find(filter).select(select).limit(limit).skip(skip);

        const result = await Promise.all([
            lean ? await query.lean() : await query,
            _count(self, modelName, filter)            
        ]);
        
        const count = _getCountFromResult(result);
        data = _getDataFromResult(result);
        meta = { limit, skip, filter, count }; 
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};

/**
 * @function
 * @name findOne
 * @description Функция-обработчик для получения одной запипси из БД
 *              по фильтру
 * @param   {string}         modelName имя модели
 * @param   {object}         filter    объект фильтров
 * @param   {object|string}  select    поля, которые будут содержаться в ответе
 * @param   {boolean}        lean      опция, которая "отрезает" методы модели
 * @returns {object|null}              найденный объект докуента или null
 * @exports
 * @async
 */
const findOne = async function(
    modelName, 
    filter=DEFAULT_FILTER, 
    select=DEFAULT_SELECT, 
    lean=DEFAULT_LEAN
) {
    const extFilter = _filterNotRemoved(filter);
    return await _findOne(this, modelName, extFilter, select, lean);
};


/**
 * @function
 * @name create
 * @description функция-обработчик, которая создаёт новый документ в коллекции
 * @param   {string} modelName имя модели
 * @param   {object} data      данные для сохраненя в БД
 * @returns {object}           новый документ
 * @public 
 */
const create = async function(modelName, toSave={}) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const model = _getModel(this.models, modelName);
        data = await new model(toSave).save();
        meta = {};
    } catch (error) {
        errors = [error];
    }
    return { data, meta, errors };
};

/**
 * @function
 * @name updateMany
 * @description функция-обработчик для оновления множества записей
 * @param   {string}    modelName   имя модели
 * @param   {object}    filter      объект фильтров
 * @param   {object}    update      объект с полями для обновления
 * @param   {boolean}   fullUpdate  обновление всего документа или только полей
 * @returns {Promise<object>}       результат обновления записей, подходящих под фильтр    
 * @exports
 * @async 
 */
const updateMany = async function(modelName, filter={}, update={}, fullUpdate=false) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const model = _getModel(this.models, modelName);
        const updateAction = fullUpdate ? { ...update } : { $set: { ...update} };
        data = await model.updateMany(filter, updateAction);
        meta = {};
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};

/**
 * @function
 * @name updateOne
 * @description функция-обработчик для обновления одной записи, подходящей под фильтр
 * @param   {string}    modelName   имя модели
 * @param   {object}    filter      объект фильтра
 * @param   {object}    update      объект с полями для обновления
 * @param   {boolean}   lean        опция, которая "отрезает" методы модели
 * @param   {boolean}   updated     опция, которая позволяет вернуть документ после/до обновления
 * @returns {Promise<object>}       обновленный документ
 * @exports
 * @async
 */
const updateOne = async function(modelName, filter=DEFAULT_FILTER, update={}, lean=false, updated=true) {
    const extFilter = _filterNotRemoved(filter);
    return await _updateOne(this, modelName, extFilter, update, lean, updated);
};

/**
 * @function
 * @name remove
 * @description Функция-обработчик, которая помечает документ к удалению
 * @param   {string}  modelName имя модели
 * @param   {string}  uuid      идентификатор документа
 * @returns {Promise<object>}   результат обновленя документы
 * @exports
 * @async
 */
const remove = async function(modelName, uuid) {
    const filter = _filterNotRemoved({ _id: mongoose.Types.ObjectId(uuid) });
    const update = { isRemoved: true };
    return await _updateOne(this, modelName, filter, update, false, true);
};

/**
 * @function
 * @name count
 * @description Функция-обработчик, которая считает количество документов
 *              в соответствии с моделью и фильтром не помеченные к удалению
 * @param   {string}    modelName имя модели
 * @param   {object}    filter    фильтр для запроса
 * @returns {Promise<number>}     количество найденны документов
 * @public 
 */
const count = async function(modelName, filter=DEFAULT_FILTER) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const extFilter = _filterNotRemoved(filter);
        data = await _count(this, modelName, extFilter);
        meta = { filter };
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};

/**
 * @function
 * @name countRemoved
 * @description Функця-обработчик, которая считает количество документво
 *              в соответствии с моделью и фильтром помеченные к удалению
 * @param   {string}    modelName   имя модели
 * @param   {object}    filter      объект фильтров
 * @returns {Promise<number>}       количество найденных документов    
 * @exports
 * @async 
 */
const countRemoved = async function(modelName, filter=DEFAULT_FILTER) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const extFilter = _filterRemoved(filter);
        data = await _count(modelName, extFilter);
        meta = { filter }; 
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
}

/**
 * @function
 * @name purgeOne
 * @description Функция-обработчик для удаления одного документа
 *              (по UUID) из базы данных
 * @param   {string}    modelName   имя модели
 * @param   {string}    uuid        идентификатор документа
 * @returns {Promise<object>}       результат выполения операции   
 * @exports
 * @async
 */
const purgeId = async function(modelName, uuid) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const model = _getModel(this.models, modelName);
        const filter = { _id: mongoose.Types.ObjectId(uuid) };
        data = await model.deleteOne(filter);
        meta = {};
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};

/**
 * @function
 * @name purgeIds
 * @description Функция-обработчик для удаления списка документов
 *              (по UUID) из базы данных
 * @param   {string}        modelName   имя модели 
 * @param   {Array<string>} uuids       список UUIDS
 * @returns {Promise<object>}           результат выполнения операции
 * @exports
 * @async 
 */
const purgeIds = async function(modelName, uuids=[]) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const model = _getModel(this.models, modelName);
        const filter = { 
            _id: {
                $in: uuids.map(uuid => mongoose.Types.ObjectId(uuid))
            }
        };
        data = await model.deleteMany(filter);
        meta = { filter };
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};


/**
 * @function
 * @name exist
 * @description Функция-обработчик, проверяет наличие в базе данных документов по флильтру
 * @param   {string}    modelName   имя модели
 * @param   {object}    filter      объект фильтров
 * @returns {Promise<object>}       результат проверки    
 * @exports
 * @async
 */
const exist = async function(modelName, filter=DEFAULT_FILTER) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const result = await count(modelName, filter);
        data = (result > 0) ? true : false;
        meta = { count, filter };
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};

/**
 * @function
 * @name findOneRemoved
 * @description Функция-обработчик для получения удалённого документа по фильтру
 * @param   {string}        modelName   имя модели
 * @param   {object}        filter      объект фильтров
 * @param   {object|string} select      возвращаемые пля
 * @param   {boolean}       lean        опция, которая "отрезает" методы модели
 * @returns {Promise<object|null>}      найденный документ 
 * @exports
 * @async
 */
const findOneRemoved = async function(
    modelName,
    filter=DEFAULT_FILTER,
    select=DEFAULT_SELECT,
    lean=DEFAULT_LEAN
) {
    let data = null;
    let errors = null;
    let meta = null;
    try {
        const model = _getModel(this.models, modelName);
        const extFilter = _filterRemoved(filter);
        const query = model.findOne(extFilter).select(select);
        data = lean ? await query.lean() : await query;
        meta = { filter }; 
    } catch (error) {
        errors = [error];
    }
    return { data, errors, meta };
};

/**
 * @function
 * @name findRemoved
 * @description Функция-обработчик для получения списка удалённых документов
 * @param {sting}      modelName        имя модели
 * @param {object}     filter           фильтр запроса к БД
 * @param {object}     select           фильтр полей
 * @param {number}     limit            количество для вывода
 * @param {number}     skip             количество для пропуска от начала
 * @param {Array<any>} sort             порядок сортировки
 * @param {boolean}    lean             опция, возвращающая чистые объекты
 * @returns {Promise<object>}           объект, содержащий список найденный записей и
 *                                      дополнительную количественную информацию
 * @exports
 * @async
 */
const findRemoved = async function(
    modelName,
    filter=DEFAULT_FILTER,
    select=DEFAULT_SELECT,
    limit=DEFAULT_LIMIT,
    skip=DEFAULT_SKIP,
    sort=DEFAULT_SORT,
    lean=DEFAULT_LEAD
) {
    const extFilter = _filterRemoved(filter);
    return await _find(this, modelName, extFilter, select, limit, skip, sort, lean);
};

/**
 * @function
 * @name paginateRemoved
 * @description Функция-обработчик для получения постраничного 
 *              списка удалённых документов
 * @param   {string}         modelName  имя модели 
 * @param   {object}         filter     объект фильтров
 * @param   {number}         page       синтетический номер страницы
 * @param   {string|object}  select     выбранные поля для получения
 * @param   {Array<any>}     sort       сортировка
 * @param   {boolean}        lean       опция, возвращающая чистые объекты
 * @param   {number}         perPage    количество документов на странице
 * @returns {Promise<Array<object>}     список документов
 * @exports
 * @async 
 */
const paginateRemoved = async function(
    modelName, 
    filter=DEFAULT_FILTER, 
    page=DEFAULT_PAGE, 
    select=DEFAULT_SELECT, 
    sort=DEFAULT_SORT, 
    lean=DEFAULT_LEAN, 
    perPage=DEFAULT_LIMIT
) {
    const extFilter = _filterRemoved(filter);
    return await _paginated(this, modelName, extFilter, page, select, sort, lean, perPage);
};

/**
 * @function
 * @name restore
 * @description Функция-обработчик для восстановления документа
 *              (присваивает isRemoved отрицательное значение)
 * @param   {string}    modelName   имя модели
 * @param   {string}    uuid        идентификатор документа
 * @returns {Promise<object>}       найденный документ
 * @exports
 * @async
 */
const restore = async function(modelName, uuid) {
    const filter = _filterRemoved({ _id: mongoose.Types.ObjectId(uuid) });
    const update = { isRemoved: false };
    return await _updateOne(this, modelName, filter, update, false, true);
};

/**
 * @function
 * @name paginate
 * @description Функция-обработчик для получения пагинированного списка
 * @param   {string}            modelName  имя модели
 * @param   {object}            filter      объект фильтров
 * @param   {number}            page        номер страницы
 * @param   {string|object}     select      возвращаемые поля
 * @param   {Array<any>}        sort        порядок сортировки
 * @param   {boolean}           lean        опция, возвращающая чистые объекты
 * @param   {number}            perPage     number
 * @returns {Promise<object>}   объеки, содержащий список документов, а так же доп. информацию
 * @exports
 * @async 
 */
const paginate = async function(
    modelName, 
    filter=DEFAULT_FILTER, 
    page=DEFAULT_PAGE, 
    select=DEFAULT_SELECT, 
    sort=DEFAULT_SORT, 
    lean=DEFAULT_LEAN, 
    perPage=DEFAULT_LIMIT
) {
    const extFilter = _filterNotRemoved(filter);
    return await _paginated(this, modelName, extFilter, page, select, sort, lean, perPage);
};

/**
 * Экспортируемые функции-обработчики, доступные в Foxy по-умолчанию:
 * - restore: снятие флага isRemoved
 * - findOneRemoved: получение одного удалённого документа по фильтру
 * - findRemoved: получение списка удалённых документов по фильтру
 * - paginateRemoved: получение постраничного списка помеченных к удалению документов по фильтрам
 * - create: создание нового документа
 * - remove: пометить документ к удалению по идентификатору
 * - updateOne: обновить один документ (по идентификатору)
 * - updateMany: обновить все документы, попадающие под фильтр
 * - count: получить количество документов с заданным фильтром
 * - findOne: получить один документ по фильтру
 * - find: получить список документов по заданному фильтру
 * - findById: получить документ по идентификатору
 * - findByIds: получить список документов по списку идетификаторов
 * - getModels: получить объект моделей
 * - getModel: получить модель по имени
 * - paginate: получить постраничный список документов по фильтру
 * - purgeId: удалить из БД документ, найденный по идетификатору
 * - purgeIds: удалить из БД документы, найденные по списку идетификаторов
 * - exist: проверить на существование документы, подпадающие под заданный фильтр
 * - countRemoved: получить список удалённых документов по заданному фильтру
 */
export const DEFAULT_ACTIONS = {
    restore,
    findOneRemoved,
    findRemoved,
    paginateRemoved,
    create,
    remove,
    updateOne,
    updateMany,
    count,
    findOne,
    find,
    findById,
    findByIds,
    getModels,
    getModel,
    paginate,
    purgeId,
    purgeIds,
    exist,
    countRemoved
};

/**
 * Пакеты, доступные в плагине Foxy по умолчанию
 * - mongoose: ODM для работы с MongoDB
 */
export const DEFAULT_PACKAGES = {
    mongoose
}