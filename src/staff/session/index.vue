<template>
    <div class="page-box bg-gray-bg p-20px pt-0 box-border">
        <loading />
        <!-- tabs -->
        <u-tabs :current="tabIndex" :list="dateList" @click="changeTab" lineColor="#FF545C"
            :itemStyle="{ height: '42px' }"
            :activeStyle="{ color: '#333', fontWeight: 'bold', transform: 'scale(1.05)' }"
            :inactiveStyle="{ color: '#999999', transform: 'scale(1)' }"></u-tabs>

        <!-- tab内容 -->
        <div class="w-full box-border">
            <div v-if="!dateList || !dateList.length" class="mt-10px">
                <u-empty mode="order" text="暂无场次安排" icon="http://cdn.uviewui.com/uview/empty/order.png">
                </u-empty>
            </div>
            <div v-else-if="!timeDataList.length" class="mt-10px">
                <u-empty mode="order" text="暂无场次数据" icon="http://cdn.uviewui.com/uview/empty/order.png">
                </u-empty>
            </div>
            <!-- 订单列表 -->
            <template v-if="timeDataList && timeDataList.length">
                <scroll-view scroll-y="true" class="pt-10px box-border" style="height: calc(100vh - 42px - 20px);"
                    @scrolltolower="searchScrollLower">
                    <div @click="toPath('/staff/check/index?id=' + item.id  + '&cinema_id=' + options.cinema_id + '&staff_id=' + options.staff_id)"
                        class="bg-white rounded box-border p-20px relative"
                        :class="{ 'mb-10px': index !== timeDataList.lenght - 1 }" v-for="(item, index) in timeDataList"
                        :key="index">
                        <div class="text-14px font-normal flex justify-between items-center text-gray-999">
                            <div class="flex font-semibold pr-20px text-16px flex-col items-center justify-center text-red"
                                style="border-right: 1px solid #eee;">
                                <div>{{ moment(item.entrance_time * 1000).format('HH:mm') }}</div>
                                <div class="mt-10px min-w-60px max-w-60px text-center text-15px leading-5">{{
                                    item.ext.hall_title
                                }}</div>
                            </div>
                            <div class="flex-1 flex justify-between pl-20px items-center">
                                <div>
                                    <div class="text-gray-333 text-16px font-semibold mb-10px leading-5">
                                        {{ item.ext.film_title }}
                                    </div>
                                    <div>{{ item.ext.type_title || '-' }}</div>
                                    <div class="mt-5px leading-5">{{ item.scan }}</div>
                                </div>
                                <div :class="{ 'text-green': item.state == 2 }" style="min-width: 3em">
                                    {{ status[Number(item.state)] }}
                                </div>
                            </div>
                        </div>
                    </div>
                </scroll-view>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tabIndex: 0,
            dateList: [],
            timeDataList: [],
            originDateList: [],
            status: ['', '未开始', '检票中', '已结束'],
            options: {},
        }
    },
    onLoad(options) {
        this.options = options;
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.request('staff.row.index', {cinema_id: options.cinema_id, staff_id: options.staff_id}).then(res => {
                this.originDateList = res.data || [];
                // tab数据
                this.dateList = this.originDateList.map(el => {
                    return {
                        name: el.title.split('年')[1]
                    }
                })
                this.getData();
            })
        });
    },
    methods: {
        changeTab(e) {
            this.tabIndex = e.index;
            this.timeDataList = [];
            this.myCurrentPage = 1;
            this.getData();
        },
        getData() {
            if (!this.dateList[this.tabIndex] || !this.originDateList[this.tabIndex].date) {
                return;
            }
            this.request("staff.row.list", {
                cinema_id: this.options.cinema_id, 
                staff_id: this.options.staff_id,
                date: this.originDateList[this.tabIndex].date,
                page: this.myCurrentPage,
            }).then(res => {
                let { total, data } = res;
                data = data || []
                this.timeDataList = [...this.timeDataList, ...data];
                this.myCurrentPage++;
                this.pageFinish = this.timeDataList.length >= Number(total || 0);
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
};
</script>
