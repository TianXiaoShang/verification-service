const orderStatus = (status, pre_create, isCouponMode) => {
  status = parseInt(status);
  let statusStr = '';
  switch (status) {
    case 1:
      statusStr = (!isCouponMode && pre_create == 0) ? (isCouponMode ? '待支付' : "待预约") : (isCouponMode ? '待支付' : "等待商家确认");
      break;
    case 2:
      statusStr = isCouponMode ? '支付成功' : '预约成功';
      break;
    case 3:
      statusStr = "订单取消中";
      break;
    case 4:
      statusStr = "订单已取消";
      break;
    case 11:
      statusStr = (!isCouponMode && pre_create == 0) ? '预约已取消' : (isCouponMode ? '订单失败' : '预约失败');
      break;
    default:
      break;
  }
  return statusStr;
};

export { orderStatus };
