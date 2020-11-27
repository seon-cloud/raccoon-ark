import ArchibaldClass from './src/Archibald/index.mjs';
import ConsoleLoggerClass from './src/ConsoleLogger/index.mjs';
import PistachioClass from './src/Pistachio/index.mjs';
import RabbitClass from './src/Rabbit/index.mjs';
import FoxyClass from './src/Foxy/index.mjs';
import mongoose from 'mongoose';
import PinocoladaClass from './src/Pinocolada/index.mjs';

export const Archibald = ArchibaldClass;
export const ConsoleLogger = ConsoleLoggerClass;
export const Pistachio = PistachioClass;
export const Rabbit = RabbitClass;
export const Pinocolada = PinocoladaClass;


export const Foxy = {
    plugin: FoxyClass,
    Schema: mongoose.Schema,
    Types: mongoose.Types
};
