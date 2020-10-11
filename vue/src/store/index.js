import { createStore } from 'vuex'
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    notebooks: [],
    tags: [],
    files: [],
    notebook: undefined,
    tag: undefined,
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
    setTags(state, v) {
      state.tags = v;
    },
    changeNotebook(state, v) {
      state.notebook = v;
      state.tag = undefined;
    },
    changeTag(state, v) {
      state.notebook = undefined;
      state.tag = v;
    },
    addTag(state, v) {
      state.tags = [...new Set([...state.tags, v])];
    },
    setFiles(state, v) {
      state.files= v;
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
