import test from 'ava';
import Foxy from '../src/Foxy/index.mjs';
import mongoose from 'mongoose';

test('[Из файла] Импорт из .mjs', t => {
    t.not(Foxy, undefined);
});

const TEST_CONNECTION_URL = 'mongodb://localhost:27017/test';

test('[Соединение с СУБД #1] Установка соединеня с MongoDB', async t => {
    const foxy = new Foxy({ 
        connectionUrl: TEST_CONNECTION_URL
    });
    const connected = await foxy.connected;
    t.true(connected);
});