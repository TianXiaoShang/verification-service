<template>
    <div class="page-box bg-gray-bg box-border p-20px box-border relative">
        <loading />
        <div class="is-bg"></div>
        <div class="relative z-999" v-if="order.id">
            <!-- 电影 -->
            <div class="p-15px rounded bg-white flex justify-between items-center">
                <div>
                    <image class="w-92px h-126px mr-15px rounded overflow-hidden" :src="order.film_logo" />
                </div>
                <div class="flex-1">
                    <div class="text-16px text-gray-333 font-semibold leading-5">{{ order.film_title }}</div>
                    <div class="text-14px text-gray-999 font-normal mt-15px">{{
                        moment(order.entrance_time *
                            1000).format('YYYY-MM-DD HH:mm')
                    }}</div>
                    <div class="text-14px text-gray-999 font-normal mt-10px">{{ navigation.title }}</div>
                    <div class="text-14px text-gray-999 font-normal mt-10px">{{ order.hall_title }}</div>
                    <div class="text-14px text-white font-normal mt-10px bg-red rounded-14px w-110px py-5px text-center"
                        @click="toDetail">
                        查看订单详情</div>
                </div>
            </div>
            <!-- 二维码 -->
            <div class="mt-10px p-20px pt-10px rounded bg-white" v-if="tabsDataList && tabsDataList.length">
                <div class="flex is-code justify-center">
                    <u-tabs :current="tabIndex" :list="tabsDataList" @click="changeTab" lineColor="#FF545C"
                        :itemStyle="{ height: '42px' }"
                        :activeStyle="{ color: '#333', fontWeight: 'bold', transform: 'scale(1.05)' }"
                        :inactiveStyle="{ color: '#999999', transform: 'scale(1)' }"></u-tabs>
                </div>
                <!-- 取票 -->
                <div class="" v-if="global.show_ticketscode != 1 && tabIndex === 0">
                    <div class="py-20px relative" style="border-top: 1px solid #eee">
                        <div class="flex justify-center items-center relative">
                            <!-- is_ticket是整体的取票状态，status是单个的扫码入场状态 -->
                            <div :style="{ opacity: order.take_ticket_status == 0 ? '1' : '0.07' }">
                                <!-- 组件地址 https://ext.dcloud.net.cn/plugin?id=39 -->
                                <tki-qrcode ref="qrcode" :cid="order.dynamic" :val="order.dynamic" :size="150" unit="px"
                                    :background="'#ffffff'" :foreground="'#000000'" :onval="true" :loadMake="true"
                                    :showLoading="true" />
                            </div>
                            <div v-if="order.take_ticket_status != 0"
                                class="absolute flex flex-col justify-center items-center left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <image class="w-55px h-55px" :src="`../static/${statusOrder[order.take_ticket_status]}.png`" />
                                <div class="mt-8px text-16px font-semibold" style="color: #63c899">
                                    {{ statusOrderText[order.take_ticket_status] }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col justify-center items-center text-14px mt-10px">
                        <div class="text-gray-999">{{ ticket.length }}张票</div>
                        <div class="flex items-center text-gray-333 font-normal mt-10px">
                            <span
                                :style="{ 'text-decoration': order.take_ticket_status == 1 ? 'line-through;' : 'none' }">票码：{{
                                    order.dynamic
                                }}</span>
                            <span @click="onCopy(order.dynamic)"
                                class="px-10px h-26px flex items-center justify-center rounded-25px ml-20px border border-solid border-color-333">复制</span>
                        </div>
                        <div class="flex justify-center text-13px font-semibold text-red mt-12px">
                            二维码与票码为入场凭证，请勿泄露
                        </div>
                    </div>
                </div>
                <!-- 扫码入场 -->
                <div class=""
                    v-if="global.show_ticketscode != 1 ? tabIndex === 1 : tabIndex === 0 && order.ticket_mode != 1">
                    <div class="py-20px relative" style="border-top: 1px solid #eee">
                        <swiper v-if="ticket.length" :circular="false" :indicator-dots="false" :current="ticketCurrent"
                            @animationfinish="changeFinish" :autoplay="false" :duration="500">
                            <swiper-item v-for="(item, index) in ticket" :key="index">
                                <div class="flex justify-center items-center relative">
                                    <div :style="{ opacity: item.status <= 1 ? '1' : '0.07' }">
                                        <!-- 组件地址 https://ext.dcloud.net.cn/plugin?id=39 -->
                                        <tki-qrcode ref="qrcode" :cid="item.id" :val="item.dynamic" :size="150" unit="px"
                                            :background="'#ffffff'" :foreground="'#000000'" :onval="true" :loadMake="true"
                                            :showLoading="true" />
                                    </div>
                                    <div
                                        class="absolute flex flex-col justify-center items-center left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <image class="w-55px h-55px" :src="`../static/${statusSign[item.status]}.png`" />
                                        <div class="mt-8px text-16px font-semibold" style="color: #63c899">
                                            {{ statusSignText[item.status] }}</div>
                                    </div>
                                </div>
                            </swiper-item>
                        </swiper>
                        <div v-if="(ticket.length > 1)"
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-25px h-25px" @click="onPrev">
                            <image class="w-full h-full" src="../static/previous-dis@2x.png" />
                        </div>
                        <div v-if="(ticket.length > 1)"
                            class="absolute right-0 top-1/2 transform -translate-y-1/2 w-25px h-25px" @click="onNext">
                            <image class="w-full h-full" src="../static/previous-nor@2x.png" />
                        </div>
                    </div>
                    <div class="flex flex-col justify-center items-center text-14px">
                        <div class="mb-8px text-gray-999 text-14px"
                            v-if="ticket[ticketCurrent] && ticket[ticketCurrent].usable_times > 1">
                            <span>共计{{ ticket[ticketCurrent].usable_times }}次</span>
                            <span class="ml-8px">剩余<span class="text-red">{{ ticket[ticketCurrent].remaining_times
                            }}</span>次</span>
                        </div>
                        <div class="text-gray-999">
                            <span class="font-semibold text-[#222] text-16px mr-5px">{{ ticket[ticketCurrent].seat_name }}</span>({{ ticketCurrent + 1 + '/' + ticket.length }})
                        </div>
                        <div class="flex items-center text-gray-333 font-normal mt-10px">
                            <span>票码：{{ ticket[ticketCurrent].dynamic }}</span>
                            <span @click="onCopy(ticket[ticketCurrent].dynamic)"
                                class="px-10px h-26px flex items-center justify-center rounded-25px ml-20px border border-solid border-color-333">复制</span>
                        </div>
                        <div class="flex justify-center text-13px font-semibold text-red mt-12px">
                            二维码与票码为入场凭证，请勿泄露
                        </div>
                    </div>
                </div>
            </div>

            <!-- 地址 -->
            <div class="rounded flex mt-10px bg-white px-15px py-20px justify-between items-center">
                <div class="text-14px font-semibold">
                    <div>{{ navigation.title }}</div>
                    <div class="font-normal mt-10px text-gray-999 leading-6">{{ navigation.address }}</div>
                </div>
                <div class="flex items-center">
                    <div class="ml-5px min-w-22px w-22px h-22px" @click="onMap">
                        <image class="w-full h-full" src="../static/go@2x.png" />
                    </div>
                </div>
            </div>
            <!-- 电话 -->
            <div class="rounded flex mt-10px bg-white px-15px py-20px justify-between items-center" v-if="phoneList.length"
                @click="showPhone = true">
                <div class="text-14px font-semibold">
                    电话客服
                    <div class="font-normal mt-10px text-gray-999 leading-6">点击拨打商户客服电话为您处理售后问题</div>
                </div>
                <div class="flex items-center">
                    <div class="ml-10px min-w-22px w-22px h-22px">
                        <image class="w-22px h-22px" src="../static/call.png" />
                    </div>
                </div>
            </div>
            <!-- 取票方式 -->
            <div class="rounded mt-10px bg-white px-15px py-20px text-14px font-semibold" v-if="ticket_explain">
                <div class="font-normal text-gray-999 leading-6">配送方式</div>
                <div class="mt-10px">{{ order.ticket_mode == 1 ? '邮寄票' : '电子票' }}</div>
                <template v-if="order.ticket_mode == 1">
                    <u-divider></u-divider>
                    <div class="text-gray-999 text-14 mt-10px">物流信息</div>
                    <div class="font-semibold text-gray-333 text-16 mt-10px">{{ order.is_express == 1 ? '已发货' : '未发货' }}
                    </div>
                    <div class="mt-10px font-normal text-gray-999 text-14" v-if="order.is_express == 1">
                        <div>快递公司： {{ order.express_company }}</div>
                        <div class="flex mt-8px">物流单号： {{ order.express_no }}
                            <div @click="onCopy(order.express_no)" class="ml-20px text-blue">复制</div>
                        </div>
                    </div>
                </template>
            </div>
            <!-- 观看须知 -->
            <div class="rounded p-20px bg-white mt-10px">
                <div class="text-14px font-semibold text-gray-333 mb-10px">观看须知</div>
                <div>
                    <u-parse :lazyLoad="true" :selectable="true" :scrollTable="true" :content="richText"></u-parse>
                </div>
            </div>
        </div>
        <div v-else class="relative z-999">
            <div class="bg-white p-20px rounded">
                <u-skeleton avatarShape="square" avatarSize="102" rows="2" title avatar loading></u-skeleton>
            </div>
            <div class="bg-white p-20px mt-20px rounded">
                <u-skeleton rows="2" title :avatar="false" loading></u-skeleton>
            </div>
            <div class="bg-white p-20px mt-20px rounded">
                <u-skeleton rows="8" title :avatar="false" loading></u-skeleton>
            </div>
            <div class="bg-white p-20px mt-20px rounded">
                <u-skeleton rows="8" title :avatar="false" loading></u-skeleton>
            </div>
        </div>

        <!-- 电话列表 -->
        <u-popup :show="showPhone" :round="20" @cloe="showPhone = false">
            <div class="bg-gray-50 w-full p-15px box-border" style="border-radius: 20px 20px 0 0 ;">
                <div class="px-10px mb-10px flex justify-between items-center">
                    <div class="text-16px">联系商家</div>
                    <div class="rounded-full bg-gray-eee p-5px" @click="showPhone = false">
                        <u-icon name="close" size="14px" color="#333"></u-icon>
                    </div>
                </div>
                <div class="max-h-40vh overflow-y-auto w-full box-border">
                    <div v-for="(item, index) in phoneList" :key="index"
                        class="w-full px-15px py-8px rounded-10px flex items-center mb-8px justify-between box-border bg-white">
                        <div class="text-gray-333 text-18px">{{ item }}</div>
                        <div class="bg-white w-40px h-40px flex justify-center items-center rounded-full"
                            @click="onSendCall(item)" style="border: 1px solid #eee;">
                            <u-icon name="phone-fill" size="16px" color="#666666"></u-icon>
                        </div>
                    </div>
                    <div class="text-gray-666 text-14px flex justify-center items-center" v-if="!phoneList.length">
                        无可用客服热线
                    </div>
                </div>
            </div>
        </u-popup>
    </div>
</template>

<script>
import { parseRichText, openMap, sendCall } from '@/util';
import tkiQrcode from "tki-qrcode/components/tki-qrcode/tki-qrcode.vue"
import store from "@/store";
export default {
    data() {
        return {
            order_id: '',
            cinema_id: '',
            order: {},
            ticket: [],
            global: {},
            richText: '',
            tabIndex: 0,
            tabsDataList: [],
            ticketCurrent: 0,
            canAnimationFlag: true,
            statusOrder: ['', 'yiqupiao', 'yijieshu', 'yituikuan'],
            statusOrderText: ['', '已取票', '已结束', '已退款'],
            statusSign: ['', '', 'yiqupiao', 'yijieshu', 'yituikuan'],
            statusSignText: ['', '', '已取票', '已结束', '已退款'],
            ticket_explain: null,
            navigation: {},
            showPhone: false,
            phoneList: [],
        }
    },
    components: { tkiQrcode },
    onLoad(options) {
        // store.commit("SET_CAN_FETCH_TICKET", false);
        this.order_id = options.order_id;
        this.cinema_id = options.cinema_id;
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.getData();
        });
    },
    methods: {
        changeFinish(e) {
            this.canAnimationFlag = true;
            this.ticketCurrent = e.detail.current;
        },
        onPrev() {
            if (this.ticketCurrent <= 0 || !this.canAnimationFlag) {
                return;
            }
            this.canAnimationFlag = false;
            this.ticketCurrent--;
        },
        onNext() {
            if (this.ticketCurrent >= this.ticket.length - 1 || !this.canAnimationFlag) {
                return;
            }
            this.canAnimationFlag = false;
            this.ticketCurrent++;
        },
        changeTab(e) {
            this.tabIndex = e.index;
        },
        toDetail() {
            this.toPath('/order/detail/index?order_id=' + this.order_id + '&cinema_id=' + this.cinema_id)
        },
        getData() {
            this.request("ticket.show", {
                order_id: this.order_id,
                cinema_id: this.cinema_id
            }).then(res => {
                this.navigation = res.navigation;
                this.ticket_explain = res.ticket_explain;
                this.ticket = res.ticket;
                this.order = res.order;
                this.global = res.setting || {};
                this.phoneList = res.setting.consumer_hotline || [];
                if (res.setting.watch_film) {
                    this.richText = parseRichText(res.setting.watch_film).replace(/width: 1086.8px;/g, "");
                };
                if (this.global.show_ticketscode != 1) {
                    this.tabsDataList.push({ name: '取票' })
                };
                if (this.global.show_entrycode != 1 && this.order.ticket_mode != 1) {
                    this.tabsDataList.push({ name: '扫码入场' })
                };
            });
        },
        onSendCall(tel) {
            this.showPhone = false;
            sendCall(tel);
        },
        onMap() {
            openMap(this.navigation)
        }
    },
};
</script>


<style lang="scss" scoped>
.is-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(180deg, #FF545C 0%, #fff 100%);
}

.is-code {
    ::v-deep {
        .u-tabs__wrapper__scroll-view {
            justify-content: center !important;
        }

        .tabs__wrapper__nav {
            display: inline-block !important;
        }
    }
}
</style>