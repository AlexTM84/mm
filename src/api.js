import axios from 'axios';

export default class Api {

    static get defaultOptions() {
        return {
            baseUrl: null,
            listUrl: null,
            downloadUrl: null,
            deleteUrl: null,
            uploadUrl: null,
            axiosOptions: {}
        };
    }

    constructor(opts) {
        this.options = { ...this.constructor.defaultOptions, ...opts};

        if (this.options.baseUrl) {
            this.options.axiosOptions.baseURL = this.options.baseUrl;
        }

        this.axios = axios.create(this.options.axiosOptions);
    }

    list(path) {
        var conf = this.computeConfig({ params: { path: path } });
        return this.axios.get(this.options.listUrl, conf);
    }

    upload(data, config) {
        var conf = this.computeConfig(config);
        return this.axios.post(this.options.uploadUrl, data, conf);
    }

    delete(file) {
        var conf = this.computeConfig({});
        return this.axios.delete(this.deleteUrl(file), conf);
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
        // TODO : proper
        if (this.options.downloadUrl)
            return this.options.downloadUrl+'?path='+file.path;
    }
    
    deleteUrl(file) {
        if (this.options.deleteUrl)
            return this.options.deleteUrl+'/'+file.path;
    }

    createFolderUrl(parentFolder, name) {
        if (this.options.createFolderUrl)
            return this.options.createFolderUrl + (parentFolder ? '/' + parentFolder : "") + '/' + name;
    }

}