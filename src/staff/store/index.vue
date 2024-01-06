<template>
    <div class="page-box bg-gray-bg py-15px box-border">
        <loading />
        <!-- tab内容 -->
        <div class="w-full box-border">
            <div class="px-20px w-full box-border">
                <template v-if="dataList && dataList.length">
                    <scroll-view scroll-y="true" class="box-border box-border w-full" style="height: calc(100vh - 30px);">
                        <div class="w-full">
                            <div class="bg-white rounded box-border p-20px relative w-full"
                                @click="toPath('/staff/home/index?staff_id=' + item.id + '&cinema_id=' + item.cinema_id)"
                                :class="{ 'mb-10px': index !== dataList.lenght - 1 }" v-for="(item, index) in dataList"
                                :key="index">
                                <div class="flex items-center justify-between">
                                    <div class="flex-1 mx-5px -mt-2px">
                                        <div class="font-semibold text-gray-333">{{ item.cinema_title }}</div>
                                    </div>
                                    <u-icon name="arrow-right" class="ml-4px" size="18px" color="#999"></u-icon>
                                </div>
                            </div>
                        </div>
                    </scroll-view>
                </template>
                <div v-if="!dataList.length" class="mt-10px">
                    <u-empty mode="order" text="暂无影院" icon="http://cdn.uviewui.com/uview/empty/order.png">
                    </u-empty>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            dataList: [],
        }
    },
    onLoad() {
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.getData();
        });
    },
    methods: {
        getData() {
            this.request("staff.account.index").then(res => {
                this.dataList = (res.staffs || []);
            })
        },
    },
};
</script>


<style lang="scss" scoped>
.search-wrap::v-deep .u-search__content {
    padding: 0 !important;
}

.search-wrap::v-deep .is-u-search {
    width: 100% !important;
}

.search-wrap::v-deep .u-search__action {
    margin-left: 0 !important;
}
</style>