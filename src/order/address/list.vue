<template>
    <div class="page-box relative">
        <loading />
        <div :style="{ width: '100%', height: `calc(${'100vh'} - ${'74px'})` }"
            v-if="show">
            <address-list></address-list>
        </div>
        <div class="absolute left-0 h-44px flex items-center justify-center px-20px w-full box-border bottom-15px">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" text="新增地址" @click="onAdd">
            </u-button>
        </div>
    </div>
</template>

<script>
import AddressList from './components/address-list.vue'
export default {
    components: { AddressList },
    data() {
        return {
            show: false,
            isLogin: false,
        }
    },
    onHide() {
        this.show = false;
    },
    onShow() {
        if (this.isLogin) {
            this.show = true;
        }
    },
    onLoad() {
        this.waitLogin().then(() => {
            this.show = true;
            this.isLogin = true;
        })
    },
    created() {
        this.waitLogin().then(() => {
            this.show = true;
            this.isLogin = true;
        })
    },
    methods: {
        onAdd() {
            this.toPath('/order/address/add');
        },
    }
};
</script>

<style lang="scss" scoped></style>
