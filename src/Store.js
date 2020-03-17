export default class Store {
  static create(component, options) {
    /*
     * Init selected
     */

    let selected = options.selected;
    if (selected) {
      if (Array.isArray(selected)) {
        selected = selected.map(function (e) {
          if (typeof e === "string") {
            return { path: e };
          } else {
            return e;
          }
        });
      } else {
        if (typeof selected === "string") {
          selected = { path: selected };
        }
      }
    }

    return {
      state: {
        mm: component,
        options: options,
        path: options.basePath + options.path,
        selected: selected
      },
      mutations: {
        resetSelected(state) {
          state.selected = null;
        },
        addSelected(state, file) {
          if (state.options.multipleSelection) {
            if (!Array.isArray(state.selected)) {
              state.selected = [];
            } else {
              let index = state.selected.findIndex(element => { return element.path === file.path; });
              if (index > -1) return;
            }
            state.selected.push(file);
          } else {
            state.selected = file;
          }
          state.selected = JSON.parse(JSON.stringify(state.selected));
          state.mm.onSelect({ selected: state.selected });
        },
        removeSelected(state, file) {
          if (state.options.multipleSelection) {
            if (!Array.isArray(state.selected)) return;
            let index = state.selected.findIndex(element => { return element.path === file.path; });
            if (index > -1) {
              state.selected.splice(index, 1);
            }
          } else {
            state.selected = null;
          }
          state.selected = JSON.parse(JSON.stringify(state.selected));
          state.mm.onSelect({ selected: state.selected });
        },
        renameSelected(state, { file, newFile }) {
          function patchInnerFile(item) {
            item.path = newFile.path + item.path.substr(file.path.length);
            let parentPath = item.path.substr(0, item.path.lastIndexOf("/"));
            let slashPos = parentPath.lastIndexOf("/");
            item.dirname = slashPos !== -1 ? parentPath.substr(slashPos + 1) : parentPath;

            if (item.fileURL) {
              item.fileURL = item.fileURL.replace("/" + file.path + "/", "/" + newFile.path + "/");
            }

            if (item.thumb) {
              item.thumb = item.thumb.replace("/" + file.path + "/", "/" + newFile.path + "/");
            }
          }

          let renamed = false;
          if (state.options.multipleSelection) {
            if (!Array.isArray(state.selected)) return;
            let selectedItem = state.selected.find(i => i.path === file.path);
            if (selectedItem) {
              Object.assign(selectedItem, newFile);
              renamed = true;
            }

            if (file.type === "dir") {
              state.selected.filter(i => i.path.indexOf(file.path + "/") === 0).forEach(i => {
                patchInnerFile(i);
                renamed = true;
              })
            }
          } else {
            if (state.selected && state.selected.path === file.path) {
              state.selected = newFile;
              renamed = true;
            }

            if (file.type === "dir") {
              if (state.selected && state.selected.path.indexOf(file.path + "/") === 0) {
                patchInnerFile(state.selected);
                renamed = true;
              }
            }
          }
          if (renamed) {
            state.mm.onSelect({ selected: state.selected });
          }
        }
      },
      getters: {
        isSelected: (state, getters) => (file) => {
          if (state.options.multipleSelection) {
            if (!Array.isArray(state.selected)) return false;
            let index = state.selected.findIndex(element => {
              return element.path === file.path;
            });
            return index > -1;
          } else {
            return (state.selected && state.selected.path === file.path) || false;
          }
        },
        nbSelected: (state, getters) => {
          if (Array.isArray(state.selected)) return state.selected.length;
          if (state.selected) return 1;
          return 0;
        }
      }
    }
  }
}
