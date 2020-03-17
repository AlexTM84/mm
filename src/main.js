import 'es6-promise/auto';
import Vue from 'vue';
import App from './components/App.vue';
// import MediaWidget from './components/MediaWidget';

/**
 * Media Manager
 */
export class MM {

    static install (vue, options) {
        vue.component('VueMediaManager', App)
        // vue.component('MediaWidget', MediaWidget)
    }

    constructor(opts) {
        this.options = opts;
        this.init();
    }

    init() {
        /*
         * Init Vue
         */
        let el = document.querySelector(this.options.el);
        this.vm = new Vue({
            el: this.options.el,
            render: h => h(App, {
                props: {
                    id: el.id,
                    opts: this.options
                }
            })
        });
    }

    destroy() {
        this.vm.$destroy();
        this.vm.$el.innerHTML = '';
    }
}
