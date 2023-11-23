<template>
    <div style="height:100%;width: 100%;" class="overflow-hidden">
        <loading />
        <!-- tab内容 -->
        <div class="w-full h-full box-border">
            <div v-if="!listData || !listData.length" class="mt-10px">
                <u-empty mode="order" text="暂无数据" icon="http://cdn.uviewui.com/uview/empty/order.png">
                </u-empty>
            </div>
            <!-- 订单列表 -->
            <template v-else>
                <scroll-view scroll-y="true" style="height: 100%;width: 100%" @scrolltolower="searchScrollLower">
                    <div v-for="(item, index) in listData" :key="index"
                        class="w-full box-border p-10px flex items-center justify-between"
                        style="border-bottom: 1px solid #eee;">
                        <template v-if="item.id">
                            <div v-if="canSelect" @click="onSetDefault(item)">
                                <u-icon size="22px" name="checkmark-circle-fill" :color="curSelect && item.id === curSelect.id ? '#FF545C' : '#ccc'"></u-icon>
                            </div>
                            <div class="mx-10px flex-1" @click="onSetDefault(item)">
                                <div class="text-14px text-gray-333">
                                    {{ item.realname + ' ' }} {{ item.mobile }}
                                    <span v-if="item.is_default == 1"
                                        class="text-[#FF545C] px-5px ml-10px text-11px rounded-4px"
                                        style="border: 1px solid #FF545C;">默认</span>
                                </div>
                                <div class="text-12px mt-6px text-gray-400">
                                    <span class="leading-4">
                                        {{ item.address }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <u-icon @click="toEdit(item)" name="edit-pen" size="22px" color="#999999"></u-icon>
                                <!-- 切换的时候不能删除 -->
                                <div class="ml-6px" v-if="canDelete && !canSelect">
                                    <u-icon size="22px" name="trash" @click="onDelete(item)" color="#FF545C"></u-icon>
                                </div>
                            </div>
                        </template>
                        <u-skeleton v-else rows="2" title :avatar="false" loading></u-skeleton>
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
            curSelectAddress: {},
            listData: new Array(15).fill({}),
        }
    },
    props: {
        canDelete: {
            default: true,
            type: Boolean,
        },
        canSelect: {
            default: false,
            type: Boolean,
        },
        curSelect: Object
    },
    watch: {
        curSelect: {
            handler(val) {
                this.curSelectAddress = val || {};
            },
            immediate: true,
        }
    },
    created() {
        this.getData();
        try {
            uni.$off('refreshAddressPopupData');
        } catch (error) {}
        uni.$on('refreshAddressPopupData', (val)=>{
            this.refreshData();
        });
    },
    destroyed(){
        try {
            uni.$off('refreshAddressPopupData');
        } catch (error) {}
    },
    methods: {
        refreshData() {
            this.pageFinish = false;
            this.listData = new Array(15).fill({});
            this.myCurrentPage = 1;
            this.getData().then(() => {
                this.curSelectAddress = {};
                this.$emit('onChange', {})
            });
        },
        getData(showLoading = true) {
            return new Promise((resolve) => {
                this.request("address", {
                    page: this.myCurrentPage,
                    _showLoading: showLoading,
                }).then(res => {
                    const { total, list } = res;
                    if (!this.listData[0] || !this.listData[0].id) {
                        this.listData = [];
                    }
                    this.listData = [...this.listData, ...list];
                    this.myCurrentPage++;
                    this.pageFinish = this.listData.length >= Number(total);
                    resolve();
                }, () => {
                    this.pageFinish = true;
                })
            })
        },
        searchScrollLower() {
            if (this.pageFinish) {
                return;
            }
            this.getData(false);
        },
        toEdit(item) {
            this.toPath('/order/address/add?isEdit=true&id=' + item.id)
        },
        onSetDefault(item) {
            // 选择的时候就用来切换
            if (this.canSelect) {
                this.curSelectAddress = item;
                this.$emit('onChange', item)
            } else {
                if (item.is_default == 1) {
                    return;
                }
                uni.showModal({
                    title: '提示',
                    content: '请确认将当前地址设置为默认地址',
                    success: (result) => {
                        if (result.confirm) {
                            this.request('address.is_default', { id: item.id }, 'POST').then(res => {
                                this.pageFinish = false;
                                this.listData = new Array(15).fill({});
                                this.myCurrentPage = 1;
                                this.myMessage('设置默认地址成功')
                                this.getData();
                            })
                        }
                    },
                    fail: () => { },
                    complete: () => { }
                });
            }
        },
        onDelete(item) {
            uni.showModal({
                title: '警告',
                content: '请确认删除该地址',
                success: (result) => {
                    if (result.confirm) {
                        this.request('address.delete', { id: item.id }, 'POST').then(res => {
                            this.pageFinish = false;
                            this.listData = new Array(15).fill({});
                            this.myCurrentPage = 1;
                            this.myMessage('删除地址成功')
                            this.getData();
                        })
                    }
                },
                fail: () => { },
                complete: () => { }
            });
        }
    }
};
</script>

<style lang="scss" scoped></style>
