<template>
    <div class="page-box relative">
        <loading />
        <div :style="{ width: '100%', height: `calc(${'100vh'} - ${'74px'})` }"
            v-if="show">
            <idcard-list></idcard-list>
        </div>
        <div class="absolute left-0 h-44px flex items-center justify-center px-20px w-full box-border bottom-15px">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" text="新增身份信息" @click="onAdd">
            </u-button>
        </div>
    </div>
</template>

<script>
import IdcardList from './components/idcard-list.vue'
export default {
    components: { IdcardList },
    data() {
        return {
            show: false,
            isLogin: false,            
            cinema_id: ''

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
        this.cinema_id = options.cinema_id;
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
            this.toPath('/order/idcard/add?cinema_id=' + this.cinema_id);
        },
    }
};
</script>

<style lang="scss" scoped></style>
