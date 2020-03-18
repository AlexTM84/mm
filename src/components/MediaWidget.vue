<template>
  <div class="file" v-bind:class="{ selected: selected, interrupted: file.error }">
    <div class="file-preview">
      <template v-if="file.thumb && !file.error">
        <img v-bind:src="file.thumb" class="thumb" />
      </template>

      <template v-else-if="file.type=='dir'">
        <div class="icon">
          <i class="fa fa-fw fa-folder"></i>
        </div>
      </template>

      <template v-else-if="!file.error">
        <div class="icon">
          <i v-bind:class="mmc.faIconClass(file)"></i>
        </div>
      </template>

      <template v-else>
        <div class="icon">
          <i class="fas fa-frown"></i>
        </div>
      </template>

      <div class="progress" v-if="isAnUpload">
        <div class="bar" :style="{ width: uploadPercentage + '%' }"></div>
      </div>
    </div>

    <div class="file-title" :title="filename">
      <h3>{{ filename }}</h3>
    </div>

    <div class="top right actions" v-if="isAnUpload">
      <button @click.stop="abortUpload(file)" class="btn btn-default">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </div>

    <div class="top right actions" v-else-if="canDelete">
      <button @click.stop="deleteFile(file)" class="btn btn-default">
        <i class="fa fa-fw fa-trash"></i>
      </button>
    </div>

    <div class="top left actions" v-if="!isAnUpload && canRename">
      <button class="btn btn-default" @click.stop="renameFile(file)">
        <i class="fa fa-fw fa-pencil"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["file"],
  computed: {
    mmc() {
      return this.$parent.$parent;
    },
    selected() {
      return this.mmc.isSelected(this.file);
    },
    canDelete() {
      return this.mmc.options.api.deleteUrl;
    },
    canRename() {
      return this.mmc.options.api.renameUrl;
    },
    uploadPercentage() {
      return Math.round((this.file.loaded / this.file.total) * 100);
    },
    isAnUpload() {
      return typeof this.file.abort !== "undefined";
    },
    filename() {
      // filename for uploaded file, name for uploading file
      return this.file.basename || this.file.name;
    }
  },
  methods: {
    deleteFile(file) {
      this.mmc.deleteFile(file);
    },
    renameFile(file) {
      this.mmc.renameFile(file);
    },
    abortUpload(file) {
      file.abort();
      this.mmc.removeUpload(file);
    }
  }
};
</script>

<style lang="scss">
$fileWidth: 70px;
$fileBorderWidth: 2px;
$filePreviewHeight: 60px;
$filePreviewPadding: 4px;
$filePreviewDiff: 2 * ($fileBorderWidth + $filePreviewPadding);
$filePreviewIconHeight: $filePreviewHeight - $filePreviewDiff;
$fileTitleHeight: 20px;
$fileHeight: $filePreviewHeight + $fileTitleHeight;
$fileBorderColor: #eee;
$fileBorderColorH: #333;
$fileProgressColor: #0f6;

$actionsRadius: 5px;

.file {
  position: relative;
  float: left;
  width: $fileWidth;
  height: $fileHeight;
  cursor: pointer;
  border: $fileBorderWidth solid $fileBorderColor;
  transition: border-color 0.4s;
  overflow: hidden;

  &.invalid {
    cursor: default;

    .file-preview,
    .file-title {
      opacity: 0.2;
    }
  }

  .actions {
    position: absolute;
    background-color: white;
    background-color: rgba(255, 255, 255, 0.5);
    padding: 5px;

    button {
      outline: none;
      cursor: pointer;
    }
  }

  .top {
    top: 0;

    &.right {
      border-bottom-left-radius: $actionsRadius;
    }

    &.left {
      border-bottom-right-radius: $actionsRadius;
    }
  }

  .bottom {
    bottom: 0;

    &.right {
      border-top-left-radius: $actionsRadius;
    }

    &.left {
      border-top-right-radius: $actionsRadius;
    }
  }

  .left {
    left: 0;
  }

  .right {
    right: 0;
  }
}

.file-preview {
  padding: 4px;
  position: relative;
  .thumb {
    width: 100%;
    margin-top: -(($fileWidth - $filePreviewHeight)/2);
  }
  .icon {
    text-align: center;
    line-height: $filePreviewIconHeight;
    font-size: ($filePreviewIconHeight) / 1.3;
    .fa,
    .fas,
    .fad {
      vertical-align: middle;
    }
  }
  .progress {
    align-items: center;
    bottom: 0;
    height: 3px;
    left: 0;
    justify-content: center;
    position: absolute;
    right: 0;
    .bar {
      background-color: $fileProgressColor;
      height: 100%;
      margin-right: auto;
    }
  }
}

.file-no-title {
  .icon {
    line-height: $fileHeight - $filePreviewDiff;
  }
}

/*
.file-actions {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    margin-top: 10px;
}

.file:hover, .file:focus, .file.selected {
    .file-actions {
        display: block;
    }
}
*/

.file-title {
  position: absolute;
  height: 20px;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  background-color: $fileBorderColor;
  transition: background-color 0.4s;

  h3 {
    color: #000;
    margin: 0 4px;
    line-height: $fileTitleHeight;
    font-size: $fileTitleHeight/2;
    transition: color 0.4s;
  }
}

.file.selected {
  border-color: $fileBorderColorH;
  .file-title {
    background-color: $fileBorderColorH;
    h3 {
      color: #fff;
    }
  }
}

.file.interrupted {
  .file-preview {
    background-color: rgba(255,0,0, 0.3);
  }
  .file-title {
    background-color: rgb(100, 0, 0);
  }
}
</style>
