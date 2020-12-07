/**
 * Импортируем класс Plugin для расширения
 */
import { Plugin } from 'raccoon-sanctuary';
/**
 * Импортируем функцию подготовки опций родителя
 */
import { prepareSuperOptions } from './src/utils.mjs';
/**
 * Импортируем константы
 * - 
 * - 
 */
import {
    FIRST_INDEX, 
    CONNECTION_STRING
} from './src/constants.mjs';

/**
 * @class
 * @name Rabbit
 * @description Класс плагина подключения к RabbitMQ
 * @author Dmitrii Shevelev
 * @extend Plugin
 */
export default class Rabbit extends Plugin {

    /** Приватное свойство строки соединения */
    #connectionString
    
    /** Приватное свойство соединения */
    #connection

    #channels

    /**
     * Гетер для соединеня с сервером RabbitMQ
     * 
     * 
     * @name connection
     * @memberof Rabbit
     * @returns {object|undefined}
     */
    get connection() {
        return this.#connection;
    }

    /**
     * Сеттер для соедиения с сервером RabbitMQ
     * 
     * 
     * @name connection
     * @param   {object|undefined}  value   объект соединения
     * @returns {void}
     * @memberof Rabbit
     */
    set connection(value) {
        this.#connection = value;
    }

    /**
     * Гетер для списка каналов
     * 
     * 
     * @readonly
     * @name channels
     * @returns {Array<object>}
     * @memberof Rabbit
     */
    get channels() {
        return this.#channels;
    }

    /**
     * Метод возвращает канал по идентификатору
     * 
     * 
     * @method getChannel
     * @param   {number} channel_id идентификатор канала
     * @returns {object|undefined}  объект канала
     * @memberof Rabbit
     * @public
     */
    getChannel(channel_id) {
        let channel;
        if (channel_id) {
            const filtered_channels = this.channels.filter(channel => channel.ch === channel_id);
            channel = filtered_channels[FIRST_INDEX];
        } else if (!channel_id && this.channels.length) {
            channel = this.channels[FIRST_INDEX];
        } else {
            channel = undefined;
        }
        return channel;
    }

    /**
     * Метод удаляет ссылку не используемого соединения
     * 
     * 
     * @method clearConnection
     * @memberof Rabbit
     * @returns {void}
     * @public
     */
    clearConnection() {
        if (this.connection) {
            this.#connection = undefined;
        }
    }

    /**
     * Метод добавления канала к списку каналов
     * 
     * 
     * @method pushChannel
     * @param   {object} value
     * @returns {void}
     * @memberof Rabbit
     * @public 
     */
    pushChannel(value) {
        if (value) {
            this.#channels.push(value);
        }
    }

    /**
     * Гетер, который позволяет получить соединение с RabbitMQ
     * 
     * 
     * @name connection
     * @returns {Object} объект соединения
     * @memberof Rabbit
     */
    get connection() {
        return this.#connection;
    }

    /**
     * Гетер, который возвращает строку для соединения
     * 
     * 
     * @name connectionString
     * @returns {String} строка соединеня
     * @memberof Rabbit
     */
    get connectionString() {
        return this.#connectionString;
    }

    /**
     * Метод для подготовки свойств экземпляра класса
     * 
     * 
     * @param   {object} options объект опций плагина
     * @returns {void}
     * @memberof Rabbit
     * @private 
     */
    #prepareInstanceOptions(options) {
        this.#connectionString = options?.connectionString
            ? options.connectionString
            : CONNECTION_STRING;
        this.#channels = [];
    }

    /**
     * Конструктор объекта плагина
     * 
     * 
     * @constructor
     * @param {Object} options объект опций плагина
     * @memberof Rabbit 
     */
    constructor(options) {
        const superOptions = prepareSuperOptions(options);
        super(superOptions);
        this.#prepareInstanceOptions(options);
    }
}