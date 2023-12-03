<template>
    <div class="page-box relative">
        <loading />
        <div :style="{ width: '100%', height: `calc(${isHeight || '100vh'} - ${'79px'})` }">
            <address-list :cinema_id="cinema_id" ref="addressListRef" :curSelect="curSelect" :canDelete="false" :canSelect="true"
                @onChange="onChangeAddress"></address-list>
        </div>
        <div class="h-44px flex items-center justify-center px-20px w-full box-border mt-20px bottom-15px">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" text="新增地址" @click="onAdd">
            </u-button>
        </div>
    </div>
</template>

<script>
// 本文件同步address即可，问题在于抖音端不能一个文件作为页面的同时作为组件使用，所以复制一份过来
import AddressList from '../address/components/address-list.vue'
export default {
    components: { AddressList },
    data() {
        return {
            isLogin: false,
        }
    },
    props: {
        isHeight: String,
        curSelect: Object,
        cinema_id: String
    },
    created() {
        this.waitLogin().then(() => {
            this.isLogin = true;
        })
    },
    methods: {
        refreshData() {
            this.$refs.addressListRef && this.$refs.addressListRef.refreshData();
        },
        onChangeAddress(e) {
            this.$emit('onChange', e)
        },
        onAdd() {
            this.toPath('/order/address/add?cinema_id=' + this.cinema_id);
        },
    }
};
</script>

<style lang="scss" scoped></style>
