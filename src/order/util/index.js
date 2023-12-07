const orderStatus = (status, pre_create) => {
  status = parseInt(status);
  let statusStr = '';
  switch (status) {
    case 1:
      statusStr = pre_create == 0 ? "待预约" : "等待预约(待商家确认)";
      break;
    case 2:
      statusStr = '预约成功';
      break;
    case 3:
      statusStr = "预约取消中";
      break;
    case 4:
      statusStr = "预约已取消";
      break;
    case 11:
      statusStr = pre_create == 0 ? '预约已取消' : '预约失败';
      break;
    default:
      break;
  }
  return statusStr;
};

export { orderStatus };
