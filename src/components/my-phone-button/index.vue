<template>
    <div class="absolute left-0 top-0 right-0 bottom-0 opacity-0 z-997">
        <button slot="button" @getphonenumber="getMobile" openType="getPhoneNumber"
            class="absolute left-0 top-0 right-0 bottom-0 opacity-0 z-997">
        </button>
    </div>
</template>

<script>
import { getPhoneNumber, login } from '@/util/base';

export default {
    name: 'MyPhoneButton',
    props: {
        value: String,
        phone: String,
    },
    data() {
        return {
            loginCode: '',
        }
    },
    watch: {
        phone: {
            handler(val) {
                if (val) {
                    this.$emit('input', val);
                }
            },
            immediate: true,
        },
    },
    created() {
        login(true).then(res => {
            this.loginCode = res;
            this.$emit('input', this.phone ? this.phone : this.userInfo.mobile)
        })
    },
    methods: {
        getMobile(e) {
            getPhoneNumber({ ...e, loginCode: this.loginCode }, true).then(res => {
                this.$emit('input', res.mobile)
                login(true).then(res => {
                    this.loginCode = res;
                })
            }, () => { })
        },
    }
}
</script>