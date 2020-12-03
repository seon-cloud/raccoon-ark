/** Импортируем библиотеку базовых классов
 * Plugin - класс плагинов Raccoon */
import { Plugin } from 'raccoon-sanctuary';
/** Импортируем утилиты плагина Archibald
 * prepareSuperOptions - функция подготовки объекта опций 
 *                       для инициализации родителя*/
import  { prepareSuperOptions } from './src/utils.mjs';

/** Импортируем значеня по умолчанию.
 * DEFAULT_TEMPLATES_VALUE - значение по умолчанию для свойства шаблонов */
import { DEFAULT_TEMPLATES_VALUE } from './src/defaults.mjs';


/**
 * Класс для работы с шаблонизатором Pug
 *
 * @export
 * @class Archibald
 * @extends {Plugin}
 * @author small-entropy
 */
export default class Archibald extends Plugin {

    /** 
     * Свойство, содержащее объект с шаблонами 
     * 
     * @type {object}
     * @memberof Archibald
     */
    #templates
    
    /**
     * Свойство, содержащее объект откомпилированных шаблонов
     * 
     * @type {object}
     * @memberof Archibald
     */
    #compiled

    /**
     * Гетер объекта с шаблонами
     * 
     * @readonly
     * @returns {object}
     * @memberof Archibald
     */
    get templates() {
        return this.#templates;
    }

    /**
     * Гетер объекта откомпилированных шаблонов
     * 
     * @readonly
     * @returns {object}
     * @memberof Archibald
     */    
    get compiled() {
        return this.#compiled;
    }
    
    /**
     * Приватный метод подготовки 
     * 
     * @param {object} options опции, переданные в качесвте параметров конструктора
     * @returns {void}
     * @memberof Archibald
     * @private 
     */
    #prepareInstanceProperty(options) {
        /**  Наполняем объект шаблонов.
         * Если в опциях у нас присутствие свойство templates - заполняем им свойство объекта.
         * Если в опция у нас отсутствует свойство templates берём значение по умолчанию*/
        this.#templates = (options?.templates)
            ? options.templates
            : DEFAULT_TEMPLATES_VALUE;
        
        this.#compiled = {};

        let filepath;
        Object.keys(this.#templates).forEach(name => {
            filepath = this.#templates[name];
            if (filepath) {
                this.#compiled[name] = this.actions.compileFile(filepath);
            }
        });
    }

    /**
     * Конструктор класса Archibald
     * 
     * @param {object} options объект опция для сброки экземпляра плагина
     */
    constructor(options) {
        const superOptions = prepareSuperOptions(options);
        super(superOptions);
        this.#prepareInstanceProperty(options);
    }
}

const Archi = new Archibald