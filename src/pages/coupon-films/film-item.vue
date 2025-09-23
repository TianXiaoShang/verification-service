<template>
    <div class="wrap">
        <view v-if="detail && detail.id" class="flex justify-between items-center" :class="{
            'h-125px': !isMovieMode,
            'h-114px': isMovieMode
        }">
            <!-- 左侧封面 -->
            <div class="h-full mr-10px rounded relative overflow-hidden relative" :class="{
                'w-82px': !isMovieMode,
                'min-w-82px': !isMovieMode,
                'w-76px': isMovieMode,
                'min-w-76px': isMovieMode,
            }">
                <image class="w-full h-full" :src="detail.logo"></image>
                <div v-if="detail.type_name"
                    class="absolute left-3px top-3px rounded-3px text-10px text-white px-5px box-border line-ell h-16px"
                    :class="{
                        'max-w-74px': !isMovieMode,
                        'max-w-70px': isMovieMode,
                    }" style="line-height: 16px; background: rgba(0,0,0,0.6);">{{ detail.type_name }}</div>
            </div>

            <!-- 剧院模式 -->
            <div :key="'Theater'" :style="{ width: `calc(100vw - ${xPadding} - 92px - 67px)` }"
                class="theater flex-1 text-12 h-full flex flex-col justify-between">
                <div class="w-full">
                    <div class="text-16px line-2-ellipsis w-full font-semibold text-gray-333"
                        style="line-height: 1.5em">
                        {{ detail.title }}
                    </div>
                    <div class="truncate w-full h-17px" v-if="detail.director">
                        <span>导演：{{ detail.director }}</span>
                    </div>
                    <div class="truncate w-full h-17px" v-if="detail.author">
                        <span>主演：{{ detail.author }}</span>
                    </div>
                    <div class="w-full line-1-ellipsis text-gray-666 text-12" v-if="detail.release_date">
                        {{ detail.release_date }}
                    </div>
                    <div class="mt-2px w-full line-1-ellipsis text-gray-666 text-12" v-if="detail.address">
                        {{ detail.address }}
                    </div>
                </div>
                <div v-if="detail.is_row == 1" class="text-red text-18px font-semibold relative flex justify-end items-end">
                    <!-- 价格 -->
                    <span v-if="showPrice">
                        ¥{{ detail.level_price || detail.price || 0 }}
                    </span>
                    <span v-if="showPrice" class="text-10px ml-2px pb-2px">起</span>
                </div>
            </div>
            <!-- 购票按钮 -->
            <div class="height-full min-w-52px flex items-center ml-15px">
                <u-button class="min-w-52px" shape="circle" size="small" :color="'#FF545C'" :text="'购票'"
                    @click.native.stop="toSelectFilm">
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
        cinema_id: String,
        coupon_id: String,
        order_id: String,
        showPrice: {
            type: Boolean,
            default: true
        },
        canTap: {   // 是否需要点击跳转，在电影详情页使用这个组件是不需要点击跳转的，只是作为展示复用
            type: Boolean,
            default: true
        },
        xPadding: {
            type: String,
            default: '20px'
        },
    },
    data() {
        return {}
    },
    methods: {
        onPlay() {
            this.$emit('play', this.detail.video)
        },
        toSelectFilm() {
            // this.toPath('/pages/coupon-choice-theater/index?film_id=' + this.detail.id + '&cinema_id=' + this.cinema_id + '&coupon_id=' + this.coupon_id)
            this.toPath(`/pages/coupon-choice-theater/index?film_id=${this.detail.id}&cinema_id=${this.cinema_id}&coupon_id=${this.coupon_id}&order_id=${this.order_id}`)
        }
    }
};
</script>

<style lang="scss" scoped>
.tags .u-tag-wrapper {
    margin-right: 4px !important;
}
</style>
