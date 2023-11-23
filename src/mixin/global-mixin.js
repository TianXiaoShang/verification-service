import request from "@/services/request.service";
import newRequest from "@/services/new-request.service";
import { mapGetters } from "vuex";
import { BASE_URL } from "@/services/environment.service";
import store from "@/store";
import { getMember } from "@/api/common.js";
import { setUserInfo } from "@/util";
import moment from "moment";
import DEFAULT_AVATAR from "@/static/common/default-avatar.png";
import { login } from "@/util/base";
import { getStatusBarInfo } from "@/util/index.js";

export default {
  install(Vue) {
    Vue.mixin({
      data() {
        return {
          BASE_URL,
          DEFAULT_AVATAR,
          // 抖音支付状态
          tiktokStatusTextArr: [
            "支付成功",
            "支付超时",
            "支付失败",
            "支付关闭",
            "支付取消",
            "订单状态开发者自行获取",
          ],
          moment,
          isWx: false, // 判断微信还是抖音
          request,
          newRequest,
          triggered: true,
          myCurrentPage: 1,
          pageFinish: false,
          // _pageSize: 20,
          // _totalCount: 0,
          pageLoad: false,
          inputCustomStyle: { background: "#F2F3F5" },
          _loading: {
            show(text) {
              store.commit("SHOW_LOADING", text);
            },
            hide() {
              store.commit("HIDE_LOADING");
            },
          },
          myLoginLoading: false,
          mixNavBarHeight: 0,
          mixinStatusBarHeight: 0,
          showNavTitle: true, // 控制全屏（无状态栏）在滑动时候的展示
        };
      },
      computed: {
        ...mapGetters(["userInfo", "loginStatus", "setting", "cinema", 'sales_partner_id']),
        isMovieMode() {
          return this.setting ? this.setting.is_pattern == 0 : false; // 默认剧院模式, 剧院模式 is_pattern == 1   /   影院模式 is_pattern == 0
        },
      },
      created() {
        // 微信小程序实现顶部透明
        // #ifdef MP-WEIXIN
        this.isWx = true;
        // #endif
        const { statusBarHeight, navBarHeight } = getStatusBarInfo();
        this.mixNavBarHeight = navBarHeight;
        this.mixinStatusBarHeight = statusBarHeight;
      },
      methods: {
        // 向下滚动大于20，隐藏全屏模式下的title；
        onHandleScrollChange(e, dis = 20) {
          if (e.scrollTop >= dis) {
            this.showNavTitle = false;
          } else {
            this.showNavTitle = true;
          }
        },
        onCustomChange(form, key, val) {
          form[key] = val;
        },
        onimError(e) {
          console.log(e, "onimError");
          this.myMessage("唤起客服失败");
        },
        imCallback(e) {
          console.log(e, "imCallback");
        },
        myMessage(text, icon = "none") {
          uni.showToast({
            title: text,
            icon,
          });
        },
        goHome(delay = 0) {
          setTimeout(() => {
            uni.reLaunch({ url: `/pages/index/index` });
          }, delay);
        },
        async getNewUserInfo() {
          return await this.newRequest("/member");
        },
        onRestore() {
          this.triggered = true; // 需要重置
        },
        back(delay = 0) {
          setTimeout(() => {
            uni.navigateBack();
          }, delay);
        },
        // 获取当前授权状态（同步版本）
        getCurAuth() {
          return !!(this.userInfo.nickname && this.userInfo.mobile);
        },
        // 其实只是检测有没有授权用户信息。小程序初始化时已经直接静默登录了
        // 分三种模式（Forcible:强制模式，未授权时强制跳转授权页； Check: 检查模式，获取当前状态；Ask: 询问模式，弹窗询问是否去授权)
        // 默认值为Ask
        checkAuth(mode = "Ask", stuck = true) {
          // 检查昵称跟手机是否授权
          return new Promise((resolve, reject) => {
            const hasPermission =
              this.userInfo.nickname && this.userInfo.mobile;
            // 已授权状态直接resolve即可
            if (hasPermission) {
              resolve();
              return;
            }
            if (mode === "Ask") {
              uni.showModal({
                title: "提示",
                content: "请完善用户信息",
                confirmText: "去授权",
                cancelText: "免登录",
                success: (res) => {
                  if (res.confirm) {
                    this.toPath("/pages/auth-user-info/index");
                    // 这里不执行resolve也不执行reject，相当于padding状态。
                  } else {
                    if (stuck) {
                      reject();
                    } else {
                      resolve();
                    }
                    console.log("用户点击取消");
                  }
                },
              });
            }
            if (mode === "Forcible") {
              this.toPath("/pages/auth-user-info/index");
              reject();
            }
            if (mode === "Check") {
              reject();
            }
          });
        },
        // 等待登录完成，一般来说登录一定会成功，除非接口挂了
        waitLogin() {
          return new Promise((resolve, reject) => {
            if (this.loginStatus) {
              resolve();
            } else {
              if (!this.myLoginLoading) {
                this.myLoginLoading = true;
                login().then(
                  () => {
                    this.myLoginLoading = false;
                  },
                  () => reject()
                );
              }
              uni.$on("onLogin", (value) => {
                if (value) {
                  resolve();
                } else {
                  reject();
                }
              });
            }
          });
        },
        // 等待影院基础配置完成
        waitInitConfig() {
          return new Promise((resolve, reject) => {
            if (this.setting && this.cinema) {
              resolve();
            } else {
              uni.$on("onInitCinemaSetting", (value) => {
                if (value) {
                  resolve();
                } else {
                  reject();
                }
              });
            }
          });
        },
        // 个人详细业务数据，因为要多次获取后进行更新storage和store的全局个人资料，所以封装了一层去调用setUserInfo
        getMember(openid, showLoading = true) {
          return new Promise((resolve, reject) => {
            getMember(openid, showLoading).then(
              (res) => {
                // res.member与login接口返回的数据相同，都是个人基本资料
                setUserInfo(res.member);
                resolve(res);
              },
              () => reject()
            );
          });
        },
        async updateSettingInit() {
          const setRes = await request("set");
          store.commit("SET_SETTING", {
            ...setRes.set,
            ...(setRes.tiktok_set || {}),
          });
          const cinemaRes = await request("cinema");
          store.commit("SET_CINEMA", cinemaRes.cinema);
        },
        onCopy(value) {
          uni.setClipboardData({
            data: value,
            success: function () {
              console.log("onCopy-success");
            },
          });
        },
        toPath(path, delay = 0) {
          const homesPages = [
            "/pages/index/index",
            "/pages/ticket/index",
            "/pages/self/index",
          ];
          if (!path) {
            return;
          }
          setTimeout(() => {
            if (homesPages.includes(path)) {
              this.switchToPath(path, delay);
            } else {
              uni.navigateTo({
                url: path,
              });
            }
          }, delay);
        },
        switchToPath(path, delay = 0) {
          if (!path) {
            return;
          }
          setTimeout(() => {
            uni.switchTab({
              url: path,
            });
          }, delay);
        },
        // 对小数点为0的字符串做去除，23.00 => 23 | 23.01 => 23.01 | 23.00 => 23
        splitPoint(value) {
          if (!value || typeof value !== "string") {
            return value;
          }
          const arr = value.split(".");
          if (arr.length === 2 && (arr[1] === "0" || arr[1] === "00")) {
            return arr[0];
          } else {
            return value;
          }
        },
        // 封装分享
        myOnShareAppMessage(path = "/pages/index/index", options) {
          const scene = encodeURIComponent(`mid=${this.userInfo.id}`);
          let url = path.includes("?")
            ? `${path}&scene=${scene}`
            : `${path}?scene=${scene}`;
          if (!this.isWx && this.setting.share_id) {
            options.templateId = this.setting.share_id;
          }
          return {
            ...options,
            path: url,
          };
        },
        // 封装分享朋友圈
        myOnShareTimeline(options, queryStr) {
          const scene = encodeURIComponent(`mid=${this.userInfo.id}`);
          const query = `isShareTimeline=true&scene=${scene}${
            queryStr ? "&" + queryStr : ""
          }`;
          console.log(options, query, "options:::");
          return {
            query,
            ...options,
          };
        },
      },
      onHide() {
        // 不管是否使用了waitLogin都进行解除监听，防止重复监听onLogin
        // 本质上使用waitLogin方式只是为了等登录完成，不需要重复执行回调，尽管promise状态不会再次改变
        uni.$off("onLogin");
        // onInitCinemaSetting不用，目前只有首页用到，而且取消监听在未完成之前切换tab会有问题
        // uni.$off("onInitCinemaSetting");
      },
    });
  },
};
