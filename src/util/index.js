import store from "../store";
import moment from "moment";
import { getStorage, setStorage, removeStorage } from "./storage";

// 获取token, 先取store，再去localStorage
const tokenKey = "TOKEN";
const getToken = function () {
  const storeToken = store.state.token;
  const localToken = getStorage(tokenKey);
  if (storeToken) {
    return storeToken;
  } else {
    store.commit("SET_TOKEN", localToken);
    return localToken;
  }
};

const setToken = function (token) {
  setStorage(tokenKey, token);
  store.commit("SET_TOKEN", token);
};

const clearToken = function () {
  removeStorage(tokenKey);
  store.commit("SET_TOKEN", "");
};

// userInfo 不从本地取，每次登录都会重新获取，之后从store取，写在本地暂时没啥用
const userInfoKey = "USER_INFO";
const setUserInfo = function (userInfo) {
  if (!userInfo) {
    return;
  }
  setStorage(userInfoKey, JSON.stringify(userInfo)); // 写在本地暂时没啥用
  store.commit("UPDATE_USERINFO", userInfo);
};

const clearUserInfo = function () {
  removeStorage(userInfoKey);
  store.commit("UPDATE_USERINFO", {});
};

const query2Obj = (str) => {
  if (typeof str != "string") {
    return str;
  }
  if (str.indexOf("=") < 0) {
    return {};
  }
  const oldArr = str.split("&"),
    obj = {};
  oldArr.forEach((item) => {
    if (item.indexOf("=") > -1) {
      const arr = item.split("=");
      obj[arr[0]] = arr[1];
    }
  });
  return obj;
};

const options2mid = (options) => {
  if (!options.query) {
    return "";
  }
  const scene = decodeURIComponent(options.query.scene);
  if (scene) {
    const obj = query2Obj(scene);
    return (obj && obj.mid) ? obj.mid : "";
  } else {
    return "";
  }
};

// 获取状态栏尺寸，用于自定义顶部导航栏
const getStatusBarInfo = (function () {
  let info;
  let statusBarHeight;
  let menuButtonInfo;
  let navBarHeight;
  let contentWidth;

  return function () {
    // 实现函数缓存
    if (!info) {
      // 获取手机系统信息
      info = uni.getSystemInfoSync();
      // 设置状态栏高度（H5顶部无状态栏小程序有状态栏需要撑起高度）
      statusBarHeight = info.statusBarHeight;
      menuButtonInfo = uni.getMenuButtonBoundingClientRect();
      // 胶囊高度 + (胶囊顶部高度 - 状态栏内的高度)【胶囊上方到状态栏到间隙*2，保证上下对称】 * 2 = 导航栏的高度
      navBarHeight =
        menuButtonInfo.height + (menuButtonInfo.top - info.statusBarHeight) * 2;
      contentWidth = menuButtonInfo.left;
    }
    return {
      statusBarHeight,
      navBarHeight,
      contentWidth,
    };
  };
})();

// 拨打电话
const sendCall = (number) => {
  if (!number) {
    uni.showToast({
      title: "无号码",
      icon: "none",
    });
    return;
  }
  uni.makePhoneCall({
    phoneNumber: number,
  });
};
// 打开地图
const openMap = (data) => {
  const ops = { lat: "", lng: "", address: "" };
  ops.lat = data.lat;
  ops.lng = data.lng;
  ops.address = data.address;
  uni.openLocation({
    latitude: Number(ops.lat ? ops.lat : store.state.cinema.lat),
    longitude: Number(ops.lng ? ops.lng : store.state.cinema.lng),
    scale: 15,
    name: (data && data.title) || store.state.cinema.title,
    address: ops.address ? ops.address : store.state.cinema.address,
  });
};

// 常用富文本解析
const parseRichText = (str) => {
  str = str.replace(/&nbsp;/g, " ");
  str = str.replace(/&quot;/g, "'");
  str = str.replace(/&amp;/g, "&");
  str = str.replace(/&lt;/g, "<");
  str = str.replace(/&gt;/g, ">");
  str = str.replace(/&#8226;/g, "•");
  str = str.replace(/white-space: normal;/g, "");
  str = str.replace(/<p/g, "<p style='margin: 0;'");
  return str;
};

const getSafeAreaInsets = () => {
  const systemInfo = uni.getSystemInfoSync();
  const safeAreaInsets =
    systemInfo.platform === "ios" || systemInfo.platform === "devtools"
      ? systemInfo.safeAreaInsets.bottom
      : 0;
  return safeAreaInsets;
};

// 计算两个日期的相差时间（天 - 时 - 分）
const calcDateDiff = (date1, date2) => {
  const newDate1 = moment(date1);
  const newDate2 = moment(date2);
  // 差的秒数
  const diff = Math.abs(newDate1.diff(newDate2, "second"));
  // const diff = Math.abs(newDate1.diff(newDate2, "minute"));
  // 一天的秒数
  const OneDay = 60 * 24 * 60;
  // 一小时的分钟
  const OneHour = 60;

  let day = Math.floor(diff / OneDay);
  let hour = Math.floor((diff - day * OneDay) / 60 / 60);
  let min = Math.floor(((diff - day * OneDay) / 60) % 60);
  let sec = Math.floor((diff - day * OneDay) % 60);
  hour = hour < 10 ? "0" + hour : hour;
  min = min < 10 ? "0" + min : min;
  sec = sec < 10 ? "0" + sec : sec;
  // 超过一天
  if (diff >= OneDay) {
    return {
      days: day < 10 ? ('0' + day) : day, 
      h: hour,
      m: min,
      s: sec,
    };
    // return `${day}天${hour}小时${min}分`
  }
  // 超过一个小时，不足一天
  if (diff >= OneHour) {
    return {
      h: hour,
      m: min,
      s: sec,
    };
    // return `${hour}小时${min}分`
  }
  // 小于一小时
  if (diff < OneHour) {
    return {
      m: min,
      s: sec,
    };
    // return `${min}分`
  }
};

export {
  setToken,
  clearToken,
  getToken,
  setUserInfo,
  clearUserInfo,
  query2Obj,
  options2mid,
  getStatusBarInfo,
  sendCall,
  openMap,
  parseRichText,
  getSafeAreaInsets,
  calcDateDiff,
};
