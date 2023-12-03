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
                <div class="mt-15px font-semibold text-[#3D3D3D] text-16px">手机号<span class="text-red">*</span></div>
                <u-form-item prop="mobile" borderBottom>
                    <u--input v-model="formData.mobile" border="none" type="number" placeholder="请输入手机号"></u--input>
                </u-form-item>
                <div class="mt-15px font-semibold text-[#3D3D3D] text-16px">地区<span class="text-red">*</span></div>
                <u-form-item prop="area" borderBottom>
                    <uni-data-picker v-if="showAreaPicker" class="is-data-picker" placeholder="请选择地区" popup-title="请选择地区"
                        v-model="formData.area" :localdata="myAreaData" :border="false"
                        @change="onAreaChange"></uni-data-picker>
                </u-form-item>
                <div class="mt-15px font-semibold text-[#3D3D3D] text-16px">详细地址<span class="text-red">*</span></div>
                <u-form-item prop="detail" borderBottom>
                    <u--input v-model="formData.detail" border="none" placeholder="请填写详细地址"></u--input>
                </u-form-item>
                <!-- <div class="is-textarea">
                    <u-form-item prop="detail" borderBottom>
                        <u--textarea v-model="formData.detail" border="none" placeholder="请填写详细地址"></u--textarea>
                    </u-form-item>
                </div> -->
            </u--form>
        </div>
        <div class="fixed z-90 bottom-20px h-44px flex items-center justify-center px-20px left-0 w-full box-border">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" :text="orderId ? '确认修改' : '保存'" @click="onSubmit">
            </u-button>
        </div>
    </div>
</template>

<script>
import UniDataPicker from './components/uni-data-picker/uni-data-picker.vue';
import AreaData from './data.js';
export default {
    components: { UniDataPicker },
    data() {
        return {
            myAreaData: [],
            curAreaData: [],
            formData: {
                realname: '',
                mobile: '',
                area: "",
                detail: ''
            },
            rules: {
                realname: {
                    type: 'string',
                    required: true,
                    message: '请填写姓名',
                    trigger: ['blur', 'change']
                },
                mobile: {
                    type: 'string',
                    required: true,
                    message: '请填写手机号',
                    trigger: ['blur', 'change']
                },
                detail: {
                    type: 'string',
                    required: true,
                    message: '请填写详细地址',
                    trigger: ['blur', 'change']
                },
                area: {
                    type: 'string',
                    required: true,
                    message: '请选择地区',
                    trigger: ['blur', 'change']
                },
            },
            id: '',
            isEdit: false,
            showAreaPicker: false,
            orderId: '',  // 有orderId为直接修改订单地址
            cinema_id: '',
        }
    },
    onLoad(options) {
        this.isEdit = options.isEdit == 'true' ? true : false;
        this.id = options.id || '';
        this.cinema_id = options.cinema_id;
        this.orderId = options.orderId || '';
        if (this.orderId || this.id) {
            uni.setNavigationBarTitle({
                title: '修改地址'
            });
        }
        // 地区数据
        this.areaData = AreaData;
        this.loadAreaData(this.areaData);
        this.waitLogin().then(() => {
            if (this.id) {
                this.request('address.show', { address_id: this.id, cinema_id: this.cinema_id}).then(res => {
                    const data = res.address || {};
                    this.formData = {
                        realname: data.realname,
                        mobile: data.mobile,
                        detail: data.detail,
                        area: data.area_code,
                        id: this.id,
                    }
                    this.curAreaData = [
                        { text: data.province, value: data.province_code },
                        { text: data.city, value: data.city_code },
                        { text: data.area, value: data.area_code },
                    ]
                })
            }
        })
    },
    methods: {
        loadAreaData() {
            this.myAreaData = [];
            // 省
            this.areaData.forEach(item => {
                if (!item.parent_code) {
                    item.value = item.code;
                    item.text = item.name;
                    this.myAreaData.push(item)
                }
            })
            // 市区
            this.myAreaData.forEach(item => {
                this.findChild(item)
            })
            this.showAreaPicker = true;
        },
        findChild(item) {
            this.areaData.forEach(el => {
                el.value = el.code;
                el.text = el.name;
                if (el.parent_code === item.code) {
                    if (item.children) {
                        item.children.push(el)
                    } else {
                        item.children = [];
                        item.children.push(el)
                    }
                    if (el.type == 1) {
                        this.findChild(el)
                    }
                }
            })
        },
        onAreaChange(e) {
            this.curAreaData = e.detail.value;
        },
        onSubmit() {
            this.$refs.uForm.validate().then((res) => {
                if (!this.curAreaData[0] || !this.curAreaData[1] || !this.curAreaData[2] || !this.formData.area || !this.formData.mobile || !this.formData.detail) {
                    this.myMessage('请填写完整后提交');
                    return;
                }
                const params = { ...this.formData };
                params.province = this.curAreaData[0].text;
                params.city = this.curAreaData[1].text;
                params.area = this.curAreaData[2].text;
                params.province_code = this.curAreaData[0].value;
                params.city_code = this.curAreaData[1].value;
                params.area_code = this.curAreaData[2].value;
                // if (this.orderId) {
                //     params.order_id = this.orderId;
                //     delete params.id;
                //     this.request('address.updateAddress', params, 'POST').then(res => {
                //         this.myMessage('修改地址成功');
                //         setTimeout(() => {
                //             this.back();
                //         }, 800)
                //     });
                //     return;
                // }
                if (this.isEdit) {
                    params.address_id = this.id;
                    this.request('address.update&cinema_id=' + this.cinema_id, params, 'POST').then(res => {
                        this.myMessage('修改地址成功');
                        uni.$emit('refreshAddressPopupData');
                        setTimeout(() => {
                            this.back();
                        }, 800)
                    });
                } else {
                    this.request('address.store&cinema_id=' + this.cinema_id, params, 'POST').then(res => {
                        this.myMessage('添加地址成功');
                        uni.$emit('refreshAddressPopupData');
                        setTimeout(() => {
                            this.back();
                        }, 800)
                    });
                }
            })
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
