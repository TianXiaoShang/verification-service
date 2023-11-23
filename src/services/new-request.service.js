import { getToken } from "@/util";
import { getBaseUrlForCommission } from "@/util/base";
import { getEncryptStr } from "@/util/encrypt";

import store from "@/store";

const newRequest = function (path, data = {}, method = "GET", noDirect = false) {
  const baseUrl = getBaseUrlForCommission();
  return new Promise((resolve, reject) => {
    const token = getToken() || "";
    // data._showLoading为false则关闭loading，其他值都为打开
    const _showLoading = data._showLoading === false ? false : true;
    if (_showLoading === false) {
      delete data._showLoading;
    }
    // data.showToast为ftrue则提示返回的message，其他值都关闭
    const _showToast = data._showToast === true ? true : false;
    if (_showToast === true) {
      delete data._showToast;
    }
    if (_showLoading) {
      store.commit("SHOW_LOADING", "");
    }
    // 开始请求
    uni.request({
      url: baseUrl + `${path}`,
      method,
      data,
      timeout: 20000,
      header: {
        Authorization: token,
        // #ifdef MP-TOUTIAO
        source: "tiktok",
        // #endif
        // #ifdef MP-WEIXIN
        source: "wxapp",
        // #endif
        encrypt: getEncryptStr(), // 加密
        "content-type": "application/json"
      },
      success: (res) => {
        if (res.statusCode == 200) {
          if (res.data.code === -1) {
            uni.showModal({
              title: "提示",
              content: res.data.message,
              showCancel: false,
              success: () => {
                if (!noDirect) {
                  res.data.url
                    ? uni.redirectTo({
                      url: res.data.url,
                      fail: () => {
                        uni.switchTab({
                          url: res.data.url,
                        });
                      },
                    })
                    : uni.navigateBack();
                  reject(res.data);
                } else {
                  reject(res.data);
                }
              },
            });
          } else if (res.data.code === 500) {
            // 错误信息一般默认展示，特殊情况通过store控制
            if (!store.state.hideErrorMessage) {
              uni.showToast({ title: res.data.message, icon: "none" });
            }
            reject(res.data);
          } else if (res.data.code === 303) {
            // 登录失效
            store.commit("LOGOUT");
            getCurrentPages().length > 1
              ? uni.redirectTo({
                url: "/pages/auth/index",
              })
              : uni.navigateTo({
                url: "/pages/auth/index",
              });
            reject(res.data);
          } else if (res.data.code === 404) {
            uni.showToast({
              title: res.data.message || "请求错误",
              icon: "none",
            });
            reject(res.data);
          } else if (res.data.code === 0) {
            // 请求成功
            if (_showToast && (res.message || res.data.message)) {
              uni.showToast({
                title: res.message || res.data.message,
                icon: "none",
              });
            }
            resolve(res.data.data);
          } else if (res.data.code === 666) {
            uni.reLaunch({
              url: `/other/update/index?version=${res.data.data.upgrade_versions}&desc=${res.data.data.upgrade_desc}`,
            });
          } else {
            reject(res.data);
          }
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        console.error("接口请求失败:", err);
        reject(err);
      },
      complete: () => {
        if (_showLoading) {
          store.commit("HIDE_LOADING");
        }
      },
    });
  });
};

export default newRequest;
