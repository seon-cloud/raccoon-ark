import { Plugin } from 'raccoon-sanctuary';
import { prepareSuperOptions } from './src/utils.mjs';


import mongoose from 'mongoose';

/**
 * @class
 * @name Foxy
 * @description Класс плагиня для Mongoose
 * @extends Plugin
 * @author small-entropy
 * @exports
 */
export default class Foxy extends Plugin {

    /** Совойство содержит соединение с MongoDB */
    #connection

    /** Свойство содержит множество схем,
     * которые зарегистрированны в Moongoose */
    #schemas = new Set()

    /** Свойство содержит множество моделей,
     * которые зарегистрированны в Mongoose */
    #models = new Set()

    #connected

    get connected() {
        return this.#connected;
    }

    /**
     * @name models
     * @description Гетер для моделей, зарегистрированных в Mongoose.
     *              Возвращает объект со всеми моделями
     * @returns {object} объект моделей Mongoose
     * @memberof Foxy
     */
    get models() {
        const models = {};
        this.#models.forEach(element => {
            models[element.name] = element.model;
        });
        return models;
    }

    /**
     * @method
     * @name registerSchemas
     * @description Метод, который регистрирует схемы в Mongoose
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
     * @method
     * @name registerModels
     * @description Метод, который регистрирует модели в Mongoose
     * @returns {void}
     * @memberof Foxy
     * @private
     */
    #registerModels() {
        this.#schemas.forEach(element => {
            if (element?.name && element?.schema) {
                this.#models.add({ 
                    name: element?.name,
                    model: this.#connection.model(element.name, element.schema)
                });
            }
        });
    }

    /**
     * @method
     * @name connect
     * @description Функция, которая сначала устанавливает соединене с MongoDB,
     *              потом регистрирует схемы и модели в Mongoose
     * @param {string} connectionUrl ссылка для соединения с MongoDB
     * @param {object} connectionOptions объект опций соединения с MongoDB
     * @param {object} schemas объект опций со схемами по которым требуется зарегистрировать модели
     * @returns {void}
     * @memberof Foxy
     * @private
     */
    #connect(connectionUrl, connectionOptions = {}, schemas = {}) {
        return new Promise((resolve, reject) => {
            try {
                const options = { 
                    ...connectionOptions,
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                };

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
     * @constructor
     * @description Конструктор объекта плагина. Важно - внутри конструктора есть асинхронные операции!
     *              Требуется дождаться инициализации моделей, для того, чтобы использовать плагин
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
