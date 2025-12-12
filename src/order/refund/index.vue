<template>
    <div class="page-box bg-gray-bg box-border p-20px pb-84px overflow-y-auto">
        <loading />
        <div class="rounde is-input p-15px bg-white rounded">
            <div class="flex items-center bg-white py-10px" style="border-bottom: 1px solid #eee">
                <div class="text-14px font-semibold text-fonts w-4em">选择<span class="text-red ml-2px">*</span>
                </div>
                <div class="text-14px" :style="{
                    color: formData.reason ? '#606266' : '#ccc'
                }" @click="show = true">{{ formData.reason || '请选择退款原因' }}</div>
            </div>
            <div class="bg-white py-10px rounded mt-10px">
                <div class="flex text-14px font-semibold text-fonts w-full mb-10px">退款描述<span
                        class="text-red ml-2px">*</span>
                </div>
                <div style="border-radius: 10px; border: 1px solid #ccc;">
                    <u--textarea :height="150" v-model="formData.desc" placeholder="请输入内容" count
                        :maxlength="500"></u--textarea>
                </div>
            </div>
            <div class="text-14px" v-if="refund_desc && refund_desc.length">
                <div class="text-red font-semibold mb-6px">退款说明</div>
                <div class="mb-10px relative w-full box-border leading-5 text-fonts-sec"
                    v-for="(item, index) in refund_desc" :key="index">
                    {{ index + 1 }}、{{ item }}
                </div>
            </div>
        </div>
        <!-- 底部按钮 -->
        <div class="fixed z-998 bottom-20px h-44px flex items-center justify-center px-20px left-0 w-full box-border">
            <u-button shape="circle" size="normal" :disabled="saveing"
                :customStyle="{ height: '44px', width: '160px', margin: 0 }" color="#FF3F54" text="提交申请"
                @click="confirm">
            </u-button>
        </div>
        <u-picker :show="show" ref="uPicker" :title="'请选择'" :cancelText="'取消'" :confirmText="'确认'"
            :cancelColor="'#999999'" :confirmColor="'#FF3F54'" :showToolbar="true" :immediateChange="true"
            :columns="columns" @confirm="bindPickerConfirm"></u-picker>
        <!-- 退款确认弹窗 -->
        <u-modal :show="showTip" :title="'提示'" showCancelButton @confirm="confirmRefund" @cancel="cancelRefund">
			<div class="slot-content">
                <div class="text-fonts indent-2em leading-6">{{ tipText }}</div>
                <div class="text-fonts-sec mt-8px text-14px flex justify-end">*有疑问请联系客服</div>
			</div>
		</u-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            formData: {
                desc: '',
                reason: '',
                order_id: ''
            },
            columns: [],
            show: false,
            saveing: false,
            refund_desc: [],
            showTip: false,
            tipText: '',
        }
    },
    onLoad(options) {
        this.formData.order_id = options.id;
        this.waitLogin().then(() => {
            this.request('refund', { order_id: options.id }).then(res => {
                this.columns = [res.reason || []];
                this.refund_desc = res.refund_desc || [];
            });
        });
    },
    methods: {
        confirm() {
            if (!this.formData.desc || !this.formData.reason) {
                this.myMessage('请填写完整后提交');
                return;
            }
            this.saveing = true;
            this.request('refund.tip', this.formData, 'POST').then(res => {
                if (res.tip) {
                    this.showTip = true;
                    this.tipText = res.tip;
                } else {
                    this.startRefund();
                }
            });
        },
        confirmRefund(){
            this.showTip = false;
            this.startRefund();
        },
        cancelRefund(){
            this.saveing = false;
            this.showTip = false;
            this.tipText = '';
        },
        startRefund(){
            this.request('refund.submit', this.formData, 'POST').then(res => {
                this.myMessage('操作成功');
                this.back();
                this.saveing = false;
            }, () => {
                this.myMessage('操作失败');
                this.saveing = false;
            })
        },
        bindPickerConfirm(e) {
            this.formData.reason = e.value[0];
            this.show = false;
        }
    }
};
</script>