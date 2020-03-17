import axios from 'axios';

const CancelToken = axios.CancelToken;

export default class Api {

  static get defaultOptions() {
    return {
      baseUrl: null,
      listUrl: null,
      downloadUrl: null,
      deleteUrl: null,
      renameUrl: null,
      createFolderUrl: null,
      uploadUrl: null,
      beforeUpload: null,
      axiosOptions: {}
    };
  }

  constructor(opts) {
    this.options = { ...this.constructor.defaultOptions, ...opts };

    if (this.options.baseUrl) {
      this.options.axiosOptions.baseURL = this.options.baseUrl;
    }

    this.axios = axios.create(this.options.axiosOptions);
  }

  list(path) {
    var conf = this.computeConfig({ params: { path: path } });
    return this.axios.get(this.options.listUrl, conf);
  }

  upload(data, config, uploadFile) {
    var conf = this.computeConfig(config);
    var source = CancelToken.source();
    var options = {
      config: {
        ...conf,
        cancelToken: source.token
      },
      url: this.options.uploadUrl
    };
    let configured = Promise.resolve();
    if (this.options.beforeUpload instanceof Function) {
      configured = Promise.all([this.options.beforeUpload(options, data, uploadFile)]).then(a => a[0]);
    }

    uploadFile.abort = () => {
      source.cancel();
    };

    return configured.then(() => {
      return this.axios.post(options.url, data, options.config).then(res => {
        if (this.options.afterUpload instanceof Function) {
          return this.options.afterUpload(res, options, uploadFile);
        } else {
          return res;
        }
      });
    });
  }

  delete(file) {
    var conf = this.computeConfig({});
    return this.axios.delete(this.deleteUrl(file), conf);
  }

  rename(file, name) {
    var conf = this.computeConfig({});
    return this.axios.patch(this.renameUrl(file), {
      name: name
    }, conf);
  }

  createFolderIn(parentFolder, name) {
    var conf = this.computeConfig({});
    return this.axios.post(this.createFolderUrl(parentFolder, name), {}, conf);
  }

  computeConfig(conf) {
    if (!this.options.requestConfig) {
      return conf
    }
    var overrideConf = this.options.requestConfig
    if (overrideConf instanceof Function) {
      overrideConf = overrideConf()
    }
    return { ...conf, ...overrideConf }
  }

  downloadUrl(file) {
    return this.options.downloadUrl && this.options.downloadUrl + '?path=' + file.path;
  }

  deleteUrl(file) {
    return this.options.deleteUrl && this.options.deleteUrl + '/' + file.path;
  }

  renameUrl(file) {
    return this.options.renameUrl && this.options.deleteUrl + '/' + file.path;
  }

  createFolderUrl(parentFolder, name) {
    return this.options.createFolderUrl && this.options.createFolderUrl + (parentFolder ? '/' + parentFolder : "") + '/' + name;
  }
}
