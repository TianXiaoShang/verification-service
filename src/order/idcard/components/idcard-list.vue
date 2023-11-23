<template>
    <div style="height:100%;width: 100%;" class="overflow-hidden">
        <loading />
        <!-- tab内容 -->
        <div class="w-full h-full box-border">
            <div class="px-20px pb-10px" @click="onAdd" v-if="canSelect">
                <div class="text-14px rounded-8px text-red flex justify-center p-8px" style="border: 1px dashed #FF545C;">
                    新增观演人</div>
            </div>
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
                            <div v-if="canSelect" @click="onCheck(item)">
                                <div v-if="curSelectIdcards.find(e => e.id === item.id)"
                                    class="h-21px w-21px rounded-full box-bobrder flex justify-center">
                                    <u-icon size="22px" name="checkmark-circle-fill" color="#FF545C"></u-icon>
                                </div>
                                <div v-else class="h-21px w-21px rounded-full box-border" style="border: 1px solid #FF545C">
                                </div>
                            </div>
                            <div class="mx-10px flex-1" @click="onCheck(item)">
                                <div class="text-14px text-gray-333">
                                    {{ item.realname }}
                                    <span class="text-gray-400 ml-8px text-12px">[{{ types[Number(item.type)] }}]</span>
                                </div>
                                <div class="text-12px mt-6px text-gray-400">
                                    <span class="leading-4">
                                        {{ item.idcard }}
                                    </span>
                                </div>
                            </div>
                            <!-- 切换的时候不能删除 -->
                            <div class="ml-6px" v-if="canDelete && !canSelect">
                                <u-icon size="22px" name="trash" @click="onDelete(item)" color="#FF545C"></u-icon>
                            </div>
                        </template>
                        <u-skeleton v-else rows="2" title :avatar="false" loading></u-skeleton>
                    </div>
                    <div v-if="pageFinish" class="py-15px text-center text-12px text-gray-999">没有更多啦~</div>
                </scroll-view>
            </template>
        </div>
    </div>
</div></template>

<script>
export default {
    data() {
        return {
            types: ['身份证', '港澳台居民居住证', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '护照', '外国人永久居留身份证'],
            curSelectIdcards: [],
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
        curSelect: Array,
        maxSelect: Number,
        hookDataChange: Number
    },
    watch: {
        curSelect: {
            handler(val) {
                this.curSelectIdcards = val || [];
            },
            immediate: true,
        },
        hookDataChange: {
            handler(val) {
                // 抖音部分安卓版本不支持refs调用方法。只能通过hook通知
                this.$emit('onConfirmHook', [...this.curSelectIdcards])
            }
        },
    },
    created() {
        this.getData();
        try {
            uni.$off('refreshIdcardPopupData');
        } catch (error) {}
        uni.$on('refreshIdcardPopupData', (val)=>{
            this.refreshData();
        });
    },
    destroyed(){
        try {
            uni.$off('refreshIdcardPopupData');
        } catch (error) {}
    },
    methods: {
        onAdd() {
            this.toPath('/order/idcard/add');
        },
        getCurData() {
            return this.curSelectIdcards;
        },
        onCheck(item) {
            if (!this.canSelect) {
                return;
            }
            const index = this.curSelectIdcards.findIndex(e => e.id === item.id);
            if (index === -1) {
                if (this.curSelectIdcards.length >= this.maxSelect) {
                    this.myMessage(`最多可选${this.maxSelect}人`);
                    return;
                }
                this.curSelectIdcards.push(item);
            } else {
                this.curSelectIdcards.splice(index, 1);
            }
            // this.$emit('onChange', this.curSelectIdcards);
        },
        refreshData() {
            this.pageFinish = false;
            this.listData = new Array(15).fill({});
            this.myCurrentPage = 1;
            this.getData().then(() => {
                // this.curSelectIdcards = [];
                // this.$emit('onChange', []);
            });
        },
        getData(showLoading = true) {
            return new Promise((resolve) => {
                this.request("idcard", {
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
            this.toPath('/order/idcard/add?isEdit=true&id=' + item.id)
        },
        onDelete(item) {
            uni.showModal({
                title: '警告',
                content: '请确认删除该身份信息',
                success: (result) => {
                    if (result.confirm) {
                        this.request('idcard.delete', { id: item.id }, 'POST').then(res => {
                            this.pageFinish = false;
                            this.listData = new Array(15).fill({});
                            this.myCurrentPage = 1;
                            this.myMessage('删除身份信息成功')
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
