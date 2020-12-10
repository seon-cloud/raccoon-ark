import Archibald from '../src/Archibald/index.mjs';
import test from 'ava';

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

test('[Из файла] Импорт из .mjs', t => {
    t.not(Archibald, undefined);
});

test('[Создание объекта #1] Создание объекта без передачи опций', t => {
    const archibald = new Archibald();
    t.is(archibald.name, DEFAULT_PLUGIN_NAME);
});

test('[Создание объекта #2] Создание объекта с передачей опций Spirit', t => {
    const archibald = new Archibald({ name: PLUGIN_NAME });
    t.is(archibald.name, PLUGIN_NAME);
});

test('[Создание объекта #3] Проверка наличия стандартных опций', t => {
    const archibald = new Archibald({ name: PLUGIN_NAME });
    const actionsName = Object.keys(archibald.actions);
    t.deepEqual(actionsName, DEFAULT_ACTIONS_LIST);
});

test('[Передача опций #1] Создание объекта для файла', t => {
    const options = { 
        templates: { 
            test: TEMPLATE_FILE 
        }
    }; 
    const archibald = new Archibald(options);
    const template = archibald.templates.test;
    t.is(template, TEMPLATE_FILE);
});

test('[Передача опций #2] Проброс опций шаблона', t => {
    const options = { 
        templates: { 
            test: TEMPLATE_FILE 
        }
    }; 
    const archibald = new Archibald(options);
    const template = archibald.templates.test;
    t.is(template, TEMPLATE_FILE);
});

test('[Проверка actions #1] Получаение healthCheck', t => {
    const archibald = new Archibald();
    const result = archibald.actions.healthCheck();
    t.true(result);      
});

test('[Проверка actions #2] Получаение render без данных', t => {
    const archibald = new Archibald({
        templates: {
            test: TEMPLATE_FILE
        }
    });
    const result = archibald.actions.render('test');
    t.is(result, RENDER_RESULT);
});

test('[Проверка actions #3] Получаение render с данными', t => {
    const archibald = new Archibald({
        templates: {
            test: TEMPLATE_FILE_WITH_DATA
        }
    });
    const result = archibald.actions.render('test', TEST_DATA);
    t.is(result, RENDER_RESULT_WITH_DATA);
});

test('[Проверка actions #4] Получаение renderFile без данных', t => {
    const archibald = new Archibald();
    const result = archibald.actions.renderFile(TEMPLATE_FILE);
    t.is(result, RENDER_RESULT);
});

test('[Проверка actions #5] Получаение renderFile с данными', t => {
    const archibald = new Archibald();
    const result = archibald.actions.renderFile(TEMPLATE_FILE_WITH_DATA, TEST_DATA);
    t.is(result, RENDER_RESULT_WITH_DATA);
});

test('[Проверка actions #6] Получаение compiledFunction без данных', t => {
    const archibald = new Archibald({
        templates: {
            test: TEMPLATE_FILE
        }
    });
    const result = archibald.actions.compiledFunction('test');
    t.is(result, RENDER_RESULT);
});

test('[Проверка actions #7] Получаение compiledFunction с данными', t => {
    const archibald = new Archibald({
        templates: {
            test: TEMPLATE_FILE_WITH_DATA
        }
    });
    const result = archibald.actions.compiledFunction('test', TEST_DATA);
    t.is(result, RENDER_RESULT_WITH_DATA);
});

test('[Проверка actions #8] Проверка compileFile', t => {
    const archibald = new Archibald();
    const template = archibald.actions.compileFile(TEMPLATE_FILE_WITH_DATA);
    if (typeof template === 'function') {
        const result = template(TEST_DATA);
        t.is(result, RENDER_RESULT_WITH_DATA);
    } else {
        t.fail();
    }
});

test('[Проверка actions #8] Пользовательские actions', t => {
    const archibald = new Archibald({
        actions: ACTIONS
    });
    const result = archibald.actions.test();
    t.is(result, TEST_ACTION_RESULT);
});
