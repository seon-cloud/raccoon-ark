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
 * @class
 * @name Archibald
 * @description Плагин-обёртка для пакета Pug
 * @author Dmitrii Shevelev<igrave1988@gmail.com>
 * @extends Plugin
 */
export default class Archibald extends Plugin {

    /** Объект с ключами шаблонов*/
    #templates
    
    /** Откомпилированные через Pug шаблоны */
    #compiled

    /**
     * @name templates
     * @description Гетер объекта с шаблонами
     * @memberof Archibald
     * @public
     */
    get templates() {
        return this.#templates;
    }

    /**
     * @name compiled
     * @description Гетер откомпилированных функций шаблонов
     * @memberof Archibald
     * @public
     */
    get compiled() {
        return this.#compiled;
    }

    /**
     * @method
     * @name prepareInstanceProperty
     * @description Метод подготовки свойство экземпляра класса
     * @param {object} options опции для создания
     * @returns {void}
     * @memberof Archibald
     * @private
     */
    #prepareInstanceProperty(options) {
        this.#templates = options?.templates
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
     * @constructor
     * @description Конструктор экземпляра класс
     * @param {object} options опции для сборки экземпляра класса
     * @memberof Archibald
     * @public
     */
    constructor(options) {
        const superOptions = prepareSuperOptions(options);
        super(superOptions);
        this.#prepareInstanceProperty(options);
    }
}
