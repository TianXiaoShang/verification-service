<template>
    <view class="unavailable-page">
        <loading />
        <view class="unavailable-content">
            <image class="unavailable-image" src="@/static/detail/coupon-unavailable.png" mode="aspectFit" />
            <view class="unavailable-message">{{ guideText }}</view>
            <u-button shape="circle" color="#FF214C" text="确定"
                :customStyle="{ width: '200px', height: '44px', margin: '36px 0 0' }" @click="goHome()" />
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            guideText: '暂时无法兑换，请联系商家确认后再试。',
        }
    },
    onLoad(options) {
        this.waitLogin().then(() => {
            this.request('config.index', { cinema_id: options.cinema_id }).then(res => {
                this.guideText = res.guide_text || '暂时无法兑换，请联系商家确认后再试。';
            }, err => {
                console.error('获取兑换引导配置失败', err);
            });
        });
    },
};
</script>

<style scoped>
.unavailable-page {
    min-height: 100vh;
    box-sizing: border-box;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
}

.unavailable-content {
    width: 100%;
    padding: 0 75rpx 120rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.unavailable-image {
    width: 400rpx;
    height: 300rpx;
}

.unavailable-message {
    width: 100%;
    margin-top: 12rpx;
    color: #333;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 42rpx;
    text-align: center;
    white-space: pre-wrap;
    overflow-wrap: break-word;
}
</style>
