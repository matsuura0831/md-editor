import { createStore } from 'vuex'
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    notebooks: [],
    tags: [],
    files: [],
    notebook_or_tag: {},
    file: undefined,

    isShowNotebook: true,
    isShowPage: true,
    isShowEditor: true,
    isShowViewer: true,
  },
  mutations: {
    setNotebooks(state, v) {
      state.notebooks = v;
    },
    addNotebook(state, v) {
      state.notebooks = [...new Set([...state.notebooks, v])];
    },
    changeNotebook(state, v) {
      state.notebook_or_tag = {notebook: v, tag: undefined};
    },

    setTags(state, v) {
      state.tags = v;
    },
    addTag(state, v) {
      state.tags = [...new Set([...state.tags, v])];
    },
    changeTag(state, v) {
      state.notebook_or_tag = {tag: v, notebook: undefined};
    },

    setFiles(state, v) {
      state.files = v;
    },
    addFile(state, v) {
      state.files = [...new Set([v, ...state.files])];
    },
    removeFileByPath(state, fp) {
      state.files = state.files.filter(d => d.path != fp)
    },
    changeFile(state, v) {
      state.file = v;
    },

    toggleNotebook(state) {
      state.isShowNotebook = ! state.isShowNotebook;
    },
    togglePage(state) {
      state.isShowPage = ! state.isShowPage;
    },
    toggleEditor(state) {
      state.isShowEditor = ! state.isShowEditor;
    },
    toggleViewer(state) {
      state.isShowViewer = ! state.isShowViewer;
    },
  },
  actions: { },
  modules: { },
  plugins: [createPersistedState()],
})
