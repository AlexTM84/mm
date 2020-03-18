import Vue from "vue";
import Vuex from 'vuex';

Vue.use(Vuex);

function createUuid() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

export default new Vuex.Store({
  state: {
    uploading: []
  },
  mutations: {
    startUpload(state, file) {
      file.uuid = createUuid();
      state.uploading.push(file);
    },
    updateUpload(state, { file, info }) {
      let uploading = state.uploading.find(f => (file.path && f.path === file.path) || (file.uuid && f.uuid === file.uuid));
      if(uploading) {
        Object.assign(uploading, info);
      }
    },
    removeUpload(state, file) {
      const index = state.uploading.findIndex(f => (file.path && f.path === file.path) || (file.uuid && f.uuid === file.uuid));
      if(index !== -1) {
        delete file.uploading;
        delete file.loaded;
        delete file.total;
        delete file.success;
        delete file.error;
        delete file.uploadPath;
        delete file.uuid;
        delete file.abort;
        state.uploading.splice(index, 1);
      }
    }
  },
  getters: {
    isUploading: (state, getters) => (file) => {
      return !!state.uploading.find(f => (file.path && f.path === file.path) || (file.uuid && f.uuid === file.uuid));
    },
    uploadingProgress: (state, getters) => (file) => {
      let upload = state.uploading.find(f => (file.path && f.path === file.path) || (file.uuid && f.uuid === file.uuid));
      return upload && (100 * upload.loaded / upload.total) || 0;
    },
    uploading: (state, getters) => (dirPath) => {
      return state.uploading.filter(f => f.uploadPath === dirPath);
    },
    donePromise: (state, getters) => (file) => {
      let upload = state.uploading.find(f => (file.path && f.path === file.path) || (file.uuid && f.uuid === file.uuid));
      return upload && upload.promise || Promise.reject();
    }
  },
  actions: {
    startUpload({ dispatch, commit }, file) {
      commit("startUpload", file)
    },
    updateUpload({ dispatch, commit }, { file, info} ) {
      commit("updateUpload", { file, info });
    },
    removeUpload({ dispatch, commit }, file) {
      commit("removeUpload", file);
    }
  }
});
