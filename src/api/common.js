/**
 * 注！！！只有重复使用的接口才会在api进行抽离定义，否则会直接写在页面内；
 */

import request from "@/services/request.service";

const getMember = (openid, showLoading) => {
  return request("member", { openid: openid, _showLoading: showLoading });
};
export { getMember };
