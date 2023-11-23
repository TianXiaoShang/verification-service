import store from "@/store";

const savePos = (result) => {
  store.commit("SET_POS", result);
};

// 进入设置页让用户打开授权
const handlerLocationFail = () => {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: "系统提示",
      content: "小程序需要获取您的当前位置信息",
      success: (result) => {
        if (result.confirm) {
          uni.openSetting({
            success: (result) => {
              // #ifdef MP-TOUTIAO
              if (!result.authSetting["scope.userLocation"]) {
                uni.showToast({
                  title: "位置信息未授权", // 用户油盐不进，实在没办法
                  icon: "none",
                });
                reject();
              } else {
                // 用户打开了开关则重新获取一次微信信息
                getLocationPos(true).then((result) => {
                  resolve(result);
                });
              }
              // #endif

              // #ifdef MP-WEIXIN
              if (!result.authSetting["scope.userFuzzyLocation"]) {
                uni.showToast({
                  title: "位置信息未授权",
                  icon: "none",
                });
                reject();
              } else {
                // 用户打开了开关则重新获取一次微信信息
                getLocationPos(true).then((result) => {
                  resolve(result);
                });
              }
              // #endif
            },
          });
        } else {
          // 用户取消
          uni.showToast({
            title: "取消位置信息授权",
            icon: "none",
          });
          reject();
        }
      },
    });
  });
};

// 获取位置信息
// flag表示是从设置界面返回来重新获取的，如果此时用户同意了但是还是没有获取到权限（可能是app客户端本身没有授权），那就算了
const getLocationPos = (flag) => {
  return new Promise((resolve, reject) => {
    // 微信头条api不一样，精度也不一样，逻辑同理
    // #ifdef MP-TOUTIAO
    uni.getLocation({
      success: (result) => {
        savePos(result);
        resolve(result);
      },
      fail: (err) => {
        if (flag) {
          uni.showToast({
            title: "未获取到地里位置信息",
            icon: "none",
          });
          return;
        }
        // 用户拒绝了，则唤起弹窗提示
        handlerLocationFail().then(
          (result) => {
            savePos(result);
            resolve(result);
          },
          () => {
            reject();
          }
        );
      },
    });
    // #endif

    // #ifdef MP-WEIXIN
    wx.getFuzzyLocation({
      success: (result) => {
        savePos(result);
        resolve(result);
      },
      fail: (err) => {
        if (flag) {
          uni.showToast({
            title: "未获取到地里位置信息",
            icon: "none",
          });
          return;
        }
        handlerLocationFail().then(
          (result) => {
            savePos(result);
            resolve(result);
          },
          () => {
            reject();
          }
        );
      },
    });
    // #endif
  });
};

// 按照正球形计算两个位置坐标的直线距离
const distance = (la1, lo1, la2, lo2) => {
  var La1 = (la1 * Math.PI) / 180.0;
  var La2 = (la2 * Math.PI) / 180.0;
  var La3 = La1 - La2;
  var Lb3 = (lo1 * Math.PI) / 180.0 - (lo2 * Math.PI) / 180.0;
  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(La3 / 2), 2) +
          Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)
      )
    );
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  s = s.toFixed(2);
  const _distance = parseFloat(s) < 1 ? parseFloat(s) * 1000 + "m" : s + "km";
  return _distance;
};

// 获取距离的所有流程
const getDistance = (lat, lng) => {
  return new Promise((resolve, reject) => {
    if (store.state.userLocation) {
      const dis = distance(
        lat || store.state.cinema.lat,
        lng || store.state.cinema.lng,
        store.state.userLocation.latitude,
        store.state.userLocation.longitude
      );
      resolve(dis);
    } else {
      getLocationPos().then(
        (res) => {
          const dis = distance(
            store.state.cinema.lat,
            store.state.cinema.lng,
            res.latitude,
            res.longitude
          );
          resolve(dis);
        },
        () => reject()
      );
    }
  });
};

export { getLocationPos, getDistance };
