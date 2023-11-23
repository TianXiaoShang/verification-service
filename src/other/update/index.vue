<template>
    <view class="p-10px w-100vw h-100vh box-border bg-white flex justify-center items-center">
        <div class="w-full flex flex-col justify-center items-center -mt-80px">
            <img src="../static/update.png" class="w-8/10" mode="widthFix" />
            <div class="mt-20px font-semibold text-[#3D3D3D] text-18px">正在更新{{ datas.version }}版本</div>
            <div class="mt-20px text-gray-666 text-16px leading-6">{{ datas.desc }}</div>
            <div class="mt-30px flex justify-center">
                <u-button :loading="refreshLoading" type="primary"
                    :customStyle="{ height: '44px', width: 'calc((100vw - 40px) / 2)', margin: 0 }" shape="circle"
                    :text="refreshLoading ? '正在检查' : '刷新一下'" @click="reload"></u-button>
            </div>
        </div>
    </view>
</template>

<script>
import { login, initCinemaConfig } from '@/util/base';
import store from "@/store";

export default {
    data() {
        return {
            datas: {},
            refreshLoading: false,
        }
    },
    onLoad(options) {
        this.datas = { ...options }
    },
    onShow() {
        store.commit("SET_CAN_FETCH_HOME", true);
    },
    methods: {
        reload() {
            this.refreshLoading = true;
            login().then(() => {
                initCinemaConfig().then(() => {
                    this.refreshLoading = false;
                    uni.reLaunch({
                        url: `/pages/index/index`,
                    });
                }, () => {
                    this.refreshLoading = false;
                })
            }, () => {
                this.refreshLoading = false;
            })
        }
    }
};
</script>