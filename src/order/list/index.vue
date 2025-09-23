<template>
    <div class="page-box bg-gray-bg p-20px pt-0 box-border">
        <loading />
        <!-- tabs -->
        <u-tabs :current="tabIndex" :list="statusList" @click="changeTab" lineColor="#FF545C"
            :itemStyle="{ height: '42px' }" :activeStyle="{ color: '#333', fontWeight: 'bold', transform: 'scale(1.05)' }"
            :inactiveStyle="{ color: '#999999', transform: 'scale(1)' }"></u-tabs>
        <!-- tab内容 -->
        <div class="w-full box-border">
            <div v-if="!orderList || !orderList.length" class="mt-10px">
                <u-empty mode="order" text="暂无订单数据" icon="http://cdn.uviewui.com/uview/empty/order.png">
                </u-empty>
            </div>
            <!-- 订单列表 -->
            <template v-else>
                <scroll-view scroll-y="true" class="pt-10px box-border" style="height: calc(100vh - 42px - 20px);"
                    @scrolltolower="searchScrollLower">
                    <div @click="toOrderDetail(item)" class="bg-white rounded box-border mb-10px p-20px relative"
                        v-for="(item, index) in orderList" :key="index">
                        <template v-if="item.id">
                            <div class="text-14 font-semibold flex items-center">{{ item.ext.film_title }}</div>
                            <div class="text-12px text-gray-999 my-10px font-normal flex justify-between items-center">
                                <div style="max-width: calc(100% - 40px);" class="truncate">{{ item.ext.cinema_title }} | {{
                                    item.ext.hall_title }}</div>
                                <span>{{ orderStatus(item.status, item.pre_create, item.channel == 10) || '-' }}</span>
                            </div>
                            <div class="text-14 font-normal flex justify-between items-center">
                                <span class="text-gray-333">{{ item.ext.seats.map(el => el.name).join('、') }}</span>
                                <span class="text-12px text-gray-999">{{
                                    moment(item.entrance_time *
                                        1000).format('YYYY-MM-DD HH:mm')
                                }}</span>
                            </div>
                        </template>
                        <u-skeleton v-else rows="2" title :avatar="false" loading></u-skeleton>
                    </div>
                    <div v-if="pageFinish" class="pb-15px text-center text-12px text-gray-999">没有更多啦~</div>
                </scroll-view>
            </template>
        </div>
    </div>
</template>

<script>
import { orderStatus } from '../util';
export default {
    data() {
        return {
            orderStatus,
            orderList: new Array(8).fill({}),
            tabIndex: 0,
            statusList: [
                { name: '全部' },
                { name: '待下单' },
                { name: '等待商家确认' },
                { name: '成功' },
                { name: '订单取消中' },
                { name: '订单已取消' },
                { name: '失败' },
                { name: '已取消' },
            ],
        }
    },
    onLoad() {
    },
    methods: {
        changeTab(e) {
            this.myCurrentPage = 1;
            this.tabIndex = e.index;
            this.orderList = new Array(8).fill({});
            this.getData();
        },
        toOrderDetail(item) {
            this.toPath('/order/detail/index?order_id=' + item.id + '&cinema_id=' + item.cinema_id)
        },
        getData() {
            this.request("order.index", {
                page: this.myCurrentPage,
                status: this.tabIndex
            }).then(res => {
                const { total, data } = res;
                if (!this.orderList[0] || !this.orderList[0].id) {
                    this.orderList = [];
                }
                this.orderList = [...this.orderList, ...data];
                this.myCurrentPage++;
                this.pageFinish = this.orderList.length >= Number(total);
            }, () => {
                this.pageFinish = true;
            })
        },
        searchScrollLower() {
            if (this.pageFinish) {
                return;
            }
            this.getData();
        },
    },
    onShow() {
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.myCurrentPage = 1;
            this.orderList = new Array(8).fill({});
            this.getData();
        });
    },
};
</script>
