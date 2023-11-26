import { getToken } from "@/util";
import { getBaseUrl } from "@/util/base";
import { getEncryptStr } from "@/util/encrypt";

import store from "@/store";

const request = function (path, data = {}, method = "GET", noDirect = false) {
  const baseUrl = getBaseUrl();
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
    // 新版分销：如果存在父级id，那么所有接口都带过去
    if (store.state.sales_partner_id) {
      data.partner_id = store.state.sales_partner_id;
    }
    // 开始请求
    uni.request({
      url: baseUrl + `${path}`,
      method,
      data,
      timeout: 20000,
      header: {
        source: "tiktok",
        Authorization: token,
        encrypt: getEncryptStr(), // 加密
        "content-type": "application/json",
      },
      success: (res) => {
        if (res.statusCode == 200) {
          if (res.data.code === 401 || res.data.code === 403) {
            // 登录失效
            uni.showToast({
              title: "登陆失效",
              icon: "none",
            });
            store.commit("LOGOUT");
            getCurrentPages().length > 1
              ? uni.redirectTo({
                  url: "/pages/auth/index",
                })
              : uni.navigateTo({
                  url: "/pages/auth/index",
                });
            reject(res.data);
          } else if (
            res.data.code === 404 ||
            res.data.code === 500 ||
            res.data.code === 405 ||
            res.data.code === 410
          ) {
            uni.showToast({
              title: res.data.message || "请求失败",
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

export default request;
