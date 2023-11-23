import Vue from "vue";
import App from "./App";
import "@/style/index.scss";
import "@/style/u-view-reset.scss";
import globalMixin from "@/mixin/global-mixin";
import "windi.css";
import Loading from "@/components/loading/index.vue";
import store from "./store";
import uView from 'uview-ui';

Vue.use(uView)
Vue.config.productionTip = false;
Vue.use(globalMixin);
Vue.component("loading", Loading);

App.mpType = "app";

const app = new Vue({
  store,
  ...App,
});
app.$mount();
