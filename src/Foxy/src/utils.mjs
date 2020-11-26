import { NAME } from './constants.mjs';
import { Utils } from 'raccoon-sanctuary';
import {
    DEFAULT_ACTIONS,
    DEFAULT_PACKAGES
 } from './defaults.mjs';

export const prepareSuperOptions = options => {
    const actions = Utils.getExtandedActions(options, DEFAULT_ACTIONS);
    const packages = Utils.getExtendedPackages(options, DEFAULT_PACKAGES);
    const name = options?.name ? options.name : NAME; 
    return { name, actions, packages };
}