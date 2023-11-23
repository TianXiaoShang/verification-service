<template>
    <!-- 需要设定高度 状态栏高度+导航栏高度（否则下面会塌陷）-->
    <view class="navbar" :style="{ height: statusBarHeight + (justStatusBar ? 0 : navBarHeight) + 'px' }">
        <view class="navbar-fixed" :style="{ background: backgroundColor }">
            <!-- 状态栏小程序撑起高度 -->
            <view :style="{ height: statusBarHeight + 'px' }"></view>
            <view class="content-wrap" v-if="!justStatusBar">
                <view class="navbar-content" :style="{ height: navBarHeight + 'px', width: contentWidth + 'px' }">
                    <!-- 返回按钮 -->
                    <view class="back-btn rounded-full w-24px h-24px flex items-center justify-center box-border pr-2px"
                        :style="{ background: theme === 'light' ? 'rgba(255,255,255, 0.4)' : 'rgba(0,0,0, 0.3)' }"
                        v-if="showBack && backType == 'arrows'" @click="back">
                        <u-icon v-if="theme === 'light'" name="arrow-left" size="21px" color="#000000" />
                        <u-icon v-if="theme === 'dark'" name="arrow-left" size="21px" color="#ffffff" />
                    </view>
                    <!-- 返回首页按钮 -->
                    <view class="back-btn" v-if="showBack && backType == 'home'" @click="backHome">
                        <u-icon name="home-fill" size="21px" />
                    </view>
                    <!-- 中间内容区域 -->
                    <view class="content">
                        <!-- title -->
                        <view class="title" :class="{ 'title-center': titlePos === 'center' }"
                            :style="{ 'text-align': titlePos, color: color }">{{ title }}</view>
                        <!-- 支持插槽 -->
                        <slot></slot>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getStatusBarInfo } from '@/util/index.js'

export default {
    name: 'Navbar',
    computed: {
        color() {
            if (this.theme === 'light') {
                return '#333333'
            }
            if (this.theme === 'dark') {
                return '#ffffff'
            }
            return '#333333'
        }
    },
    props: {
        // 是否展示返回键
        showBack: {
            type: Boolean,
            default: false
        },
        backType: {
            type: 'arrows' | 'home',
            default: 'arrows'
        },
        // title文字内容
        title: {
            type: String,
            default: ''
        },
        // title的位置
        titlePos: {
            type: 'left' | 'center',
            default: 'center'
        },
        backgroundColor: {
            type: String,
            default: '#ffffff'
        },
        theme: {
            type: String,
            default: 'light'
        }
    },
    data() {
        return {
            statusBarHeight: 20 /* 状态栏高度 */,
            navBarHeight: 45 /* 导航栏高度 */,
            contentWidth: 375 /* 窗口宽度 */
        }
    },
    created() {
        const { statusBarHeight, navBarHeight, contentWidth } = getStatusBarInfo()
        this.statusBarHeight = statusBarHeight
        this.navBarHeight = navBarHeight
        this.contentWidth = contentWidth
    },
    methods: {
        back() {
            uni.navigateBack()
        },
        backHome() {
            this.goHome();
        },
        search(val) {
            this.$emit('search', val)
        }
    }
}
</script>

<style lang="scss">
.navbar {
    .navbar-fixed {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        width: 100%;

        .content-wrap {
            width: 100%;
            position: relative;

            .navbar-content {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0 4px;
                height: 45px;
                box-sizing: border-box;

                .back-btn {
                    margin-right: 10px;
                    font-size: 20px;
                    width: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    img {
                        width: 12px;
                        height: 24px;
                    }
                }

                .content {
                    flex: 1;

                    .title {
                        font-size: 13px;
                        font-weight: 500;
                    }

                    .title-center {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                    }
                }
            }
        }
    }
}
</style>
