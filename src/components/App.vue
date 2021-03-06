<template>
  <div class="media-manager" v-bind:id="id">
    <div ref="mediaManager"></div>
  </div>
</template>

<script>
import Vue from "vue";
import Vuex from "vuex";
import MediaManager from "./MediaManager.vue";
import Api from "../api.js";
import Store from "../Store";
import globalStore from "../GlobalStore";

Vue.use(Vuex);

const defaultOptions = {
  basePath: "",
  path: "",
  api: {
    baseUrl: null,
    listUrl: null,
    downloadUrl: null,
    uploadUrl: null,
    options: {}
  },
  input: "",
  multipleSelection: false,
  onCreated: null,
  onMounted: null,
  onSelect: null,
  showBreadcrumb: true,
  height: null,
  vue: Vue,
  asVueComponent: false,
  accept: ""
};

export default {
  components: { MediaManager },
  props: ["id", "opts"],
  data() {
    return {
      store$: null
    };
  },
  watch: {
    opts: {
      deep: true,
      handler() {
        this.options = { ...defaultOptions, ...this.opts };
        this.store$.commit("resetSelected");
        if (this.options.selected) {
          if (Array.isArray(this.options.selected)) {
            this.options.selected.forEach(f => {
              this.select(f);
            });
          } else {
            this.select(this.options.selected);
          }
        }
      }
    }
  },
  created() {
    this.options = { ...defaultOptions, ...this.opts };

    /*
     * Init api
     */
    this.api = new Api(this.options.api);

    if (this.options.onCreated) this.options.onCreated({ vc: this });

    this._input = null;
  },
  computed: {
    overrideOptions() {
      return { ...defaultOptions, ...this.options };
    },
    input() {
      /*
       * Input options ?
       */
      if (!this._input && this.options.input) {
        this._input = document.querySelector(this.options.input);
      }
      return this._input;
    }
  },
  methods: {
    onSelect(e) {
      if (this.input) {
        if (e.selected) {
          if (this.options.multipleSelection) {
            let selected = e.selected.map(element => {
              return element.path;
            });
            this.input.value = selected.join("\n");
          } else {
            this.input.value = e.selected.path;
          }
        } else {
          this.input.value = "";
        }
      }

      if (this.options.onSelect) this.options.onSelect(e);
    },
    select(file) {
      this.store$.commit("addSelected", file);
    },
    deselect(file) {
      this.store$.commit("removeSelected", file);
    },
    setPath(path) {
      this.store$.commit("setPath", path);
      this.$emit('setpath', path);
    },
    globalStore() {
      return globalStore;
    }
  },
  mounted() {
    if (this.options.onMounted)
      this.options.onMounted({ el: this.$el, vc: this });

    const store = new Vuex.Store(Store.create(this, this.options));
    this.store$ = store;

    var mediaManager = this.$refs.mediaManager;

    new Vue({
      el: mediaManager,
      store,
      render: h =>
        h(MediaManager, {
          props: {
            id: this.id,
            api: this.api,
            parent: this
          }
        })
    });
  }
};
</script>

<style src="../assets/css/style.scss" lang="scss">
</style>
