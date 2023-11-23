<template>
    <div class="vue-loading" v-show="showLoading">
        <div class="filter" v-show="full"></div>
        <div class="loader-wrap">
            <div class="loader"></div>
            <div class="hint">{{ text }}</div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: 'Loading',
    props: {
        forcedHide: Boolean   // 强制隐藏
    },
    computed: {
        ...mapGetters(["globalLoadingText", 'globalLoadings']),
    },
    watch: {
        globalLoadings: {
            handler(val) {
                this.showLoading = !!val.length;
            },
            deep: true
        },
        globalLoadingText(val) {
            this.text = val;
        }
    },
    data() {
        return {
            showLoading: false,
            text: '',
            full: true,    //是否展示蒙层
        }
    },
}
</script>

<style lang="scss" scoped>
.vue-loading {
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 99999;

    &.isShow {
        display: block !important;
    }

    .filter {
        background: rgba(255, 255, 255, 0.5);
        height: 100vh;
        width: 100vw;

        &.isShow {
            display: block !important;
        }
    }

    .loader-wrap {
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);

        .hint {
            color: #666666;
            font-size: 14px;
            margin-top: 10px;
            text-shadow: 1px 1px 3px #ffffff;
        }

        .loader {
            position: relative;
            top: calc(50% - 1.25em);
            left: calc(50% - 1.25em);
            height: 2.5em;
            transform: rotate(165deg);
            width: 2.5em;

            &:before {
                animation: before 2s infinite;
                border-radius: 0.25em;
                content: '';
                display: block;
                height: 0.5em;
                left: 50%;
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 0.5em;
            }

            &:after {
                animation: after 2s infinite;
                border-radius: 0.25em;
                content: '';
                display: block;
                height: 0.5em;
                left: 50%;
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 0.5em;
            }
        }
    }
}
</style>

<style>
@keyframes before {
    0% {
        width: 0.5em;
        box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
    }

    35% {
        width: 2.5em;
        box-shadow: 0 -0.5em rgba(225, 20, 98, 0.75), 0 0.5em rgba(111, 202, 220, 0.75);
    }

    70% {
        width: 0.5em;
        box-shadow: -1em -0.5em rgba(225, 20, 98, 0.75), 1em 0.5em rgba(111, 202, 220, 0.75);
    }

    100% {
        box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
    }
}

@keyframes after {
    0% {
        height: 0.5em;
        box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75), -0.5em -1em rgba(233, 169, 32, 0.75);
    }

    35% {
        height: 2.5em;
        box-shadow: 0.5em 0 rgba(61, 184, 143, 0.75), -0.5em 0 rgba(233, 169, 32, 0.75);
    }

    70% {
        height: 0.5em;
        box-shadow: 0.5em -1em rgba(61, 184, 143, 0.75), -0.5em 1em rgba(233, 169, 32, 0.75);
    }

    100% {
        box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75), -0.5em -1em rgba(233, 169, 32, 0.75);
    }
}
</style>

