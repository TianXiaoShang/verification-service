<template>
    <view class="flex mt-20px justify-between items-center">
        <span class="font-semibold text-16 text-gray-333">
            {{ title }}
        </span>
        <div class="text-12 text-gray-999 flex items-center" @click="toMore">
            <span>更多</span>
            <span class="mt-1px ml-1px">
                <u-icon name="arrow-right" size="13px" color="#999"></u-icon>
            </span>
        </div>
    </view>
</template>

<script>
export default {
    name: 'MoreTitle',
    props: {
        title: String,
    },
    onLoad() {
    },
    methods: {
        toMore() {
            this.toPath('/search/type/index')
        }
    }
};
</script>