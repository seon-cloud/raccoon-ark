import { Plugin } from 'raccoon-sanctuary';
/** Импортируем утилиты плагина Pinocolada
 * prepareSuperOptions - функция подготовки объекта опций 
 *                       для инициализации родителя*/
import  { prepareSuperOptions } from './utils.mjs';
import { DEFAULT_DESTINATION } from './constants.mjs';

/**
 * @ class
 * @ name Pinocolada
 * @ description Простейшая реализация плагина логирования
 * @ author Alisa Pervenenok
 * @ extends Plugin
 */
 export default class Pinocolada extends Plugin {

    #destination
    /**
     * @name destination
     * @description
     * @returns {object}
     * @memberof Pinocolada
     * @public
     */
    get destination(){
        if (this.#destination === 'file') {
            return DEFAULT_DESTINATION;
        }
    }

    /**
     * @method
     * @name prepareInstanceProperty
     * @description Метод подготовки свойств экземпляра класса
     * @param {object} options опции для создания
     * @returns {void}
     * @memberof Pinocolada
     * @private
     */
    #prepareInstanceProperty(options) {
        this.#destination = options?.destination
            ? options.destination
            : DEFAULT_DESTINATION;
    }


    /**
     * @constructor
     * @description конструктор объекта Pinocolada.
     * @param {object} options опции для инициализации объекта с нужными свойтвами
     * @memberof Pinocolada 
     */
    constructor(options) {
        const parentOptions = prepareSuperOptions(options);

        /** Инициализируем  класс плагина (родительский) с опциями:
         * name - имя плагина
         * actions - действия плагина (его API)
         * packages - пакеты плагина
         */
        super(parentOptions);
        /** Вызываем функцию, которая обогащает экземпляр данными */
        this.#prepareInstanceProperty(options); 
    }
}
