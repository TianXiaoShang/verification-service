<template>
    <div class="page-box bg-gray-bg p-20px box-border">
        <loading />
        <!-- tab内容 -->
        <div class="w-full box-border">
            <div v-if="!dataList || !dataList.length" class="mt-10px">
                <u-empty mode="order" text="暂无检票记录" icon="http://cdn.uviewui.com/uview/empty/order.png">
                </u-empty>
            </div>
            <!-- 订单列表 -->
            <template v-else>
                <scroll-view scroll-y="true" style="height: calc(100vh - 40px);" @scrolltolower="searchScrollLower">
                    <div class="bg-white rounded box-border p-20px relative" :class="{ 'mt-10px': index !== 0 }"
                        v-for="(item, index) in dataList" :key="index">
                        <div class="text-14px font-normal flex justify-between items-center text-gray-999">
                            <div class="flex font-semibold pr-20px text-16px flex-col items-center justify-center text-red"
                                style="border-right: 1px solid #eee;">
                                <div>{{ moment(item.entrance_time * 1000).format('HH:mm') }}</div>
                                <div
                                    class="mt-10px min-w-60px max-w-60px text-center text-15px leading-5 flex justify-center">
                                    {{ item.ext.hall_title
                                    }}</div>
                            </div>
                            <div class="flex-1 flex justify-between pl-20px items-center">
                                <div>
                                    <div class="text-gray-333 text-16px font-semibold mb-15px leading-5">
                                        {{ item.film_title }}
                                    </div>
                                    <div>{{ item.ext.type_title || '-' }}</div>
                                </div>
                                <div @click="toPath('/staff/check/index?id=' + item.id + '&cinema_id=' + options.cinema_id + '&staff_id=' + options.staff_id + '&fromRecord=true')"
                                    class="w-70px text-12px min-w-70px h-26px flex text-white justify-center items-center rounded-15px bg-red">
                                    查看详情</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="pageFinish" class="py-15px text-center text-12px text-gray-999">没有更多啦~</div>
                </scroll-view>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            dataList: [],
            options: {}
        }
    },
    onLoad(options) {
        this.options = options;
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.getData();
        });
    },
    methods: {
        getData() {
            this.request("staff.row.record", {
                cinema_id: this.options.cinema_id, staff_id: this.options.staff_id,
                page: this.myCurrentPage,
            }).then(res => {
                const { total, data } = res;
                this.dataList = [...this.dataList, ...data];
                this.myCurrentPage++;
                this.pageFinish = this.dataList.length >= Number(total);
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
