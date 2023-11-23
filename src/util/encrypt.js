var MD5 = require("md5.js");

// 生成指定长度的随机字符串
const randomString = (len) => {
  const newLen = len || 10;
  const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
  const maxPos = $chars.length;
  let pwd = "";
  for (let index = 0; index < newLen; index++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

const getEncryptStr = () => {
  // 加密参数
  const sign = {
    timestamp: parseInt(new Date().valueOf() / 1000), // 10位时间戳
    salt: randomString(), // 10位随机字符串
    signtype: "CINEMASIGN", // 写死
  };
  // 逗号隔开
  const baseEncryptStr = `${sign.timestamp},${sign.salt},${sign.signtype}`;
  // 加密字符
  const signnEncryptStr =
    `key=${sign.timestamp}${sign.salt}${sign.signtype}&salt=${sign.salt}&signtype=${sign.signtype}&timestamp=${sign.timestamp}`.toUpperCase();
  return `${baseEncryptStr},${new MD5()
    .update(signnEncryptStr)
    .digest("hex")}`.toUpperCase();
};

export { randomString, getEncryptStr };
