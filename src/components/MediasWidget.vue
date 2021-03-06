<template>

    <div class="medias-widget clearfix">

        <template v-if="error">

            <div class="alert alert-warning animated fadeIn">
                {{ error }}
                <p><button v-on:click.prevent="refresh()" class="btn btn-primary"><i class="fa fa-fw fa-refresh"></i> Click here to retry</button></p>
            </div>

        </template>
        <template v-else>

            <!--<div v-if="!loading && files.length==0" class="alert alert-info animated fadeIn">-->
            <!--    This folder is empty.-->
            <!--</div>-->

            <div class="medias clearfix">
                <template v-if="loading">

                    <div class="file animated fadeIn">
                        <div class="file-preview">
                            <div class="icon">
                                <i class="fa fa-fw fa-spin fa-sync"></i>
                            </div>
                        </div>
                    </div>

                </template>
                <template v-else>

                    <div v-if="relPath" v-on:click="browse(pathUp)" class="file animated fadeIn">
                        <div class="file-preview">
                            <div class="icon">
                                <i class="fa fa-fw fa-backward"></i>
                            </div>
                        </div>
                    </div>

                    <div v-if="canCreateFolder && !loading" v-on:click="createFolder()" class="file animated fadeIn">
                        <div class="file-preview">
                            <div class="icon">
                                <i class="fas fa-fw fa-folder-plus"></i>
                            </div>
                        </div>
                    </div>

                    <media-widget
                        v-for="file in files"
                        v-on:click.native="onMediaClick(file)"
                        v-on:contextmenu.native.prevent="onContextMenu(file, $event)"
                        v-bind:file="file"
                        v-bind:key="file.path"
                        class="animated fadeIn"
                        v-bind:class="{ invalid: file.type !== 'dir' && !mmc.checkFile(file) }"
                    ></media-widget>

                    <media-widget
                        v-for="upload in uploads"
                        v-on:click.native="onMediaClick(upload)"
                        v-bind:file="upload"
                        v-bind:key="upload.uuid"
                        class="animated fadeIn"
                    ></media-widget>

                </template>
            </div>

            <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
                <div v-if="showContextMenu" class="context-menu" v-bind:style="contextMenuStyle">
                    <ul v-if="contextMenuFile.type=='dir'">
                        <li><a v-on:click.prevent="onMediaClick(contextMenuFile)" href="#"><i class="fa fa-fw fa-folder-open"></i> Open</a></li>
                        <!-- <li><a v-on:click.prevent="mmc.toggleDetailsOn(contextMenuFile)" href="#"><i class="fa fa-fw fa-info-circle"></i> Details</a></li> -->
                    </ul>
                    <ul v-else>
                        <li v-if="mmc.isSelected(contextMenuFile)"><a v-on:click.prevent="mmc.unselectFile(contextMenuFile)" href="#"><i class="fa fa-fw fa-times"></i> Unselect</a></li>
                        <li v-else><a v-on:click.prevent="mmc.selectFile(contextMenuFile)" href="#"><i class="fa fa-fw fa-check"></i> Select</a></li>
                        <!-- <li><a v-on:click.prevent="mmc.toggleDetailsOn(contextMenuFile)" href="#"><i class="fa fa-fw fa-info-circle"></i> Details</a></li> -->
                        <!-- <li v-if="api.downloadUrl(contextMenuFile)" ><a v-bind:href="api.downloadUrl(contextMenuFile)"><i class="fa fa-fw fa-download"></i> Download</a></li> -->
                    </ul>
                </div>
            </transition>

        </template>

    </div>

</template>

<script>
/* global $ */
import { mapState } from 'vuex';
import MediaWidget from './MediaWidget.vue';

export default {
    components: {
        MediaWidget
    },
    data() {
        return {
            files: [],
            loading: false,
            error: false,
            contextMenuFile: {},
            contextMenuX: 0,
            contextMenuY: 0,
            showContextMenu: false
        };
    },
    props: [
        'path',
        'uploads'
    ],
    computed: {
        ...mapState({
            basePath: state => state.options.basePath
        }),
        mmc() {
            return this.$parent;
        },
        api () {
            return this.mmc.api;
        },
        relPath() {
            return this.path.replace(this.basePath, '');
        },
        canCreateFolder() {
            return this.mmc.options.api.createFolderUrl;
        },
        pathUp() {
            let path = '', index = this.relPath.lastIndexOf('/');
            if (index>-1) {
                path = this.relPath.slice(0, index);
            }
            return this.basePath + path;
        },
        contextMenuStyle() {
            return 'left: '+this.contextMenuX+'px; top:'+this.contextMenuY+'px;';
        }
    },
    watch: {
        path: function() {
            this.refresh();
        }
    },
    mounted() {
        this.refresh();

        this.$on("fileDeleted", file => {
            var pos = this.files.indexOf(file);
            if(pos !== -1) {
                this.files.splice(pos, 1);
            }
        });

        this.$on("fileRenamed", (file, newFile) => {
            Object.assign(file, newFile);
        });
    },
    destroyed() {
        this.$off("fileDeleted");
        this.$off("fileRenamed");
    },
    methods: {
        createFolder() {
            this.mmc.createFolderIn(this.path).then(() => {
                this.refresh();
            }, () => {});
        },
        refresh() {
            this.loading = true;
            this.error = false;

            this.api.list(this.path)
                .then(response => {
                    if (Array.isArray(response.data)) {
                        response.data.sort((a, b) => {
                            let as = a.type +'/'+ a.basename,
                                bs = b.type +'/'+ b.basename;
                            return as.localeCompare(bs)
                        });
                        this.files = response.data;
                    }
                    this.loading = false;
                }, error => {
                    // TODO
                    this.error = error.toString();
                    this.files = [];
                    this.loading = false;
                });
        },
        browse(path) {
            this.mmc.path = path;
        },

        onMediaClick(file) {
            if (file.type=='dir') {
                this.browse(file.path);
            } else {
                let mmc = this.mmc;
                if (mmc.isSelected(file)) {
                    mmc.unselectFile(file);
                } else {
                    if(mmc.checkFile(file)) {
                        mmc.selectFile(file);
                    }
                }
            }
        },

        onDocumentClick(e) {
            this.toggleContextMenuOff();
        },
        onContextMenu(file, e) {
            let clientRect = this.mmc.$el.getBoundingClientRect();
            this.contextMenuFile = file;
            this.contextMenuX = e.clientX - clientRect.left;
            this.contextMenuY = e.clientY - clientRect.top;
            this.toggleContextMenuOn();
        },
        toggleContextMenuOn() {
            this.showContextMenu = true;
            document.addEventListener('click', this.onDocumentClick);
        },
        toggleContextMenuOff() {
            this.contextMenuFile = {};
            this.contextMenuX = 0;
            this.contextMenuY = 0;
            this.showContextMenu = false;
            document.removeEventListener('click', this.onDocumentClick);
        }
    }
};
</script>

<style lang="scss">
$filesMargin: 5px;

.medias {
    margin: (-$filesMargin) (-$filesMargin) 15px (-$filesMargin);
    .file {
        margin: $filesMargin;
    }
}

.context-menu {
    position: absolute;
    background-color: #fff;
    box-shadow: 0 1px 5px rgba(0,0,0,0.5);
    z-index: 100;

    ul {
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
    }

    li {
        display: block;
        a {
            display: block;
            padding: 6px 15px;
            font-weight: normal;
            color: #333;
            text-decoration: none;
            white-space: nowrap;
            &:hover {
                background-color: #eee;
            }
        }
    }
}
</style>
