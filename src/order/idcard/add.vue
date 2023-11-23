<template>
    <div class="page-box relative">
        <loading />
        <div class="px-14px pb-74px" style="border-top: 1px solid #d6d7d9;">
            <u--form labelPosition="left" :model="formData" :rules="rules" ref="uForm" :labelWidth="0">
                <div class="mt-15px font-semibold text-[#3D3D3D] text-16px">姓名<span class="text-red">*</span></div>
                <u-form-item prop="realname" borderBottom>
                    <u--input v-model="formData.realname" border="none" placeholder="请输入姓名"></u--input>
                    <u-icon slot="right" name="account-fill" color="#FF545C"></u-icon>
                </u-form-item>
                <div class="mt-15px font-semibold text-[#3D3D3D] text-16px">证件类型<span class="text-red">*</span></div>
                <u-form-item prop="type" borderBottom @click="show = true; hideKeyboard()">
                    <u--input v-model="curType" readonly disabledColor="#ffffff" placeholder="请选择证件类型"
                        border="none"></u--input>
                    <u-icon slot="right" name="arrow-right"></u-icon>
                </u-form-item>
                <div class="mt-15px font-semibold text-[#3D3D3D] text-16px">证件号码<span class="text-red">*</span></div>
                <u-form-item prop="idcard" borderBottom>
                    <u--input v-model="formData.idcard" border="none" type="idcard" placeholder="请输入证件号码"></u--input>
                </u-form-item>
            </u--form>
            <div class="flex mt-30px justify-start items-center text-14 text-gray-333 box-border">
                <image v-if="read" @click="onRead(false)" src="@/static/common/agree-sel@2x.png" class="w-15px h-15px">
                </image>
                <div v-if="!read" @click="showPopup = true"
                    class="box-border rounded-full w-15px h-15px border border-solid border-[#999999]">
                </div>
                <span class="ml-4px text-[#3D3D3D]">我已阅读并同意<span class="text-[#F65C66]"
                        @click="showPopup = true">《实名须知》</span></span>
            </div>
        </div>
        <div class="fixed z-998 bottom-20px h-44px flex items-center justify-center px-20px left-0 w-full box-border">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" text="保存" @click="onSubmit">
            </u-button>
        </div>

        <!-- 服务条款 -->
        <u-popup :show="showPopup" :round="20" @close="showPopup = false">
            <div class="w-full">
                <div class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 
                                                border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 实名须知 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showPopup = false"></u-icon>
                    </span>
                </div>
                <scroll-view scroll-y="true" class="text-gray-666 max-h-50vh px-15px box-border mt-15px">
                    <u-parse v-if="autonym_explain" :lazyLoad="true" :selectable="true" :scrollTable="true"
                        :content="autonym_explain"></u-parse>
                    <span v-else>暂无服务条款内容</span>
                </scroll-view>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '200px' }"
                        color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="确定"
                        @click.native.stop="onRead(true)">
                    </u-button>
                </div>
            </div>
        </u-popup>

        <!-- 类型选择 -->
        <u-picker :show="show" ref="uPicker" :title="'请选择'" :cancelText="'取消'" :confirmText="'确认'" :cancelColor="'#999999'"
            :confirmColor="'#FF545C'" :showToolbar="true" :immediateChange="true" :columns="columns" :defaultIndex="defaultIndex"
            @cancel="show = false" @confirm="confirm"></u-picker>
    </div>
</template>

<script>
import { parseRichText } from '@/util';
export default {
    data() {
        return {
            read: false,
            showPopup: false,
            show: false,
            columns: [['身份证', '港澳台居民居住证', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '护照', '外国人永久居留身份证']],
            formData: {
                realname: '',
                idcard: '',
                type: "0",
            },
            autonym_explain: '',
            defaultIndex: [0],
            curType: '身份证',
            rules: {
                realname: {
                    type: 'string',
                    required: true,
                    message: '请填写姓名',
                    trigger: ['blur', 'change']
                },
                idcard: {
                    type: 'string',
                    required: true,
                    message: '请填写身份证号',
                    trigger: ['blur', 'change']
                },
                type: {
                    type: 'string',
                    required: true,
                    message: '请选择身份类型',
                    trigger: ['blur', 'change']
                },
            },
            id: '',
            isEdit: false,
        }
    },
    onLoad(options) {
        this.isEdit = options.isEdit == 'true' ? true : false;
        this.id = options.id || '';
        this.waitLogin().then(() => {
            this.waitInitConfig().then(() => {
                this.autonym_explain = this.setting.autonym_explain ? parseRichText(this.setting.autonym_explain) : '';
            });
            if (this.id) {
                this.request('idcard.detail', { id: this.id }).then(res => {
                    const data = res.idcard || {};
                    this.formData = {
                        realname: data.realname,
                        idcard: data.idcard,
                        type: data.type,
                        id: this.id,
                    }
                    this.defaultIndex = [Number(data.type)];
                    this.curType = this.columns[0][Number(data.type)];
                })
            }
        })
    },
    methods: {
        onRead(val) {
            this.showPopup = false;
            this.read = val;
        },
        hideKeyboard() {
            uni.hideKeyboard();
        },
        confirm(e) {
            this.formData.type = (e.indexs[0] || 0) + '';
            this.curType = e.value[0] || '身份证';
            this.show = false;
            this.defaultIndex = [Number(this.formData.type)];
        },
        onSubmit() {
            if (this.read) {
                this.$refs.uForm.validate().then(() => {
                    if (!this.formData.realname || !this.formData.idcard || !this.formData.type) {
                        this.myMessage('请填写完整后提交');
                        return;
                    }
                    const params = { ...this.formData };
                    if (this.isEdit) {
                        this.request('idcard.edit', params, 'POST').then(res => {
                            this.myMessage('修改身份信息成功');
                            uni.$emit('refreshIdcardPopupData');
                            setTimeout(() => {
                                this.back();
                            }, 800)
                        });
                    } else {
                        this.request('idcard.add', params, 'POST').then(res => {
                            this.myMessage('添加身份信息成功');
                            uni.$emit('refreshIdcardPopupData');
                            setTimeout(() => {
                                this.back();
                            }, 800)
                        });
                    }
                })
            } else {
                uni.showToast({
                    title: "请先阅读并同意《实名须知》",
                    icon: 'none'
                })
                this.showPopup = true;
            }


        },
    }
};
</script>

<style lang="scss" scoped>
.is-textarea::v-deep .u-form-item {
    .u-form-item__body__left {
        align-items: start !important;
        padding-top: 8px !important;
    }
}

.is-data-picker::v-deep .input-value {
    font-size: #303133 !important;
    font-size: 15px !important;
    padding: 0 !important;
    height: 24px !important;

    .placeholder {
        color: #c0c4cc !important;
        font-size: 15px !important;
    }
}

.page-box::v-deep .u-form-item {
    .u-form-item__body__left {
        width: 75px !important;
    }
}
</style>
