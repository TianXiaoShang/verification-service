import request from "@/services/request.service";
import store from "../store";
import { BASE_URL, NEW_BASE_URL } from "@/services/environment.service";
import { setToken, setUserInfo } from "./index";

const setInfo = (member) => {
  if (!member) {
    return;
  }
  const ttToken = member.token_tik || "";
  if (ttToken) {
    setToken(ttToken);
  }
  setUserInfo(member || {});
};

const login = (onlyGetCode = false) => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: "toutiao", // 使用头条登录
      success: (loginRes) => {
        if (onlyGetCode) {
          resolve(loginRes.code);
          return;
        }
        request("login.index", { code: loginRes.code }, "POST").then(
          (loginRes) => {
            console.log('login.index:success:', loginRes)
            setToken(loginRes.token_tik);
            request("member.index").then((res) => {
              setInfo({...res.member});
              store.commit("LOGIN", true);
              resolve(loginRes);
            });
          },
          (err) => {
            console.log('login.index:err:', err)
            reject();
            store.commit("LOGIN", false);
          }
        );
      },
      fail: () => {
        // 状态变成完成
        store.commit("LOGIN", false);
        reject();
      },
    });
  });
};

const getPhoneNumber = (res, hideToast = false) => {
  return new Promise((resolve, reject) => {
    console.log(res, '手机号授权失败');
    if (res.detail.errMsg.includes("fail")) {
      uni.showToast({
        title: "授权失败", // 大概率是拒绝授权，用户油盐不进，实在没办法
        icon: "none",
      });
      reject();
      return;
    }
    const tiktokParams = {
      iv: res.detail.iv,
      encrypt: res.detail.encryptedData,
      code: res.loginCode,
    };
    request("member.phone", tiktokParams, "POST").then(
      (res) => {
        console.log(res, 'member.phone');
        if (!res.mobile) {
          uni.showToast({
            title: "获取手机号失败",
            icon: "none",
          });
          reject();
        }
        resolve(res);
        if (!hideToast) {
          uni.showToast({
            title: "获取手机号成功",
            icon: "none",
          });
        }
      },
      () => reject()
    );
  });
};

const initCinemaConfig = async () => {
  try {
    // 获取影院信息
    const setRes = await request("set");
    store.commit("SET_SETTING", {
      ...setRes.set,
      ...(setRes.tiktok_set || {}),
    });
    // 是否有开屏广告
    if (setRes.set.open_advert && !store.state.alreadySetOpenHomeAdvert) {
      // 只设置一次
      store.commit("SET_OPEN_HOME_ADVERT", true);
      store.commit("ALREADY_SET_OPEN_HOME_ADVERT", true);
      uni.hideTabBar();
    }
    const cinemaRes = await request("cinema");
    store.commit("SET_CINEMA", cinemaRes.cinema);
    const obj = { setting: setRes.set, cinema: cinemaRes.cinema };
    uni.$emit("onInitCinemaSetting", obj);
    return obj;
  } catch (error) {
    uni.$emit("onInitCinemaSetting", false);
    return false;
  }
};

const updateUserInfo = (userInfo) => {
  return new Promise((resolve, reject) => {
    request("member.authorize", userInfo, 'POST').then(
      (res) => {
        if (res) {
          setInfo(userInfo);
          resolve();
        }
      },
      () => {
        reject();
      }
    );
  });
};

// 获取接口请求路径，微信批量分发则通过getExtConfigSync返回url字段；
const getBaseUrl = () => {
  let baseUrl = "";
  // #ifdef MP-WEIXIN
  const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
  baseUrl = extConfig.url || BASE_URL;
  // #endif

  // #ifdef MP-TOUTIAO
  const data = uni.getExtConfigSync ? uni.getExtConfigSync() : {};
  baseUrl =
    data.extConfig && data.extConfig.url ? data.extConfig.url : BASE_URL;
  // #endif
  return baseUrl;
};

// 获取新接口请求路径，微信批量分发则通过getExtConfigSync返回url字段；
const getBaseUrlForCommission = (() => {
  let baseUrl = "";
  return () => {
    if (baseUrl) {
      return baseUrl;
    } else {
      // #ifdef MP-WEIXIN
      const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
      baseUrl = extConfig.commission_url || NEW_BASE_URL;
      // #endif

      // #ifdef MP-TOUTIAO
      const data = uni.getExtConfigSync ? uni.getExtConfigSync() : {};
      baseUrl =
        data.extConfig && data.extConfig.commission_url
          ? data.extConfig.commission_url
          : NEW_BASE_URL;
      // #endif
      return baseUrl;
    }
  };
})();

export {
  login,
  updateUserInfo,
  getPhoneNumber,
  initCinemaConfig,
  getBaseUrl,
  getBaseUrlForCommission,
  // getCinemaId,
};
