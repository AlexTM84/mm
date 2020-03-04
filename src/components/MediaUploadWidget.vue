<template>
  <div class="file-upload" :class="{ error: file.error }">
    <div class="file-preview">
      <template v-if="file.thumb">
        <img :src="file.thumb" class="thumb" />
      </template>
      <template v-else>
        <div class="icon">
          <i :class="mmc.faIconClass(file)"></i>
        </div>
      </template>

      <div v-if="file.success" class="progress">
        <div class="bar" :style="{ width: uploadPercentage + '%' }"></div>
      </div>
    </div>
    <div class="file-title" :title="file.name">
      <h3>{{ file.name }}</h3>
    </div>
  </div>
</template>
<script>
export default {
  props: ["file"],
  computed: {
    mmc() {
      return this.$parent.$parent;
    },
    uploadPercentage() {
      return Math.round(this.file.loaded / this.file.total * 100);
    },
    completed() {
      return this.uploadPercentage === 100;
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

.file-upload {
  border: $fileBorderWidth solid $fileBorderColor;
  float: left;
  height: $fileHeight;
  overflow: hidden;
  position: relative;
  transition: border-color 0.4s;
  width: $fileWidth;
}
.file-preview {
  position: relative;
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
</style>
