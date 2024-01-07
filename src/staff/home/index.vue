<template>
    <div class="page-box bg-gray-bg box-border">
        <loading />
        <!-- 自定义导航 -->
        <nav-bar :title="'员工首页'" :showBack="isWx" :backgroundColor="'transparent'"></nav-bar>
        <!-- 背景 -->
        <div class="fixed h-100vh overflow-hidden left-0 top-0 w-100vw">
            <image src="@/static/self/colorbg@2x.png" mode="widthFix" class="w-full" />
        </div>

        <!-- 内容区域 -->
        <div class="relative z-99 py-20px">
            <!-- 基本资料 -->
            <div class="flex justify-between items-center px-20px">
                <div class="flex items-center">
                    <!-- 头像 -->
                    <div
                        class="relative rounded-full border-solid shadow-lg border-2 border-white box-border overflow-hidden w-60px h-60px">
                        <image :src="(userInfo.avatar || DEFAULT_AVATAR)" class="w-full h-full" />
                    </div>
                    <!-- 昵称 -->
                    <div class="ml-10px">
                        <div class="text-333 font-semibold text-20">
                            {{ info.realname || '' }}</div>
                        <!-- 手机号 -->
                        <div class="text-666 text-12 mt-5px">
                            <span class="relative">
                                {{ info.mobile || '' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-bg content-box mt-20px px-20px pt-20px">
                <!-- 功能卡片 -->
                <div class="bar-wrap">
                    <div @click="toPath('/staff/session/index' + '?cinema_id=' + options.cinema_id + '&staff_id=' + options.staff_id)"
                        v-if="info.type === '0'"
                        class="h-56px mt-10px px-20px box-border py-18px flex items-center justify-between bg-white rounded">
                        <div class="flex items-center">
                            <image mode="aspectFit" src="../static/tikets-16.png" class="w-16px h-16px" />
                            <span class="ml-10px text-gray-333 text-14px">查看场次</span>
                        </div>
                        <u-icon name="arrow-right" class="ml-4px" size="16px" color="#999"></u-icon>
                    </div>
                    <div @click="toPath('/staff/select-session/index' + '?cinema_id=' + options.cinema_id + '&staff_id=' + options.staff_id)"
                        class="h-56px mt-10px px-20px box-border py-18px flex items-center justify-between bg-white rounded">
                        <div class="flex items-center">
                            <image mode="aspectFit" src="../static/tikets-16.png" class="w-16px h-16px" />
                            <span class="ml-10px text-gray-333 text-14px">检票</span>
                        </div>
                        <u-icon name="arrow-right" class="ml-4px" size="16px" color="#999"></u-icon>
                    </div>
                    <div @click="toPath('/staff/record/index' + '?cinema_id=' + options.cinema_id + '&staff_id=' + options.staff_id)"
                        class="h-56px mt-10px px-20px box-border py-18px flex items-center justify-between bg-white rounded">
                        <div class="flex items-center">
                            <image mode="aspectFit" src="../static/order-16.png" class="w-16px h-16px" />
                            <span class="ml-10px text-gray-333 text-14px">核销记录</span>
                        </div>
                        <u-icon name="arrow-right" class="ml-4px" size="16px" color="#999"></u-icon>
                    </div>
                    <div @click="(showCode = true)"
                        class="h-56px mt-10px px-20px box-border py-18px flex items-center justify-between bg-white rounded">
                        <div class="flex items-center">
                            <image mode="aspectFit" src="../static/code-16.png" class="w-16px h-16px" />
                            <span class="ml-10px text-gray-333 text-14px">员工入场码（核销）</span>
                        </div>
                        <u-icon name="arrow-right" class="ml-4px" size="16px" color="#999"></u-icon>
                    </div>
                </div>
            </div>
        </div>

        <u-popup :show="showCode" :round="10" mode="center" :safeAreaInsetBottom="false" closeable
            @close="(showCode = false)">
            <div class="p-30px" v-if="showCode">
                <div class="p-10px text-gray-333 font-semibold flex justify-center mb-10px">员工入场码</div>
                <!-- 组件地址 https://ext.dcloud.net.cn/plugin?id=39 -->
                <tki-qrcode ref="qrcode" :val="info.qr_code" :size="200" unit="px" :background="'#ffffff'"
                    :foreground="'#000000'" :onval="true" :loadMake="true" :showLoading="true" />
            </div>
        </u-popup>
    </div>
</template>

<script>
import NavBar from '@/components/nav-bar';
import tkiQrcode from "tki-qrcode/components/tki-qrcode/tki-qrcode.vue"

export default {
    data() {
        return {
            info: {},
            showCode: false,
            options: {}
        }
    },
    components: { NavBar, tkiQrcode },
    onLoad(options) {
        this.options = options;
        if (options.staff_id && options.cinema_id) {
            this.waitLogin().then(() => {
                this.request("staff.home.index", { cinema_id: options.cinema_id, staff_id: options.staff_id }).then(res => {
                    this.info = res.staff;
                    uni.setStorageSync('StaffUserInfo', JSON.stringify(this.info));
                })
            })
        } else {
            this.myMessage('参数错误');
        }
    },
    methods: {
    }
};
</script>