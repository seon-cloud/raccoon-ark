import mongoose from 'mongoose';

const _getModel = function(models, modelName) {
    const model = models.hasOwnProperty(modelName) 
        ? models[modelName]
        : undefined;
    if (model) {
        return model;
    } else {
        throw new Error(`Не получается найти модель с именем ${modelName}`);
    }
}

const getModels = function() {
    return this.models;
}

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
}

const find = async function(modelName, filter = {}, limit=10, offset=0, sort=undefined) {
    try {
        const model = _getModel(this.models, modelName);
        return sort 
            ? await model.find(filter).limit(limit).offset(offset).sort(sort) 
            : await model.find(filter).limit(limit).offset(offset);
    } catch (error) {
        throw error;
    }
};


const getOne = async function(modelName, filter = {}, select = "???", lean = false) {
    try {
        const model = _getModel(this.models, modelName);
        return await model.findOne(filter).exec();
    } catch (error) {
            throw error;
    }
};

const create = async function(modelName, data) {
    try {
        const model = _getModel(this.models, modelName);
        if (data) {
            const doc = new model(data);
            return await doc.save();
        } else {
            throw new Error('Не переданы данные для сохраненя');
        }
    } catch (error) {
        throw error;
    }
};

const updateOne = function(modelName, toUpdate) {
    try {
        const model = _getModel(this.models, modelName);
    } catch (erro) {
        throw error;
    }
};

const remove = function(modelName, filter) {
    try {
        const model = _getModel(this.models, toUpdate);
    } catch (error) {
        throw error;
    }
};

const count = function() {
    try {
        const model = _getModel(this.models, toUpdate);
    } catch (error) {
        throw error;
    }
};

const purge = function() {};

const update = function() {};

const exist = function() {};

const getById = function() {};

const getByIds = function() {};

const getDeleted = function() {};

const findDeleted = function() {};

const paginateDeleted = function() {};

const restore = function() {};

const paginate = function() {};

const distinct = function() {};

export const DEFAULT_ACTIONS = {
    distinct,
    restore,
    getDeleted,
    findDeleted,
    paginateDeleted,
    create,
    remove,
    updateOne,
    count,
    getOne,
    getById,
    getByIds,
    find,
    getModels,
    getModel,
    paginate,
    purge,
    update,
    exist
};

export const DEFAULT_PACKAGES = {
    mongoose
}