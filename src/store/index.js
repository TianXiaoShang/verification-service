import Vue from "vue";
import Vuex from "vuex";
import { getStorage, setStorage, removeStorage } from "@/util/storage";
import moment from "moment";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    loginStatus: false, // 获取登录状态
    token: null, // token
    userInfo: {}, // 储存来自weixin授权的用户信息（头像信息等）
    globalLoadings: [], // loading组件控制
    globalLoadingText: "", // loading组件文本
    cinema: null, // 影院信息
    setting: null, // 影院配置信息
    userLocation: null, // 用户位置坐标信息
    hideErrorMessage: false, // 控制接口请求错误信息提示
    canFetchTicket: false,
    canFetchHome: true,
    openHomeAdvert: false, // 开屏广告控制
    alreadySetOpenHomeAdvert: false, // 表示已经打开过一次开屏广告了，防止二次调用
    sales_partner_id: "", // 分销进来的父级id，在一次小程序生命周期内，一直存在。
  },
  getters: {
    loginStatus: (state) => state.loginStatus,
    userInfo: (state) => state.userInfo,
    token: (state) => state.token,
    globalLoadingText: (state) => state.globalLoadingText,
    globalLoadings: (state) => state.globalLoadings,
    cinema: (state) => state.cinema,
    setting: (state) => state.setting,
    userLocation: (state) => state.userLocation,
    hideErrorMessage: (state) => state.hideErrorMessage,
    canFetchTicket: (state) => state.canFetchTicket,
    canFetchHome: (state) => state.canFetchHome,
    openHomeAdvert: (state) => state.openHomeAdvert,
    alreadySetOpenHomeAdvert: (state) => state.alreadySetOpenHomeAdvert,
    sales_partner_id: (state) => state.sales_partner_id,
  },
  mutations: {
    SET_SALES_PARTNER_ID(state, value) {
      // 有值的情况，写入本地。并赋值失效时间
      if (value) {
        setStorage(
          "sales_partner_id",
          JSON.stringify({
            id: value,
            loseTime: moment().add(1, "days").format("YYYY-MM-DD HH:mm:ss"),
          })
        );
        state.sales_partner_id = value;
      } else {
        // 没有则检测时间，时间超过24小时则清除;,否则取本地的值并赋上
        let storageData = getStorage("sales_partner_id");
        // 本地有值
        if (storageData) {
          storageData = JSON.parse(storageData);
          if (!storageData.id) {
            // 没id，则还是赋外面传入的空串即可,一般不太可能
            state.sales_partner_id = value;
            removeStorage("sales_partner_id");
            return;
          }
          // 当失效时间在当前时间之前，则失效清除
          if (moment(storageData.loseTime).isBefore(moment())) {
            removeStorage("sales_partner_id");
            state.sales_partner_id = value; // 本地有值但过期
          } else {
            state.sales_partner_id = storageData.id; // 本地有值且没过期
          }
        } else {
          // 本地没值，则不管，赋外面传入的空串即可
          state.sales_partner_id = value;
        }
      }
    },
    SET_OPEN_HOME_ADVERT(state, value) {
      state.openHomeAdvert = value;
    },
    ALREADY_SET_OPEN_HOME_ADVERT(state, value) {
      state.alreadySetOpenHomeAdvert = value;
    },
    SET_CAN_FETCH_TICKET(state, value) {
      state.canFetchTicket = value;
    },
    SET_CAN_FETCH_HOME(state, value) {
      state.canFetchHome = value;
    },
    SHOW_LOADING(state, value) {
      state.globalLoadings.push("show");
      state.globalLoadingText = value;
    },
    HIDE_LOADING(state) {
      if (state.globalLoadings.length) {
        state.globalLoadings.pop();
      }
    },
    // 存储当前影院信息
    SET_CINEMA(state, val) {
      state.cinema = val;
    },
    // 存储当前影院配置信息
    SET_SETTING(state, val) {
      state.setting = val;
    },
    SET_POS(state, val) {
      state.userLocation = val;
    },
    // 登录，更新状态
    LOGIN(state, value) {
      // 触发全局登录完成事件
      uni.$emit("onLogin", value);
      state.loginStatus = value;
    },
    // 登出
    LOGOUT(state) {
      state.token = null;
      state.userInfo = {};
    },
    SET_TOKEN(state, value) {
      state.token = value;
    },
    UPDATE_USERINFO(state, value) {
      state.userInfo = value;
    },
    UPDATE_HIDE_ERROR_MESSAGE(state, value) {
      state.hideErrorMessage = value;
    },
  },
});

export default store;
