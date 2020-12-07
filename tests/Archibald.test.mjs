import Archibald from '../src/Archibald/index.mjs';
import avaspec from 'ava-spec';

const { describe } = avaspec;
const PLUGIN_NAME = 'ArchibaldTest';
const DEFAULT_PLUGIN_NAME = 'Archibald';
const TEST_ACTION_RESULT = 'test';
const ACTIONS = {
    test() {
        return TEST_ACTION_RESULT;
    }
};

const DEFAULT_ACTIONS_LIST = [
    'healthCheck',
    'compileFile',
    'compiledFunction',
    'renderFile',
    'render'
];

const RENDER_RESULT = '<p>Test';
const RENDER_RESULT_WITH_DATA = `<p>Test ${PLUGIN_NAME}`

const TEST_DATA = { name: PLUGIN_NAME };

import path from 'path';
// Собираем путь до папки со статкой
const TEMPLATE_FILE = path.join(process.cwd(), 'tests/files/example.pug');
const TEMPLATE_FILE_WITH_DATA = path.join(process.cwd(), 'tests/files/exampleWithData.pug');

describe('[ЗАГРУЗКА] Archibald', it => {
    it('<ИЗ ФАЙЛА КЛАССА> Тестирование структуры загруженного модуля', test => {
        test.not(Archibald, undefined);
    });
});

describe('[ФУНКЦИОНАЛЬНОСТЬ#1] Archibald', it => {
    it('<ПРОВЕРКА СОЗДАНИЯ ОБЪЕТА#1> Создание объекта без передачи опций', test => {
        const archibald = new Archibald();
        test.is(archibald.name, DEFAULT_PLUGIN_NAME);
    });

    it('<ПРОВЕРКА СОЗДАНИЯ ОБЪЕТА#2> Создание объекта с передачей опций Spirit', test => {
        const archibald = new Archibald({ name: PLUGIN_NAME });
        test.is(archibald.name, PLUGIN_NAME);
    });

    it('<ПРОВЕРКА СОЗДАНИЯ ОБЪЕТА#3> Проверка наличия стандартных опций', test => {
        const archibald = new Archibald({ name: PLUGIN_NAME });
        const actionsName = Object.keys(archibald.actions);
        test.deepEqual(actionsName, DEFAULT_ACTIONS_LIST);
    });
});

describe('[ФУНКЦИОНАЛЬНОСТЬ#2] Archibald', it => {
    it('<ПЕРЕДАЧА СЕЦИФИЧЕСКИХ ОПЦИЙ#1> Создание объекта для файла', test => {
        const options = { 
            templates: { 
                test: TEMPLATE_FILE 
            }
        }; 
        const archibald = new Archibald(options);
        const template = archibald.templates.test;
        test.is(template, TEMPLATE_FILE);
    });

    it('<ПЕРЕДАЧА СЕЦИФИЧЕСКИХ ОПЦИЙ#2> Проброс опций шаблона', test => {
        const options = { 
            templates: { 
                test: TEMPLATE_FILE 
            }
        }; 
        const archibald = new Archibald(options);
        const template = archibald.templates.test;
        test.is(template, TEMPLATE_FILE);
    });
});

describe('[ФУНКЦИОНАЛЬНОСТЬ#3] Archibald', it => {
    it('<ПРОВЕРКА ACTIONS#1> Получаение healthCheck', test => {
        const archibald = new Archibald();
        const result = archibald.actions.healthCheck();
        test.true(result);      
    });

    it('<ПРОВЕРКА ACTIONS#2> Получаение render без данных', test => {
        const archibald = new Archibald({
            templates: {
                test: TEMPLATE_FILE
            }
        });
        const result = archibald.actions.render('test');
        test.is(result, RENDER_RESULT);
    });

    it('<ПРОВЕРКА ACTIONS#3> Получаение render с данными', test => {
        const archibald = new Archibald({
            templates: {
                test: TEMPLATE_FILE_WITH_DATA
            }
        });
        const result = archibald.actions.render('test', TEST_DATA);
        test.is(result, RENDER_RESULT_WITH_DATA);
    });

    it('<ПРОВЕРКА ACTIONS#4> Получаение renderFile без данных', test => {
        const archibald = new Archibald();
        const result = archibald.actions.renderFile(TEMPLATE_FILE);
        test.is(result, RENDER_RESULT);
    });

    it('<ПРОВЕРКА ACTIONS#5> Получаение renderFile с данными', test => {
        const archibald = new Archibald();
        const result = archibald.actions.renderFile(TEMPLATE_FILE_WITH_DATA, TEST_DATA);
        test.is(result, RENDER_RESULT_WITH_DATA);
    });

    it('<ПРОВЕРКА ACTIONS#6> Получаение compiledFunction без данных', test => {
        const archibald = new Archibald({
            templates: {
                test: TEMPLATE_FILE
            }
        });
        const result = archibald.actions.compiledFunction('test');
        test.is(result, RENDER_RESULT);
    });

    it('<ПРОВЕРКА ACTIONS#7> Получаение compiledFunction с данными', test => {
        const archibald = new Archibald({
            templates: {
                test: TEMPLATE_FILE_WITH_DATA
            }
        });
        const result = archibald.actions.compiledFunction('test', TEST_DATA);
        test.is(result, RENDER_RESULT_WITH_DATA);
    });

    it('<ПРОВЕРКА ACTIONS#8> Проверка compileFile', test => {
        const archibald = new Archibald();
        const template = archibald.actions.compileFile(TEMPLATE_FILE_WITH_DATA);
        if (typeof template === 'function') {
            const result = template(TEST_DATA);
            test.is(result, RENDER_RESULT_WITH_DATA);
        } else {
            test.fail();
        }
    });

    it('<ПРОВЕРКА ACTIONS#8> Пользовательские actions', test => {
        const archibald = new Archibald({
            actions: ACTIONS
        });
        const result = archibald.actions.test();
        test.is(result, TEST_ACTION_RESULT);
    });
});