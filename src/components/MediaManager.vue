<template>
  <div
    class="mm"
    v-bind:class="{ 'mm-fixed-height': options.height }"
    v-bind:style="options.height ? 'height:'+options.height : ''"
  >
    <div class="panel panel-default">
      <div class="panel-body">
        <notification-widget></notification-widget>

        <ol v-if="options.showBreadcrumb" class="breadcrumb">
          <li v-for="item in breadcrumb" :key="item.path">
            <a v-on:click.prevent="path=item.path" v-html="item.label" href="#"></a>
          </li>
        </ol>

        <div class="mm-content">
          <upload-widget
            v-if="api.options.uploadUrl"
            v-bind:path="path"
            v-on:upload-success="onUploadSuccess"
            v-on:upload-error="onUploadError"
            ref="upload"
            key="upload"
            class="animated fadeIn"
          ></upload-widget>

          <medias-widget
            :path="path"
            :uploads="uploadsInPath"
            ref="medias"
            key="medias"
            class="animated fadeIn"
          ></medias-widget>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

import UploadWidget from "./UploadWidget.vue";
import MediasWidget from "./MediasWidget.vue";
import NotificationWidget from "./NotificationWidget.vue";
import FaIconClassHelper from "../FaIconClassHelper";

import globalStore from "../GlobalStore";

export default {
  props: ["api", "id"],
  components: {
    MediasWidget,
    UploadWidget,
    NotificationWidget
  },
  data() {
    return {
      path:
        this.$store.state.options.initialPath ||
        this.$store.state.options.basePath,
      file: {}
    };
  },
  computed: {
    ...mapState({
      options: state => state.options,
      basePath: state => state.options.basePath
    }),
    relPath() {
      return this.path.replace(this.basePath, "");
    },
    breadcrumb() {
      let parts = this.relPath.split("/"),
        breadcrumb = [],
        path = "";

      breadcrumb.push({
        label: '<i class="fa fa-fw fa-home"></i>',
        path: this.basePath
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          path += parts[i] + "/";
          breadcrumb.push({
            label: parts[i],
            path: this.basePath + path.replace(/\/$/, "")
          });
        }
      }

      return breadcrumb;
    },
    uploadsInPath() {
      return globalStore.getters.uploading(this.path);
    }
  },
  created() {},
  methods: {
    selectFile(file) {
      this.$store.commit("addSelected", file);
    },
    unselectFile(file) {
      this.$store.commit("removeSelected", file);
    },
    fileUploaded(file) {
      const selected = this.isSelected(file);
      this.$store.commit("fileUploaded", file);
      if(selected && this.options.onSelect instanceof Function) {
        this.options.onSelect({ selected: this.$store.getters.selected() });
      }
    },
    isSelected(file) {
      return this.$store.getters.isSelected(file);
    },
    onUploadSuccess() {
      this.$refs.medias.refresh();
    },
    onUploadError(errors) {
      //this.$refs.medias.refresh();
    },
    deleteFile(file) {
      if (this.options.api.deleteUrl) {
        let confirmation;
        if (this.options.confirmDeletion instanceof Function) {
          confirmation = this.options.confirmDeletion(file);
        } else {
          if (
            window.confirm("Are you sure to remove file " + file.basename + "?")
          ) {
            confirmation = Promise.resolve();
          } else {
            confirmation = Promise.reject();
          }
        }
        confirmation.then(
          () => {
            this.api.delete(file).then(
              () => {
                this.$store.commit("removeSelected", file);
                this.$refs.medias.$emit("fileDeleted", file);
              },
              e => {
                if (this.options.onError instanceof Function) {
                  this.options.onError(e, "delete", file);
                }
              }
            );
          },
          () => {}
        );
      }
    },
    renameFile(file) {
      let name;
      if (this.options.api.renameUrl) {
        if (this.options.askNewName instanceof Function) {
          name = this.options.askNewName(file);
        } else if (
          !(name = (
            window.prompt(
              "Type the new name for " + file.basename,
              file.basename
            ) || ""
          ).trim())
        ) {
          name = Promise.reject();
        }
      }
      return Promise.all([name]).then(([name]) => {
        if (name !== file.basename) {
          return this.api.rename(file, name).then(
            response => {
              let newFile = response.data;
              this.$store.commit("renameSelected", { file, newFile });
              this.$refs.medias.$emit("fileRenamed", file, newFile);
            },
            e => {
              if (this.options.onError instanceof Function) {
                this.options.onError(e, "rename", file, name);
              }
              return Promise.reject(e);
            }
          );
        } else {
          return Promise.reject();
        }
      });
    },
    createFolderIn(parentFolder) {
      let name;
      if (this.options.api.createFolderUrl) {
        if (this.options.askFolderName instanceof Function) {
          name = this.options.askFolderName(parentFolder);
        } else if (!(name = window.prompt("Type the name of the new folder"))) {
          name = Promise.reject();
        }
      }
      return Promise.all([name]).then(([name]) => {
        return this.api.createFolderIn(parentFolder, name);
      });
    },
    checkFile(file) {
      if (!this.options.accept) {
        return true;
      } else if (this.options.accept instanceof Function) {
        return this.options.accept(file);
      } else {
        var types = [];
        if (typeof this.options.accept === "string") {
          types = [this.options.accept];
        } else if (Array.isArray(this.options.accept)) {
          types = this.options.accept;
        }
        for (var t in types) {
          var type = types[t];
          var re = new RegExp(
            "^" + type.replace("*", ".*").replace("/", "\\/") + "$",
            "i"
          );
          if (re.test(file.mime)) {
            return true;
          }
        }

        return false;
      }
    },
    removeUpload(file) {
      return globalStore.dispatch("removeUpload", file);
    },
    startUpload(file) {
      return globalStore.dispatch("startUpload", file);
    },
    updateUpload(file, info) {
      return globalStore.dispatch("updateUpload", { file, info });
    },
    /**
     * FA icon class helper
     */
    faIconClass(file) {
      return FaIconClassHelper.getFaIconClass(file);
    }
  }
};
</script>

<style lang="scss">
.mm {
  position: relative;
  .animated {
    animation-duration: 0.4s;
  }

  .breadcrumb {
    padding-left: 0;
    margin-bottom: 0.5em;
    li {
      display: inline-block;

      &:not(:last-child)::after {
        display: inline-block;
        padding: 0 0.5em;
        content: ">";
      }
    }
  }
}

.mm-fixed-height {
  > .panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;

    > .panel-body {
      position: absolute;
      top: 0; //47px;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: auto;
    }
  }

  .mm-content {
    // position: relative;
    min-height: 250px;
  }
}
</style>
