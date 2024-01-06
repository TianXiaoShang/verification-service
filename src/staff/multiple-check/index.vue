<template>
    <div class="page-box bg-white box-border">
        <loading />
        <!-- title -->
        <div class="p-20px bg-white flex items-center text-white w-100vw box-border justify-around">
            <div class="flex flex-col items-center justify-center" @click="changeType('code')">
                <u-icon name="edit-pen" size="30px" :color="curType === 'code' ? '#FF545C' : '#aaa'"></u-icon>
                <span class="mt-6px text-14px" :style="{ color: curType === 'code' ? '#FF545C' : '#aaa' }">输入码</span>
            </div>
            <div class="flex flex-col items-center justify-center" @click="changeType('scan')">
                <u-icon name="scan" size="30px" :color="curType === 'scan' ? '#FF545C' : '#aaa'"></u-icon>
                <span class="mt-6px text-14px" :style="{ color: curType === 'scan' ? '#FF545C' : '#aaa' }">扫一扫</span>
            </div>
        </div>
        <!-- 输入码 -->
        <div style="height: calc(100vh - 90px - 64px);" class="w-full box-border" v-if="curType === 'code'">
            <div class="p-20px box-border bg-white w-full box-border">
                <u--input placeholder="请输入检票码" circle v-model="code" clearable @clear="code = ''"></u--input>
            </div>
        </div>
        <!-- 扫码检票 -->
        <div style="height: calc(100vh - 90px);" class="flex flex-col items-center justify-center w-full box-border"
            v-if="curType === 'scan'">
            <div class="box-border bg-white flex flex-col justify-center items-center box-border" @click="onScan">
                <u-icon name="fingerprint" size="70px" color="#FF545C"></u-icon>
                <span class="mt-5px text-14px text-gray-600">点击扫码</span>
            </div>
        </div>

        <!-- 输入码检票按钮 -->
        <div v-if="curType === 'code'"
            class="fixed z-998 bottom-20px h-44px flex items-center justify-center px-20px left-0 w-full box-border">
            <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '80vw', margin: 0 }"
                color="#FF545C" text="查询票码" @click="onInputCode">
            </u-button>
        </div>

        <!-- 确认核销弹窗 -->
        <u-modal :show="showConfirmModal" width="580rpx" :title="(isQuickMode && curType === 'scan') ? '核销完成' : '确认核销'"
            :confirmColor="'#FF545C'">
            <div class="w-full">
                <div class="text-16px text-gray-333 py-6px" style="border-bottom: 1px solid #eee;">
                    <div class="flex items-center">
                        <span class="font-semibold">{{ affrimData.seat_name }}</span>
                        <span class="text-14px text-gray-666 ml-5px">
                            （{{ affrimData.realname }}: {{ affrimData.mobile }}）
                        </span>
                    </div>
                    <!-- 次数 -->
                    <div class="mt-8px text-gray-999 text-14px flex items-center"
                        v-if="affrimData.usable_times && affrimData.usable_times > 1">
                        <span>共计{{ affrimData.usable_times }}次</span>
                        <span class="ml-8px">剩余<span class="text-red">{{ affrimData.remaining_times
                        }}</span>次</span>
                    </div>
                </div>
            </div>
            <div slot="confirmButton" class="flex justify-between">
                <div class="flex justify-center items-center text-14px w-full text-red"
                    v-if="(isQuickMode && curType === 'scan')">
                    即将继续扫码...</div>
                <template v-else>
                    <u-button shape="circle" size="normal" plain :customStyle="{ height: '44px', width: '30vw', margin: 0 }"
                        color="#999" text="取消" @click="(showConfirmModal = false)">
                    </u-button>
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '30vw', margin: 0 }"
                        color="#FF545C" text="确认" @click="handleConfirm">
                    </u-button>
                </template>
            </div>
        </u-modal>


        <!-- 门票-确认核销弹窗 -->
        <u-modal :show="showTicketConfirmModal" width="580rpx" :title="'确认核销'" :confirmColor="'#FF545C'">
            <div class="w-full max-h-60vh overflow-y-auto">
                <div class="text-gray-333 py-6px" style="border-bottom: 1px solid #eee;">
                    <div class="flex items-center justify-between mb-10px" v-for="(item, index) in affrimData.tickets"
                        :key="index">
                        <div class="">
                            <div class="font-semibold text-16px">{{ item.seat_name }}</div>
                            <div class="text-14px text-gray-666 mt-5px">
                                {{ item.realname || affrimData.realname }}: {{ item.mobile || affrimData.mobile }}
                            </div>
                        </div>
                        <u-tag :type="item.disabled ? 'info' : 'primary'" :text="item.disabled ? '已核销' : '核销'"
                            @click="handleConfirmTicket(item)"></u-tag>
                    </div>
                </div>
            </div>
            <div slot="confirmButton" class="flex justify-center">
                <u-button shape="circle" size="normal" plain :customStyle="{ height: '44px', width: '60vw', margin: 0 }"
                    color="#999" text="取消" @click="(showTicketConfirmModal = false)">
                </u-button>
            </div>
        </u-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            code: '',
            film_ids: [],
            row_ids: [],
            curType: 'code',
            isQuickMode: true,
            showConfirmModal: false,
            affrimData: {},
            showTicketConfirmModal: false,
            options: {}

        }
    },
    onLoad(options) {
        this.options = options;
        const localData = uni.getStorageSync('checkSession_ids');
        if (localData) {
            const data = JSON.parse(localData);
            this.film_ids = data.film_ids;
            this.row_ids = data.row_ids;
        } else {
            this.myMessage('未找到需要核销的场次');
            setTimeout(() => {
                this.back();
            }, 1000)
        }
        this.waitLogin().then(() => {
            this.request("staff.setting.index", { cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }).then(res => {
                this.isQuickMode = res.setting.scan_mode == 1;
            })
        });
    },
    methods: {
        changeType(type) {
            this.code = '';
            this.curType = type;
        },
        // 扫码核销
        onScan() {
            uni.scanCode({
                onlyFromCamera: false,
                // scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
                success: async (result) => {
                    this.code = result.result;
                    if (!this.code) {
                        this.myMessage(error.message, '扫描错误')
                        return;
                    }
                    let res;
                    try {
                        res = await this.affirm(this.code);
                        this.affrimData = res || {};
                        // 如果扫码是取票码，且大于一张
                        if (res.type === 'ticket') {
                            if (!this.affrimData.tickets || !this.affrimData.tickets.length) {
                                this.myMessage('无门票信息')
                                return;
                            }
                            // 多张
                            if (this.affrimData.tickets.length > 1) {
                                this.affrimData.tickets.forEach(el => el.disabled = false);
                                this.showTicketConfirmModal = true;
                            } else {
                                this.code = this.affrimData.tickets[0].dynamic;
                                // 单张照旧
                                this.handleScan();
                            }
                        } else {
                            this.handleScan();
                        }
                    } catch (error) {
                        setTimeout(() => {
                            this.myMessage(error.message || '核销错误')
                        }, 100)
                    }
                },
                fail: (error) => {
                    this.myMessage(error.errMsg || '扫描失败')
                }
            });
        },

        // 进行核销处理
        async handleScan() {
            // 是否连扫模式
            if (this.isQuickMode) {
                this.showConfirmModal = true;
                await this.scan()
                setTimeout(() => {
                    this.showConfirmModal = false;
                    this.onScan()
                }, 800)
            } else {
                // 20231115改，非连扫，不弹出确认框，直接自动确认，进行核销
                this.handleConfirm();
            }
        },

        // 手动检票
        async onInputCode() {
            this.code = this.code.trim();
            if (!this.code) {
                this.myMessage('请输入票码')
                return;
            }
            const res = await this.affirm(this.code);
            this.affrimData = res || {};
            // 如果扫码是取票码，且大于一张
            if (res.type === 'ticket') {
                if (!this.affrimData.tickets || !this.affrimData.tickets.length) {
                    this.myMessage('无门票信息')
                }
                // 多张
                if (this.affrimData.tickets.length > 1) {
                    this.affrimData.tickets.forEach(el => el.disabled = false);
                    this.showTicketConfirmModal = true;
                } else {
                    this.code = this.affrimData.tickets[0].dynamic;
                    // 单张照旧
                    this.showConfirmModal = true;
                }
            } else {
                this.showConfirmModal = true;
            }
        },

        // 手动检票 - 确认核销
        async handleConfirm() {
            this.showConfirmModal = false;
            await this.scan()
            this.myMessage('核销成功')
        },

        // 确认核销-门票扫出来的入场码
        async handleConfirmTicket(item) {
            if (item.disabled) return;
            this.code = item.dynamic;
            await this.scan()
            this.myMessage('核销成功')
            item.disabled = true;
            this.affrimData = { ...this.affrimData };
            // 如果全部核销了，就自动关闭
            if (!this.affrimData.tickets.filter(el => !el.disabled).length) {
                this.showTicketConfirmModal = false;
                if (this.isQuickMode) {
                    this.onScan();
                }
            }
        },

        affirm() {
            return this.request("staff.verify.union_query" + '&cinema_id=' + this.options.cinema_id + '&staff_id=' + this.options.staff_id, { row_ids: this.row_ids.join(','), film_ids: this.film_ids.join(','), dynamic: this.code }, 'POST')
        },

        scan() {
            return this.request("staff.verify.union_push" + '&cinema_id=' + this.options.cinema_id + '&staff_id=' + this.options.staff_id, { row_ids: this.row_ids.join(','), film_ids: this.film_ids.join(','), dynamic: this.code }, 'POST')
        }
    },

};
</script>


<style lang="scss" scoped></style>