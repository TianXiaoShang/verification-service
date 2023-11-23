// 进入设置页让用户打开授权
const handlerSaveImageFail = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: "系统提示",
      content: "请授权保存图片到您的相册",
      success: (result) => {
        if (result.confirm) {
          uni.openSetting({
            success: (result) => {
              // #ifdef MP-TOUTIAO
              if (!result.authSetting["scope.album"]) {
                uni.showToast({
                  title: "保存图片到相册权限未授权",
                  icon: "none",
                });
                reject();
              } else {
                // 用户打开了开关则重新获取一次微信信息
                handleSaveImageToPhotosAlbum(filePath).then(
                  () => resolve(),
                  () => reject()
                );
              }
              reject();
              // #endif

              // #ifdef MP-WEIXIN
              if (!result.authSetting["scope.writePhotosAlbum"]) {
                uni.showToast({
                  title: "保存图片到相册权限未授权",
                  icon: "none",
                });
                reject();
              } else {
                // 用户打开了开关则重新获取一次微信信息
                handleSaveImageToPhotosAlbum(filePath).then(
                  () => resolve(),
                  () => reject()
                );
              }
              // #endif
            },
          });
        } else {
          // 用户取消
          uni.showToast({
            title: "拒绝授权，保存失败",
            icon: "none",
          });
          reject();
        }
      },
    });
  });
};

const handleSaveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        uni.showToast({
          title: "保存图片成功",
          icon: "success",
        });
        resolve();
      },
      fail: () => {
        handlerSaveImageFail(filePath).then(
          () => {
            resolve();
          },
          () => reject()
        );
      },
    });
  });
};

const downloadImageFileToAlbum = (url) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: "图片下载中...",
    });
    uni.downloadFile({
      url,
      success: (res) => {
        uni.hideLoading();
        handleSaveImageToPhotosAlbum(res.tempFilePath).then(
          () => resolve(),
          () => reject()
        );
      },
    });
  });
};

export { downloadImageFileToAlbum, handleSaveImageToPhotosAlbum };
