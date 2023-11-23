<template>
    <div v-if="value" class="fixed left-0 top-0 w-100vw h-100vh z-index-999">
        <!-- 背景 -->
        <div style="background: rgba(0,0,0,0.4)" class="absolute w-full h-full" @click="onClose"></div>
        <!-- 视频 -->
        <div class="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            <video object-fit="contain" autoplay style="width: 100vw;" :src="src" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'PreviewVideo',
    props: {
        src: String,
        value: Boolean,
    },
    data() {
        return {}
    },
    created() { },
    methods: {
        onClose() {
            this.$emit('input', false)
        }
    }
};
</script>
