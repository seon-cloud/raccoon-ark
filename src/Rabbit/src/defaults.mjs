import amqplib from 'amqplib';

export const DEFAULT_PACKAGES = { amqplib };

const connect = async function() {
    try {
        this.connection = this.connectionString 
            ? await amqplib.connect(this.connectionString)
            : undefined;
         
        return this.connection;
    } catch (error) {
        throw error;
    }
};

const createChannel = async function() {
    try {
        const channel = (this.connection) 
            ? await this.connection.createChannel()
            : undefined;
            this.pushChannel(channel);
        return channel;
    } catch (error) {
        throw error;
    }  
};

const close = async function() {
    try {
        if (this.connection) {
            await this.connection.close();
            this.clearConnection();
            
        }
        return this.connection;
    } catch (error) {
        throw error;
    }
};

const publisher = function(queue_name, data, channel_id) {
    try {
        const channel = this.getChannel(channel_id);
        if (channel && queue_name) {
            return channel.assertQueue(queue_name)
                .then(ok => {
                    return channel.sendToQueue(queue_name, Buffer.from(data));
                });
        } else {
            return undefined;
        }
    } catch (error) {
        throw error;
    }
};

const consumer = function(queue_name, callback, channel_id) {
    try {
        const channel = this.getChannel(channel_id);
        if (channel && queue_name) {
            return channel
                .assertQueue(queue_name)
                    .then(ok => {
                        return channel.consume(queue_name, msg => {
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
};


export const DEFAULT_ACTIONS = {
    connect,
    createChannel,
    close,
    consumer,
    publisher
};