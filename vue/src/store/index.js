import { createStore } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import { toCamelCase } from "../js/util"

import store from "@/assets/store.json";

const VALUE_FACTORY = {
    'array': (d) => Array.isArray(d) ? [...d] : [],
    'object': (d) => (d !== null && typeof d === 'object') ? { ...d } : {},
    'string': (d) => d,
    'boolean': (d) => d ? true : false,
};
const FUNCTION_FACTORY = {
    'default': (m, name, camel_name) => {
        m[`set${camel_name}`] = (state, v) => { state[name] = v };
        m[`get${camel_name}`] = (state) => { return state[name] };
    },
    'array': (m, name, camel_name, opt) => {
        if ('first' in opt && opt.first) {
            m[`add${camel_name}`] = (state, v) => { state[name] = [v, ...state[name]] }
        } else {
            m[`add${camel_name}`] = (state, v) => { state[name] = [...state[name], v] }
        }

        if ('drop_duplicate' in opt && opt.drop_duplicate) {
            const org = m[`add${camel_name}`];
            m[`add${camel_name}`] = (state, v) => { state[name] = [...new Set(org(state, v))] }
        }
    },
    'boolean': (m, name, camel_name/*, opt*/) => {
        m[`toggle${camel_name}`] = (state) => { state[name] = !state[name] };
    }
};

const state = {}, mutations = {};

store.map(e => {
    const { name, default: d, type = 'string', opt } = e;
    const lower_type = type.toLowerCase();
    const camel_name = toCamelCase(name);

    state[name] = VALUE_FACTORY[lower_type](d);

    FUNCTION_FACTORY['default'](mutations, name, camel_name, opt);
    if (lower_type in FUNCTION_FACTORY) {
        FUNCTION_FACTORY[lower_type](mutations, name, camel_name, opt);
    }
});

// additional mutations
mutations['changeNotebook'] = (state, v) => { state.notebook_or_tag = { notebook: v, tag: undefined } };
mutations['changeTag'] = (state, v) => { state.notebook_or_tag = { notebook: undefined, tag: v } };
mutations['removeFileByPath'] = (state, v) => { state.files = state.files.filter(d => d.path != v) };

export default createStore({
    state: state,
    mutations: mutations,
    actions: {},
    modules: {},
    plugins: [createPersistedState()],
})