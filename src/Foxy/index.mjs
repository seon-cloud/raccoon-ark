/** 
 * Импортируем базовый класс Plugin для наследования Foxy
 */
import { Plugin } from 'raccoon-sanctuary';
/** 
 * Импортируем функция подготовки опций родителя
 */
import { prepareSuperOptions } from './src/utils.mjs';

/**
 * Импортируем ODM для работы с MongoDB
 */
import mongoose from 'mongoose';

/**
 * Класс плагиня для Mongoose
 * 
 * 
 * @class Foxy
 * @extends Plugin
 * @author small-entropy
 * @exports
 */
export default class Foxy extends Plugin {

    /**
     * Совойство содержит соединение с MongoDB
     * 
     * 
     * @name #connection
     * @type {object}
     * @memberof Foxy
     * @private
     */
    #connection

    /** 
     * Свойство содержит множество схем, которые зарегистрированны в Moongoose
     * 
     * 
     * @name #schemas  
     * @type {Set}
     * @memberof Foxy
     * @private
     */
    #schemas = new Set()

    /** 
     * Свойство содержит множество моделей, которые зарегистрированны в Mongoose
     * 
     * 
     * @name #models
     * @type {Set}
     * @memberof Foxy
     * @private
     */
    #models = new Set()

    /**
     * Свойство, содержащее результат вызова функции #connect
     * 
     * @name #connected
     * @memberof Foxy
     * @type {Promise<boolean>|boolean}
     * @private
     */
    #connected

    /**
     * Гетер состояния соединеня с СУБД MongoDB
     * 
     * 
     * @returns {Promise<boolean>|boolean} текущее состояние соединеня. Возвращает 
     *                                     или обещание, или текущее состояние
     * @memberof Foxy
     * @readonly
     */
    get connected() {
        return this.#connected;
    }

    /**
     * Гетер для моделей, зарегистрированных в Mongoose. Возвращает объект 
     * со всеми моделями
     * 
     * 
     * @returns {object} объект моделей Mongoose
     * @memberof Foxy
     * @readonly
     */
    get models() {
        const models = {};
        this.#models.forEach(element => {
            models[element.name] = element.model;
        });
        return models;
    }

    /**
     * Метод, который регистрирует схемы в Mongoose
     * 
     * 
     * @method registerSchemas
     * @param {object} schemas объект опций схем Mongoose
     * @returns {void}
     * @memberof Foxy
     * @private
     */
    #registerSchemas(schemas) {
        Object.keys(schemas).forEach(name => {
            this.#schemas.add({ name, schema: schemas[name] });
        });
    }

    /**
     * Метод, который регистрирует модели в Mongoose
     * 
     * 
     * @method registerModels
     * @returns {void}
     * @memberof Foxy
     * @private
     */
    #registerModels() {
        /** Инициализируем пустые переменные */
        let model, name;
        /** Перебираем схемы для последующей регистрации */
        this.#schemas.forEach(element => {
            if (element?.name && element?.schema) {
                model = this.#connection.model(element.name, element.schema);
                /** Добавляем поля по умолчанию во все схемы:
                 * - isRemoved: помечен к удалению
                 * - created: дата и время создания
                 * - removed: дата и время удаления */
                model.schema.add({
                    isRemoved: {
                        type: Boolean,
                        default: false
                    },
                    created: {
                        type: Date,
                        default: Date.now
                    },
                    removed: Date
                });
                name = element.name;
                this.#models.add({ name, model });
            }
        });
    }

    /**
     * Функция, которая сначала устанавливает соединене с MongoDB, потом 
     * регистрирует схемы и модели в Mongoose
     * 
     * 
     * @param {string} connectionUrl ссылка для соединения с MongoDB
     * @param {object} connectionOptions объект опций соединения с MongoDB
     * @param {object} schemas объект опций со схемами по которым требуется зарегистрировать модели
     * @returns {Promise<boolean>}
     * @memberof Foxy
     * @private
     */
    #connect(connectionUrl, connectionOptions = {}, schemas = {}) {
        return new Promise((resolve, reject) => {
            try {
                /** Собираем объект опций  для соединения
                 * с MongoDB через Mongoose через деструктор
                 * объекта и примешиваем */
                const options = { 
                    ...connectionOptions,
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                };
                
                /** Вызываем опцию connect, после удачного соединения
                 * вызываем методы, котрые регистрируют схему (registerSchemas)
                 * и модели (registerModels), а так же присваиваем
                 * новое состояние для свойства connected
                 */
                mongoose.connect(connectionUrl, options)
                    .then(connection => {
                        this.#connection  = connection;
                        if (this.#connection) {
                            this.#registerSchemas(schemas);
                            this.#registerModels();
                            this.#connected = true;
                            resolve(true);
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Конструктор объекта плагина. Важно - внутри конструктора есть асинхронные операции!
     * Требуется дождаться инициализации моделей, для того, чтобы использовать плагин
     * 
     * 
     * @param {object} options опции объекта
     * @memberof Foxy
     * @public 
     */
    constructor(options) {
        const superOptions = prepareSuperOptions(options);
        super(superOptions);

        const { connectionUrl, connectionOptions, schemas } = options;
        try {
            this.#connected = this.#connect(connectionUrl, connectionOptions, schemas);
        } catch (error) {
            throw error;
        }

    }
}
