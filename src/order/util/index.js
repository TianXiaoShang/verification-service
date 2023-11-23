const orderStatus = (status) => {
  status = parseInt(status);
  var arr = ["", "待支付", "已付款", "退款中", "已退款", "已取消"];
  status == 11 ? (status = 5) : "";
  return arr[status];
};

export { orderStatus };
