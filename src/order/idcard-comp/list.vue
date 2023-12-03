<template>
    <div class="page-box relative">
        <loading />
        <div :style="{ width: '100%', height: `calc(${isHeight || '100vh'} - ${'79px'})` }">
            <idcard-list @onConfirmHook="onConfirmHook" :hookDataChange="hookDataChange" ref="addressListRef"
                :maxSelect="maxSelect" :curSelect="curSelect" :canDelete="false" :canSelect="true"  :cinema_id="cinema_id"
                @onChange="onChangeAddress"></idcard-list>
        </div>
        <div class="h-44px flex items-center justify-center px-20px w-full box-border mt-20px bottom-15px">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" text="确认选择" @click="onConfirm">
            </u-button>
        </div>
    </div>
</template>

<script>
// 本文件同步address即可，问题在于抖音端不能一个文件作为页面的同时作为组件使用，所以复制一份过来
import IdcardList from '../idcard/components/idcard-list.vue'
export default {
    components: { IdcardList },
    data() {
        return {
            isLogin: false,
            hookDataChange: 0,
        }
    },
    props: {
        isHeight: String,
        curSelect: Array,
        maxSelect: Number,
        cinema_id: String
    },
    created() {
        this.waitLogin().then(() => {
            this.isLogin = true;
        })
    },
    methods: {
        onConfirmHook(val) {
            this.$emit('onChange', val)
            this.$emit('onClose')
        },
        onConfirm() {
            // 抖音部分安卓版本不支持refs调用方法。只能通过hook通知
            this.hookDataChange += 1;
        },
        refreshData() {
            this.$refs.addressListRef && this.$refs.addressListRef.refreshData();
        },
        onChangeAddress(e) {
            this.$emit('onChange', e)
        },
        onAdd() {
            this.toPath('/order/idcard/add?cinema_id=' + this.cinema_id);
        },
    }
};
</script>

<style lang="scss" scoped></style>
