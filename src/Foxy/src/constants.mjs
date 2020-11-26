/** Имя плагина по умолчанию */
export const NAME = 'Foxy';
/** Количество запрашиваемых документов по-умолчанию */
export const DEFAULT_LIMIT = 10;
/** Количество документов, которые надо пропустить по-умолчанию */
export const DEFAULT_SKIP = 0;
/** Сортировка по-умолчанию */
export const DEFAULT_SORT = undefined;
/** Объект фильтров по-умолчанию */
export const DEFAULT_FILTER = {};
/** Не возвращать по умолчанию чистый объект, а не документ*/
export const DEFAULT_LEAN = false;
/** Выбранные поля по умолчанию (пустой объект - возвращает все) */
export const DEFAULT_SELECT = {};
/** Значение для свойства помеченного к удаленю объекта */
export const IS_REMOVED = true;
/** Значение для свойства фильтра, не помеченного к удаленю объекта */
export const IS_NOT_REMOVED = { $ne: true }; 
/** Номер страницы по-умолчанию */
export const DEFAULT_PAGE = 1;
/** Номер шага страницы по-умолчанию  */
export const DEFAULT_PAGE_STEP = 1;
/** Индекс списка в списке запросов */
export const INDEX_LIST = 0;
/** Индекс количества в списке запросов */
export const INDEX_COUNT = 1;