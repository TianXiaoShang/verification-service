<template>
    <div class="page-box bg-gray-bg box-border">
        <loading />
        <!-- 倒计时区域 -->
        <div v-if="order.id" :style="{
            background: order.status == 2 ? '#2ACB95' :
                order.status == 1 ? '#FF545C' :
                    order.status == 3 ? '#FF9933' :
                        order.status == 4 || order.status == 11 ? '#CCCCCC' : '',
        }" class="p-30px flex flex-col justify-center items-center text-white relative">
            <div class="text-16 font-semibold">
                订单{{ orderStatus(order.status, order.pre_create) }}
                <span v-if="order.status == 1 && order.pre_create == 1"
                    class="ml-8px absolute right-10px bottom-10px text-12px underline underline-offset-2" @click="getData">刷新状态</span>
            </div>
            <div class="text-16 font-semibold" v-if="order.status == 1">剩余支付时间 {{ payTime }}</div>
            <div class="text-14px mt-6px" v-if="refund && (order.status == 3 || order.status == 4)">{{ refund.reason }}
            </div>
            <div class="text-14px mt-6px" v-if="refund && refund.type == 2 && order.status == 3">
                将会在1-2个工作日内会退回到原账户</div>
        </div>
        <div v-else>
            <u-skeleton rows="0" titleWidth="100%" titleHeight="82" title :title="true" loading></u-skeleton>
        </div>

        <!-- 中间内容 -->
        <div class="p-20px box-border" :class="{
            'pb-90px': order.status == 1,
            'pb-90px': is_comment == 1 && !isWx && order.is_evaluate == 0,
            'pb-20px': order.status != 1 && !(is_comment == 1 && !isWx && order.is_evaluate == 0)
        }" v-if="order.order_no">
            <!-- 待支付-订单信息 -->
            <div class="bg-white p-20px mb-20px rounded-10px" v-if="order.status == 1">
                <div class="font-semibold text-gray-333 text-16">{{ order.order_no }}</div>
                <div class="mt-10px font-normal text-gray-999 text-14">{{ order.cinema_title }}</div>
                <u-divider></u-divider>
                <div class="font-semibold text-gray-333 text-16 mt-20px flex items-center">{{ order.film_title }}
                </div>
                <div class="mt-10px font-normal text-gray-999 text-14">
                    {{ order.hall_title }} | {{ moment(order.entrance_time * 1000).format('YYYY-MM-DD HH:mm') }}
                </div>
                <div class="mt-5px font-normal text-gray-999 text-14">
                    {{ order.seats.map(el => el.name).join('、') }}
                </div>
            </div>

            <!-- 非待支付-订单信息 -->
            <div class="bg-white p-20px mb-20px rounded-10px" v-if="order.status != 1">
                <div class="font-semibold text-gray-333 text-16 flex items-center">
                    {{ order.film_title }}
                </div>
                <div class="font-normal mt-5px text-gray-999 text-14">
                    {{ order.hall_title }}
                </div>
                <div class="font-normal mt-5px text-gray-999 text-14">
                    {{ getDateTime() }}
                </div>
                <div class="mt-5px font-normal text-gray-999 text-14">
                    {{ order.seats.map(el => el.name).join('、') }}
                </div>
                <u-divider></u-divider>
                <!-- 购票信息 -->
                <div class="font-semibold text-gray-333 text-16">购票人</div>
                <div class="mt-10px font-normal text-gray-999 text-14">{{ order.realname }} {{ order.mobile }}</div>
                <u-divider></u-divider>
                <template v-if="order.is_autonym == 1">
                    <div class="font-semibold text-gray-333 text-16">观演人</div>
                    <div class="mt-10px font-normal text-gray-999 text-14" v-for="(item, index) in order.autonyms"
                        :key="index">
                        <div>
                            {{ item.realname }} {{ item.idcard }}
                            <span class="ml-10px">[{{ item.idcard_type }}]</span>
                        </div>
                    </div>
                    <u-divider></u-divider>
                </template>
                <div class="text-gray-999 text-14 mt-10px">配送方式</div>
                <template v-if="order.ticket_mode == 1">
                    <div class="mt-10px flex justify-between items-center">
                        <div class='font-semibold text-gray-333 text-16 '>邮寄票</div>
                    </div>
                    <div class="mt-10px font-normal text-gray-999 text-14">{{ order.province }} {{ order.city }} {{
                        order.area }} {{ order.detail }}</div>
                </template>
                <template v-else>
                    <div class="font-semibold text-gray-333 text-16 mt-10px">电子票</div>
                    <!-- <div class="mt-10px font-normal text-gray-999 text-14">支付成功后，无需取票，前往票夹查看入场凭证</div> -->
                </template>
                <template v-if="order.ticket_mode == 1 && order.is_pay == 1">
                    <u-divider></u-divider>
                    <div class="text-gray-999 text-14 mt-10px">物流信息</div>
                    <div class="font-semibold text-gray-333 text-16 mt-10px">{{ order.is_express == 1 ? '已发货' : '未发货' }}
                    </div>
                    <div class="mt-10px font-normal text-gray-999 text-14" v-if="order.is_express == 1">
                        <div>快递公司： {{ order.express_company }}</div>
                        <div class="flex">物流单号： {{ order.express_no }}
                            <div @click="onCopy(order.express_no)" class="ml-20px text-blue">复制</div>
                        </div>
                    </div>
                </template>
            </div>

            <div class="p-20px p-20px mb-20px rounded-10px flex justify-center text-white items-center"
                v-if="order.status == 2" @click="toTicket" style="background: #2ACB95;">
                <u-icon name="grid" color="#fff" size="26" class="mr-5px"></u-icon>查看门票信息
            </div>

            <div class="bg-white p-20px pt-10px rounded-10px">
                <!-- 订单共计 -->
                <div class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">票品原价</span>
                    <span class="font-normal">{{ order.total }}</span>
                </div>
                <!-- 详细信息 -->
                <div v-if="order.charge.charge_open == 1"
                    class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">{{ order.charge.charge_name }}</span>
                    <span class="font-normal">￥{{ order.charge.charge_price }}</span>
                </div>
                <div v-if="order.ticket_mode == 1" class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">运费</span>
                    <span class="font-normal">{{ order.express_fee }}</span>
                </div>
                <div v-if="order.is_coupon == 1" class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">优惠券</span>
                    <span class="font-normal">{{ order.coupon_price }}</span>
                </div>
                <div v-if="order.is_level == 1" class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">会员折扣</span>
                    <span class="font-normal">{{ order.level_discounts }}折</span>
                </div>
                <div v-if="order.part_discount && order.part_discount !== '0.00' && order.part_discount !== '0'"
                    class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">套票折扣</span>
                    <span class="font-normal">-{{ order.part_discount }}元</span>
                </div>
                <div v-if="order.is_pay > 0" class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">实际支付</span>
                    <span class="font-normal">{{ order.pay_price }}</span>
                </div>
                <div v-if="order.is_pay > 0" class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">支付方式</span>
                    <span class="font-normal">{{ order.pay_type_str || '-' }}</span>
                </div>
                <!-- 邮寄票类型 -->
                <!-- <div v-if="ticket_explain" class="flex justify-between py-15px items-center text-gray-33 text-14"
                    style="border-bottom: 1px solid #eee;">
                    <span class="font-semibold">{{ ticket_explain.title }}</span>
                    <span class="font-normal">{{ ticket_explain.desc || '-' }}</span>
                </div> -->
                <!-- 订单信息 -->
                <div class="font-semibold pt-15px text-gray-333 text-14px" style="border-top: 1px solid #eee;">订单信息
                </div>
                <div class="mt-10px font-normal text-gray-999 text-14px flex items-center justify-between">
                    <span>订单编号：{{ order.order_no }}</span>
                    <span class="text-blue" @click="onCopy(order.order_no)">复制</span>
                </div>
                <div class="mt-10px font-normal text-gray-999 text-14px">创建时间：{{
                    moment(order.create_time *
                        1000).format('YYYY-MM-DD HH:mm:ss')
                }}</div>
                <div class="mt-10px font-normal text-gray-999 text-14px" v-if="order.status == 2">支付时间：{{
                    moment(order.pay_time *
                        1000).format('YYYY-MM-DD HH:mm:ss')
                }}</div>

                <div class="flex justify-between items-center">
                    <div class="h-26px mt-15px w-100px inline-block text-white rounded-13px text-14px flex justify-center items-center px-10px relative"
                        v-if="order.tiktoksop_order_id" style="border: 1px solid #7e5e49; color: #7e5e49;">
                        IM客服
                        <button class="z-9 absolute left-0 right-0 top-0 bottom-0 opacity-0" open-type="im" @im="imCallback"
                            data-im-type="order" @error="onimError" data-biz-line="1" :data-im-id="setting.service_order"
                            :data-order-id="order.tiktoksop_order_id">
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 骨架屏 -->
        <div v-else class="p-20px pb-122px box-border">
            <div class="mt-10px">
                <u-skeleton rows="3" titleWidth="100%" titleHeight="100" title :title="true" loading></u-skeleton>
            </div>
            <div class="mt-20px">
                <u-skeleton rows="8" titleWidth="100%" titleHeight="50" title :title="true" loading></u-skeleton>
            </div>
        </div>

        <!-- 底部按钮 -->
        <div v-if="order.status == 1 && order.pre_create == 0"
            class="fixed z-998 pb-20px bottom-0 h-70px flex items-center justify-center px-20px left-0 w-full box-border">
            <u-button shape="circle" size="normal"
                :customStyle="{ height: '44px', width: 'calc((100vw - 40px) / 2 - 8px)', marginRight: '8px', border: '1px solid #FF545C', color: '#FF545C' }"
                color="#fff" text="取消预约" :disabled="btnLoading" @click="cancelOrder">
            </u-button>
            <u-button shape="circle" size="normal"
                :customStyle="{ height: '44px', width: 'calc((100vw - 40px) / 2 - 8px)', margin: 0 }"
                color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="去预约" @click="toPay">
            </u-button>
        </div>
    </div>
</template>

<script>
import { orderStatus } from '../util';
import moment from 'moment';
export default {
    data() {
        return {
            order_id: '',
            order: {},
            ticket_explain: null,
            extra: {},
            refund: {},
            timer: null,
            payTime: '',
            orderStatus,
            btnLoading: false,
            is_comment: 0,
            no_refund: false,
            loadFlag: false,
            member_refund: 0, // 1 可退款  0 不可退款
            tiktok_refund: 0,  // 抖音   1 可退款  0 不可退款
        }
    },
    onLoad(options) {
        this.order_id = options.order_id;
        this.cinema_id = options.cinema_id;
        console.log(options, 'order_idorder_idorder_idorder_id')
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.getData();
            setTimeout(() => {
                this.loadFlag = true;
            }, 100)
        });
    },
    onShow() {
        if (this.loadFlag) {
            // 确保已经登录完成
            this.waitLogin().then(() => {
                this.getData();
            });
        }
    },
    methods: {
        getDateTime() {
            const start = this.moment(this.order.entrance_time * 1000).format('YYYY-MM-DD');
            const end = this.moment(this.order.end_time * 1000).format('YYYY-MM-DD');
            // 同一天直接展示entrance_time，否则展示时间段
            if (start === end) {
                return this.moment(this.order.entrance_time * 1000).format('YYYY/MM/DD HH:mm');
            }
            return this.moment(this.order.entrance_time * 1000).format('YYYY/MM/DD HH:mm') + ' - ' + this.moment(this.order.end_time * 1000).format('YYYY/MM/DD HH:mm');
        },
        checkStatus() {
            return new Promise((resolve, reject) => {
                this.getData().then(() => {
                    if (this.order.status == 1 && this.order.pre_create == 0) {
                        resolve();
                    } else {
                        reject();
                    }
                })
            })
        },
        cancelOrder() {
            uni.showModal({
                title: '温馨提示',
                content: '是否要取消该预约订单',
                success: (result) => {
                    if (result.confirm) {
                        this.btnLoading = true;
                        this.checkStatus().then(() => {
                            this.request("order.cancel", {
                                order_id: this.order_id,
                                cinema_id: this.cinema_id
                            }, 'POST').then(() => {
                                uni.showToast({ title: '取消预约成功', icon: 'none' });
                                setTimeout(() => {
                                    this.getData().then(() => {
                                        this.btnLoading = false;
                                    })
                                }, 800);
                            }, () => {
                                this.btnLoading = false;
                            })
                        })
                    }
                },
                fail: () => { },
                complete: () => { }
            });
        },
        toPay() {
            this.checkStatus().then(() => {
                this.toPath('/order/pay/index?order_id=' + this.order_id + '&cinema_id=' + this.cinema_id)
            })
        },
        toTicket() {
            this.toPath('/order/ticket/index?order_id=' + this.order_id + '&cinema_id=' + this.cinema_id)
        },
        getData() {
            return this.request("order.show", {
                order_id: this.order_id,
                cinema_id: this.cinema_id
            }).then(res => {
                this.order = res.order;
                this.refund = res.refund;
                const time = res.order.expire_time;
                if (time && this.order.status == 1 && this.order.pre_create == 0) {
                    this.getExpireTime(time);
                    this.timer && clearInterval(this.timer)
                    this.timer = setInterval(() => {
                        this.getExpireTime(time);
                    }, 1000);
                } else {
                    this.timer && clearInterval(this.timer)
                }
                if (this.order.status == 1 && this.order.pre_create == 1) {
                    this.request('booking.index' + '&cinema_id=' + this.cinema_id, { order_id: this.order_id, _showErrorToast: false }, 'POST').then(payRes => {
                        console.log(payRes, 'payRes')
                    })
                }
                return this.order;
            })
        },
        getExpireTime(time) {
            const t = (moment(time * 1000).diff(moment())) / 1000;
            let m = Math.floor(t / 60);
            let s = Math.floor(t % 60);
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            this.payTime = m + ':' + s;
            if (t <= 0) {
                this.getData();
            }
        },
    },
    onUnload() {
        this.timer && clearInterval(this.timer)
    },
};
</script>


<style lang="scss" scoped></style>