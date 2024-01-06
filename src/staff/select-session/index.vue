<template>
    <div class="page-box bg-gray-bg py-20px pt-0 box-border">
        <loading />
        <!-- tab内容 -->
        <div class="w-full box-border">
            <!-- 订单列表 -->
            <div class="bg-white p-15px flex items-center rounded-5px search-wrap">
                <u-search class="is-u-search" :height="33" :bgColor="'#f5f5f5'" placeholder="请输入项目关键词" clearabled
                    v-model="keyword" @custom="doSearch()" @search="doSearch()" :showAction="true" actionText="搜索"
                    :animation="true"></u-search>
            </div>
            <div class="px-20px w-full box-border">
                <template v-if="dataList && dataList.length">
                    <scroll-view scroll-y="true" class="box-border pt-10px box-border w-full"
                        style="height: calc(100vh - 65px - 64px);">
                        <u-checkbox-group>
                            <div class="w-full">
                                <div class="bg-white rounded box-border p-20px relative w-full"
                                    :class="{ 'mb-10px': index !== dataList.lenght - 1 }" v-for="(item, index) in dataList"
                                    :key="index">
                                    <div class="flex items-start justify-between">
                                        <div class="flex">
                                            <u-checkbox :customStyle="{ marginBottom: '8px' }" :name="item.id"
                                                :checked="item.checked" @change="onChangeItem($event, item)">
                                            </u-checkbox>
                                        </div>
                                        <div class="flex-1 mx-5px -mt-2px">
                                            <div class="font-semibold text-gray-333">{{ item.title }}</div>
                                        </div>
                                        <div class="mt-5px">
                                            <u-icon v-if="!item.open" @click="changeOpen(item)" name="arrow-up"
                                                class="ml-4px" size="18px" color="#999"></u-icon>
                                            <u-icon v-if="item.open" @click="changeOpen(item)" name="arrow-down"
                                                class="ml-4px" size="18px" color="#999"></u-icon>
                                        </div>
                                    </div>
                                    <div class="children pl-28px pt-5px mt-10px" style="border-top: 1px solid #eee;"
                                        v-if="item.open">
                                        <div v-if="item.load && (!item.children || !item.children.length)"
                                            class="text-12px text-gray-600 flex justify-center pt-10px">
                                            暂无进行中的场次
                                        </div>
                                        <div class="text-12px mt-8px text-gray-999 flex items-center"
                                            v-if="item.children && item.children.length && item.load"
                                            v-for="(el, i) in item.children" :key="i">
                                            <u-checkbox @change="onChangeRow($event, el, item)"
                                                :customStyle="{ marginBottom: '8px' }" :checked="el.checked" class="mb-0">
                                            </u-checkbox>
                                            <div class="ml-5px -mt-4px">{{
                                                moment(el.entrance_time * 1000).format('YYYY-MM-DD HH:mm:ss')
                                            }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </u-checkbox-group>
                    </scroll-view>
                    <div
                        class="fixed z-998 bottom-20px h-44px flex items-center justify-center px-20px left-0 w-full box-border">
                        <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                            color="#FF545C" text="下一步" @click="onNext">
                        </u-button>
                    </div>
                </template>
                <div v-if="!dataList.length" class="mt-10px">
                    <u-empty mode="order" text="暂无数据" icon="http://cdn.uviewui.com/uview/empty/order.png">
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
            keyword: '',
            dataList: [],
            originDataList: [],
            id: 0,
            options: {},
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
        onNext() {
            const film_ids = [];
            const row_ids = [];
            this.dataList.forEach(item => {
                if (item.checked) {
                    film_ids.push(item.id)
                } else {
                    item.children && item.children.forEach(el => {
                        if (el.checked) {
                            row_ids.push(el.id)
                        }
                    })
                }
            })
            if (!film_ids.length && !row_ids.length) {
                this.myMessage('请选择影片或场次');
                return;
            }
            uni.setStorageSync('checkSession_ids', JSON.stringify({ film_ids, row_ids }));
            this.toPath('/staff/multiple-check/index' + '?staff_id=' + this.options.staff_id + '&cinema_id=' + this.options.cinema_id);
        },
        changeOpen(item) {
            item.open = !item.open;
            if (!item.load) {
                this.request('staff.film.schedule', {
                    cinema_id: this.options.cinema_id,
                    staff_id: this.options.staff_id,
                    film_id: item.id
                }).then(res => {
                    console.log(res, 'rrr')
                    item.children = (res.schedules || []).map(el => {
                        return { ...el, checked: item.checked }
                    });
                    item.load = true;
                })
            }
        },
        // 勾选影片,则同时勾选所有影片下的场次
        onChangeItem(e, item) {
            item.checked = e;
            item.children.forEach(el => {
                el.checked = e;
            })
        },
        // 勾选场次
        onChangeRow(e, el, item) {
            el.checked = e;
            const hasNo = item.children.find(el => el.checked !== true);
            // 子级有一个未选，则取消全选
            if (hasNo) {
                item.checked = false;
            } else {
                item.checked = true;
            }
        },
        doSearch() {
            this.currentPage = 1;
            this.dataList = [];
            this.getData();
        },
        getData() {
            this.request("staff.film.index", {
                cinema_id: this.options.cinema_id,
                staff_id: this.options.staff_id,
                keyword: this.keyword,
            }).then(res => {
                this.dataList = (res.list || []).map(el => {
                    return {
                        ...el,
                        open: false,
                        checked: false,
                        load: false,
                        children: []
                    }
                });
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