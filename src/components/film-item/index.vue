<template>
    <div class="wrap">
        <view v-if="detail && detail.id" class="flex justify-between items-center" @click="toFilmDetail" :class="{
            'h-145px': !isMovieMode,
            'h-114px': isMovieMode
        }">
            <!-- 左侧封面 -->
            <div class="h-full mr-10px rounded overflow-hidden relative" :class="{
                'w-96px': !isMovieMode,
                'min-w-96px': !isMovieMode,
                'w-76px': isMovieMode,
                'min-w-76px': isMovieMode,
            }">
                <image class="w-full h-full" :src="detail.logo"></image>
                <div v-if="detail.video && showPlay" @click.stop="onPlay"
                    class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8px bg-gray-bg rounded-full opacity-70">
                    <span style="position: relative; left: 1px;">
                        <u-icon name="play-right-fill" size="18px" color="#999999"></u-icon>
                    </span>
                </div>
            </div>
            <!-- 影院模式 -->
            <div :key="'Movie'" v-if="isMovieMode" class="flex-1 text-gray-666 text-12 h-full flex flex-col justify-between"
                :style="{ width: `calc(100vw - 40px - ${isMovieMode ? '86px' : '106px'} - ${showBuy ? '62px' : '0px'} - ${showRightBtn ? '40px - 62px' : '0px'} - ${isPageStyle ? '20px' : '0px'} - 10px)` }">
                <div class="text-14px truncate w-full font-semibold text-gray-333">
                    {{ detail.title }}
                </div>
                <!-- 没有tag的时候，顶下空间没，保持title外全部靠下 -->
                <div class="h-16px" v-if="!detail.type_name && (!curLabels || !curLabels.length)"></div>
                <div class="h-17px" v-if="!detail.director"></div>
                <div class="h-17px" v-if="!detail.author"></div>
                <div class="h-17px" v-if="!showPrice || detail.is_row != 1"></div>
                <div class="truncate" v-if="showPrice && detail.is_row == 1">
                    <span>价格：</span>
                    <span class="text-red text-18px font-semibold">¥{{ detail.level_price || detail.price || 0 }}
                        <span class="text-10px">起</span>
                    </span>
                </div>
                <div class="truncate w-full h-17px" v-if="detail.director">
                    <span>导演：{{ detail.director }}</span>
                </div>
                <div class="truncate w-full h-17px" v-if="detail.author">
                    <span>主演：{{ detail.author }}</span>
                </div>
                <div class="tags h-16px overflow-x-auto text-0px" v-if="detail.type_name || curLabels.length"
                    style="white-space: nowrap">
                    <div class="inline-block mr-5px" v-if="detail.type_name">
                        <div class="px-5px h-16px flex items-center rounded-4px text-red text-11px bg-white box-border"
                            style="border: 1px solid #FF545C; white-space: nowrap:">
                            {{ detail.type_name }}
                        </div>
                    </div>
                    <div class="inline-block mr-5px" v-for="(item, index) in curLabels" :key="index">
                        <div class="px-5px h-16px flex items-center rounded-4px text-11px bg-white box-border"
                            :style="{ border: `1px solid ${item.color}`, color: item.color, 'white-space': 'nowrap' }">
                            {{ item.title }}
                        </div>
                    </div>
                </div>
            </div>
            <!-- 剧院模式 -->
            <div :key="'Theater'" v-if="!isMovieMode"
                :style="{ width: `calc(100vw - 40px - ${isMovieMode ? '86px' : '106px'} - ${showBuy ? '62px' : '0px'} - ${showRightBtn ? '40px - 62px' : '0px'} - ${isPageStyle ? '20px' : '0px'} - 10px)` }"
                class="theater flex-1 text-12 h-full flex flex-col justify-between">
                <div>
                    <div class="text-14px line-2-ellipsis w-full font-semibold text-gray-333"
                        style="height: 3em; line-height: 1.5em">
                        {{ detail.title }}
                    </div>
                    <div class="tags mt-4px h-16px overflow-x-auto text-0px" style="white-space: nowrap">
                        <div class="inline-block mr-5px" v-if="detail.type_name">
                            <div class="px-5px h-16px flex items-center rounded-4px text-red text-11px bg-white box-border"
                                style="border: 1px solid #FF545C; white-space: nowrap;">
                                {{ detail.type_name }}
                            </div>
                        </div>
                        <div class="inline-block mr-5px" v-for="(item, index) in curLabels" :key="index">
                            <div class="px-5px h-16px flex items-center rounded-4px text-11px bg-white box-border"
                                :style="{ border: `1px solid ${item.color}`, color: item.color, 'white-space': 'nowrap' }">
                                {{ item.title }}
                            </div>
                        </div>
                    </div>
                    <div v-if="showPrice && detail.is_row == 1" class="text-red mt-8px text-18px font-semibold">¥{{
                        detail.level_price || detail.price || 0
                    }}
                        <span class="text-10px">起</span>
                    </div>
                </div>
                <div class="text-12 text-gray-666 w-full flex justify-between items-end">
                    <div class="flex-1 truncate">
                        <div class="truncate" v-if="detail.release_date">
                            {{ detail.release_date }}
                        </div>
                        <div class="truncate mt-2px" v-if="showAddress">
                            {{ detail.address }}
                        </div>
                    </div>

                </div>
            </div>
            <!-- 购票按钮 -->
            <div class="height-full min-w-52px flex items-center ml-10px" v-if="showRightBtn">
                <u-button class="min-w-52px" shape="circle" size="small" color="#FF545C" text="去兑换">
                </u-button>
            </div>
            <div v-else-if="showBuy" class="height-full min-w-52px flex items-center ml-10px">
                <u-button class="min-w-52px" shape="circle" size="small"
                    :color="detail.presell == 1 ? '#66A3f7' : '#FF545C'" :text="detail.presell == 1 ? '预售' : '购票'" @click.native.stop="toSelectFilm">
                </u-button>
            </div>
        </view>
        <u-skeleton avatarShape="square" avatarSize="102" rows="2" title v-else avatar loading></u-skeleton>
    </div>
</template>

<script>
export default {
    name: 'Title',
    props: {
        detail: Object,
        showAddress: {
            type: Boolean,
            default: true
        },
        showBuy: {    // 是否需要展示购买按钮，在电影详情页使用这个组件只是作为展示复用
            type: Boolean,
            default: true
        },
        showPrice: {
            type: Boolean,
            default: true
        },
        showPlay: {    // 是否需要预览视频，在电影详情页本身下面有“精彩瞬间”可以播放
            type: Boolean,
            default: true
        },
        canTap: {   // 是否需要点击跳转，在电影详情页使用这个组件是不需要点击跳转的，只是作为展示复用
            type: Boolean,
            default: true
        },
        showRightBtn: {    // 是否展示去兑换提示
            type: Boolean,
            default: false
        },
        isPageStyle: {    // 是否新的详情页风格
            type: Boolean,
            default: false
        },
        labels: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {}
    },
    computed: {
        curLabels() {
            return (this.labels && this.labels.length) ? this.labels : (this.detail.label || []);
        }
    },
    methods: {
        onPlay() {
            this.$emit('play', this.detail.video)
        },
        toFilmDetail() {
            if (!this.canTap) return;
            // this.toPath('/film-detail/detail/index?id=' + this.detail.id)
            this.waitInitConfig().then(() => {
                this.toPath(`/film-detail/detail/index?id=${this.detail.id}&fitment_style=${this.setting.fitment_style}`);
            })
        },
        toSelectFilm() {
            if (!this.canTap) return;
            if (this.isMovieMode) {
                this.toPath('/film-detail/choice-movie/index?id=' + this.detail.id)
            } else {
                // 剧院模式购票按钮不跳过详情页
                this.toFilmDetail();
                // this.toPath('/film-detail/choice-theater/index?id=' + this.detail.id)
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.tags .u-tag-wrapper {
    margin-right: 4px !important;
}
</style>
