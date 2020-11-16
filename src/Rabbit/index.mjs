import { Plugin } from 'raccoon-sanctuary';
import amqplib from 'amqplib';

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

    #channels = []

    /** Свойство класса, статическое. Содержит колбеки для действий */
    static pluginActions = {
        connect: async function() {
            try {
                if (this.connectionString) {
                    this.#connection = await amqplib.connect(this.connectionString);
                    return this.#connection;
                } else {
                    return undefined;
                }
            } catch (error) {
                throw error;
            }
        },
        createChannel: async function () {
            try {
                if (this.connection) {
                    const channel = await this.#connection.createChannel();
                    if (channel) {
                        this.#channels.push(channel);
                    }
                    return channel;
                } else {
                    return undefined;
                }
            } catch (error) {
                throw error;
            }
        },
        close: async function() {
            try {
                if (this.connection) {
                    await this.#connection.close();
                    this.#connection = undefined;
                    return this.connection;
                } else {
                    return undefined;
                }
            } catch (error) {
                throw error;
            }
        },
        publisher: function(queue_name, data, channel_id) {
            try {
                const channel = this.#getChannelForWork(channel_id);
                if (channel && queue_name) {
                    return channel
                    .assertQueue(queue_name)
                        .then(ok => {
                            return channel.sendToQueue(queue_name, Buffer.from(data));
                        });
                } else {
                    return undefined;
                }
            } catch (error) {
                throw error;
            }
        },
        consumer: function(queue_name, callback, channel_id) {
            try {
                const channel = this.#getChannelForWork(channel_id);
                if (channel && queue_name) {
                    return channel
                        .assertQueue(queue_name)
                            .then(ok => {
                                return channel
                                    .consume(queue_name, msg => {
                                        if (msg) {
                                            
                                            callback(this, msg);
                                            channel.ack(msg);
                                        }
                                    });
                            });
                } else {
                    return undefined;
                }
            } catch (error) {
                throw error;
            }
        }
    }

    #getChannelForWork(channel_id) {
        let channel;
        const first_channel_index = 0;
        if (channel_id) {
            const filtered_channels = this.channels.filter(channel => channel.ch === channel_id);
            channel = filtered_channels[0];
        } else if (!channel_id && this.channels.length) {
            channel = this.channels[first_channel_index];
        } else {
            channel = undefined;
        }
        return channel;
    }

    /**
     * @method
     * @name connection
     * @description Гетер, который позволяет получить соединение с RabbitMQ
     * @returns {Object} объект соединения
     * @memberof Rabbit
     */
    get connection() {
        return this.#connection;
    }

    /**
     * @method
     * @name connectionString
     * @description Гетер, который возвращает строку для соединения
     * @returns {String} строка соединеня
     * @memberof Rabbit
     */
    get connectionString() {
        return this.#connectionString;
    }

    get channels() {
        return this.#channels;
    }

    /**
     * @constructor
     * @description
     * @param {Object} options
     * @memberof Rabbit 
     */
    constructor(options) {
        const name = 'rabbit';
        const actions = options?.actions 
            ? { ...options.actions, ...Rabbit.pluginActions }
            : Rabbit.pluginActions ;

        const packages = { amqplib };

        const ext_options = { ...options, name, packages, actions };
        
        super(ext_options);

        this.#connectionString = options?.connectionString
            ?  options.connectionString
            : 'amqp://guest:guest@localhost:5672/';
    }
}