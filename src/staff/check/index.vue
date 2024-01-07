<template>
    <div class="page-box bg-gray-bg box-border">
        <loading />
        <!-- title -->
        <div v-if="infoLoad" class="p-20px bg-red flex justify-between items-center text-white w-100vw box-border"
            id="head">
            <div class="text-16 font-semibold" style="width: calc(100% - 96px)">
                <div>{{ (info.ext.hall_title + " - " + info.ext.film_title) }}</div>
                <div class="text-14px mt-10px font-normal">
                    {{ moment(info.entrance_time * 1000).format('YYYY-MM-DD HH:mm') }}
                </div>
            </div>
            <div class="w-86px h-30px flex text-white justify-center items-center rounded-15px"
                :style="{ background: 'rgba(255,255,255,0.3)' }">
                {{ statusText[Number(info.state)] }}</div>
        </div>
        <div v-else>
            <u-skeleton rows="0" titleWidth="100%" titleHeight="99" title :title="true" loading></u-skeleton>
        </div>
        <!-- 票务总览 -->
        <div v-if="pageLoad" class="p-20px bg-white items-center text-gray-333">
            <div class="text-16 font-semibold items-center flex justify-between">
                <div>票务总览（{{ total }}张）</div>
                <div class="text-14px text-blue font-normal"
                    @click="toPath('/staff/data/index?id=' + id + item.id + '&cinema_id=' + options.cinema_id + '&staff_id=' + options.staff_id)">
                    查看详情
                </div>
            </div>
            <div class="flex justify-between items-center mt-15px">
                <div class="flex-1">
                    <u-line-progress :percentage="buyTotal" activeColor="#FF545C"></u-line-progress>
                </div>
                <div class="ml-10px">
                    已售{{ isBuy }}
                </div>
            </div>
        </div>
        <div v-else class="mt-5px">
            <u-skeleton rows="0" titleWidth="100%" titleHeight="86" title :title="true" loading></u-skeleton>
        </div>

        <div v-if="pageLoad">
            <div class="pb-10px px-15px bg-white">
                <u--input :placeholder="tabIndex == 2 ? '请输入座位号' : '请输入电话/姓名/座位号'" prefixIcon="search" circle
                    v-model="keyword" @change="onChange" clearable @clear="onClear"
                    prefixIconStyle="font-size: 22px;color: #33ABF4"></u--input>
            </div>
            <!-- tabs -->
            <div class="px-10px">
                <u-tabs :current="tabIndex" :list="tabList" @click="changeTab" lineColor="#FF545C"
                    :itemStyle="{ height: '42px' }"
                    :activeStyle="{ color: '#333', fontWeight: 'bold', transform: 'scale(1.05)' }"
                    :inactiveStyle="{ color: '#999999', transform: 'scale(1)' }"></u-tabs>
            </div>
            <!-- tab内容 -->
            <div class="w-full px-20px box-border">
                <div v-if="seatList && !seatList.length" class="mt-10px">
                    <u-empty mode="data" text="空空如也" icon="http://cdn.uviewui.com/uview/empty/data.png">
                    </u-empty>
                </div>
                <!-- 座位列表 -->
                <template v-if="(seatList && seatList.length && boxH)">
                    <div class="bg-white rounded">
                        <scroll-view scroll-y="true" :style="{ height: boxH + 'px' }" class="py-6px box-border"
                            @scrolltolower="searchScrollLower" @scroll="onScroll">
                            <div class="relative" :style="{ height: relaHeight + 'px' }">
                                <div v-for="(item, index) in seatList" :key="index" class="absolute left-0 w-full"
                                    :style="{ top: index * itemHeight + 'px', height: itemHeight + 'px' }">
                                    <div v-if="(index > (targetIndex - moreCount)) && (index < (targetIndex + moreCount))"
                                        class="flex justify-between items-center p-10px px-15px box-border h-full">
                                        <div
                                            class="text-14px font-semibold flex justify-between items-center text-gray-333">
                                            <div class="w-24px h-24px mr-10px flex justify-center items-center"
                                                :style="{ background: tabIndex == 0 ? '#2BC881' : '#bbb' }">
                                                <image class="w-18px h-18px min-w-18px min-h-18px"
                                                    src="../static/seat-sel@10.png" mode="aspectFit">
                                                </image>
                                            </div>
                                            <div>
                                                <div
                                                    style="width: calc(100vw - 220px);text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                                                    {{ item.seat_name }}
                                                </div>
                                                <div v-if="item.realname && tabIndex !== 2"
                                                    style="width: calc(100vw - 220px);text-overflow: ellipsis;overflow: hidden;white-space: nowrap;"
                                                    class="font-normal text-12px text-gray-600 mt-5px">
                                                    {{ item.realname || '-' }}{{ isStaffUser ? '' : ':' }} {{ isStaffUser ? ''
                                                        : (item.mobile || '-') }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center">
                                            <div class="text-red text-12px" v-if="(tabIndex !== 2)">
                                                {{
                                                    item.take_ticket == 1 ?
                                                    moment(Number(item.scan_time * 1000)).format('YYYY-MM-DD HH:mm') :
                                                    '未入场'
                                                }}
                                            </div>
                                            <div class="ml-10px tag-wrap" v-if="(tabIndex === 1)">
                                                <u-tag text="核销" @click="toVerification(item)"></u-tag>
                                            </div>
                                        </div>
                                        <!-- 未售 并且 只能是未开始或者检票中， 才会展示 锁座/解锁 按钮 -->
                                        <div v-if="(tabIndex == 2 && (info.state == 1 || info.state == 2) && !isStaffUser)"
                                            @click="changeLock(item)"
                                            class="w-52px text-white text-14px h-24px flex justify-center items-center rounded-15px"
                                            :style="{ background: item.status == 1 ? '#FF545C' : '#2ACB95' }">
                                            {{ item.status == 1 ? '锁座' : '解锁' }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </scroll-view>
                    </div>
                </template>
            </div>
        </div>

        <!-- 骨架屏 -->
        <div class="mt-20px" v-else>
            <u-skeleton rows="15" titleWidth="100%" titleHeight="50" title :title="true" loading></u-skeleton>
        </div>

        <!-- 底部按钮 -->
        <div class="fixed z-998 pb-20px bottom-0 h-70px flex items-center justify-between px-20px left-0 w-full box-border">
            <u-button shape="circle" size="normal" @click="onScan"
                :customStyle="{ height: '44px', width: 'calc((100vw - 40px) / 2 - 8px)', margin: 0 }" color="#FF5991"
                text="扫码检票">
            </u-button>
            <u-button shape="circle" size="normal" @click="onShowCheckModal"
                :customStyle="{ height: '44px', width: 'calc((100vw - 40px) / 2 - 8px)', margin: 0 }" color="#FF545C"
                text="手动检票">
            </u-button>
        </div>


        <!-- 核销弹窗 -->
        <u-modal :show="showModal" width="580rpx" :title="'手动检票'" showCancelButton :confirmColor="'#FF545C'">
            <view class="py-10px w-full flex items-center justify-between" style="border-bottom: 1px solid #eee">
                <input class="flex-1" placeholder-style="color: #999; font-size: 14px;" placeholder="请输入票码" type="number"
                    v-model="code" @input="inputCode" />
            </view>
            <div slot="confirmButton" class="flex justify-between">
                <u-button shape="circle" size="normal" plain :customStyle="{ height: '44px', width: '30vw', margin: 0 }"
                    color="#999" text="取消" @click="(showModal = false)">
                </u-button>
                <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '30vw', margin: 0 }"
                    color="#FF545C" text="确认" @click="onInputCode">
                </u-button>
            </div>
        </u-modal>

        <!-- 确认核销弹窗 -->
        <u-modal :show="showConfirmModal" width="580rpx" :title="(isQuickMode && isScan) ? '核销完成' : '确认核销'"
            :confirmColor="'#FF545C'">
            <div class="w-full">
                <div class="text-16px text-gray-333 py-6px" style="border-bottom: 1px solid #eee;">
                    <div class="flex items-center">
                        <span class="font-semibold" v-if="affrimData.tickets && affrimData.tickets[0]">{{ affrimData.tickets[0].seat_name }}</span>
                        <span class="font-semibold" v-else>{{ affrimData.ticket.seat_name }}</span>
                        <span class="text-14px text-gray-666 ml-5px">
                            （{{ affrimData.realname }}: {{ affrimData.mobile }}）
                        </span>
                    </div>
                    <!-- 次数 -->
                    <div class="mt-8px text-gray-999 text-14px flex items-center"
                        v-if="affrimData.ticket.times_used && affrimData.ticket.times_used > 1">
                        <span>共计{{ affrimData.ticket.times_used }}次</span>
                        <span class="ml-8px">剩余<span class="text-red">{{ affrimData.ticket.times_remaining
                        }}</span>次</span>
                    </div>
                </div>
            </div>
            <div slot="confirmButton" class="flex justify-between">
                <div class="flex justify-center items-center text-14px w-full text-red" v-if="(isQuickMode && isScan)">
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
            id: '',
            info: {},
            buyTotal: 0,
            isBuy: 0,
            noBuy: 0,
            isEntry: 0,
            noEntry: 0,
            total: 0,
            tabIndex: 0,
            statusText: ['', '未开始', '检票中', '已结束'],
            tabList: [],
            statsNumbers: [2, 1, 3],
            seatList: [],
            curList: [],
            showModal: false,
            code: '',
            showConfirmModal: false,
            isQuickMode: false,
            isScan: false,
            windowHeight: 0,
            boxH: 0,
            infoLoad: false,
            targetIndex: 0,
            itemHeight: 44,  // 单个高度
            moreCount: 300,  // 模拟虚拟滚动上下需要展示的多余的数量
            keyword: '',
            changeTimer: null,
            affrimData: {},
            showTicketConfirmModal: false,
            options: {},
            staffUserInfo: {},
            isStaffUser: false,
        }
    },
    onLoad(options) {
        this.id = options.id;
        this.options = options;
        const staffUserInfo = uni.getStorageSync('StaffUserInfo');
        if (staffUserInfo) {
            this.staffUserInfo = JSON.parse(staffUserInfo);
            if (this.staffUserInfo.type === '1' && options.fromRecord === 'true') {
                this.isStaffUser = true;
            }
        }
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.getData();
        });
    },
    computed: {
        relaHeight() {
            return this.seatList.length * this.itemHeight;
        }
    },
    methods: {
        onScroll(e) {
            // 当前展示的第一个，然后以他为中心，前后30个做展示，其他不展示
            this.targetIndex = Math.ceil(e.detail.scrollTop / this.itemHeight);
        },
        searchScrollLower() {
            if (this.pageFinish) {
                return;
            }
            this.getList();
        },
        changeTab(e) {
            this.tabIndex = e.index;
            this.myCurrentPage = 1;
            this.pageFinish = false;
            this.seatList = []
            this.getList()
        },
        onClear() {
            this.myCurrentPage = 1;
            this.pageFinish = false;
            this.seatList = [];
            this.getList()
        },
        onChange() {
            if (this.changeTimer) {
                clearTimeout(this.changeTimer)
            }
            this.changeTimer = setTimeout(() => {
                this.myCurrentPage = 1;
                this.pageFinish = false;
                this.seatList = [];
                this.getList()
            }, 500)
        },

        // 获取场次基本信息
        getData() {
            this.request("staff.row.show", { row_id: this.id, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }).then(res => {
                this.info = res.item;
                this.isQuickMode = res.scan_mode == 1;
                // this.isQuickMode = false;
                this.infoLoad = true;
                setTimeout(() => {
                    const query = uni.createSelectorQuery().in(this);
                    query.select('#head').boundingClientRect((rect) => {
                        this.windowHeight = uni.getSystemInfoSync().windowHeight;
                        this.boxH = this.windowHeight - 42 - 99 - rect.height - 70 - 10 - 48;
                    }).exec()
                }, 200)
            })
            this.getStatistics()
            this.myCurrentPage = 1;
            this.pageFinish = false;
            this.seatList = [];
            this.getList()
        },
        // 点击锁定/解锁按钮
        changeLock(item) {
            if (item.status == 1) {
                this.lock(item)
            } else {
                this.unLock(item)
            }
        },
        // 锁定
        lock(e) {
            this.request("staff.seat.locking", { row_id: this.id, mark: e.mark, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }, 'POST').then(() => {
                e.status = e.status == 1 ? 4 : 1;
            })
        },
        // 解锁
        unLock(e) {
            this.request("staff.seat.unlock", { row_id: this.id, mark: e.mark, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }, 'POST').then(res => {
                e.status = e.status == 4 ? 1 : 4;
            })
        },
        // 获取统计数据
        getStatistics() {
            this.request("staff.seat.statistics", { row_id: this.id, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }).then(res => {
                this.total = res.sale.total.data;  // 总票数
                this.buyTotal = (res.sale.sold.data / res.sale.total.data * 100).toFixed(2);   // 售出百分比
                this.isBuy = res.sale.sold.data;  // 已售出
                this.noBuy = res.sale.unsold.data;  // 未售出
                this.tabList = [
                    { name: `已入场(${res.tickets.already_verify.data})` },
                    { name: `未入场(${res.tickets.not_verify.data})` },
                    { name: `未售(${res.sale.unsold.data})` },
                ];
                this.pageLoad = true;
            })
        },
        // 获取对应tab的座位列表
        getList() {
            const status = this.statsNumbers[this.tabIndex];
            if (status != 3) {
                this.request("staff.seat.index", { cinema_id: this.options.cinema_id, staff_id: this.options.staff_id, row_id: this.id, status, page: this.myCurrentPage, keyword: this.keyword }).then(res => {
                    const { total, data } = res;
                    this.seatList = [...this.seatList, ...(data || [])];
                    this.myCurrentPage++;
                    this.pageFinish = this.seatList.length >= Number(total);
                }, () => {
                    this.pageFinish = true;
                })
            } else {
                this.request("staff.seat.lock", { row_id: this.id, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id, page: this.myCurrentPage, keyword: this.keyword }).then(res => {
                    const { total, data } = res;
                    this.seatList = [...this.seatList, ...(data || [])].map(el => ({ ...el, seat_name: el.name }));
                    this.myCurrentPage++;
                    this.pageFinish = this.seatList.length >= Number(total);
                }, () => {
                    this.pageFinish = true;
                })
            }
        },

        // 扫码核销
        onScan() {
            this.isScan = true;
            uni.scanCode({
                onlyFromCamera: false,
                // scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
                success: async (result) => {
                    console.log(result, 'resultresult')
                    this.code = result.result;
                    const res = await this.affirm();
                    console.log(res, 'resresres')
                    this.affrimData = res || {};
                    // 如果扫码是取票码，且大于一张
                    if (res.type === 'tickets') {
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
                            this.handleScan();
                        }
                    } else {
                        this.handleScan();
                    }
                },
                fail: (error) => {
                    console.log(error, 'errorerror')
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
                this.myMessage('核销成功')
                this.getData();
                setTimeout(() => {
                    this.showConfirmModal = false;
                    this.onScan()
                }, 1000)
            } else {
                // 20231115改，非连扫，不弹出确认框，直接自动确认，进行核销
                this.handleConfirm();
            }
        },

        // 通过未入场列表直接核销
        async toVerification(item) {
            this.code = item.dynamic;
            const res = await this.affirm();
            this.affrimData = res || {};
            this.showModal = false;
            this.isScan = false;
            this.showConfirmModal = true;
        },

        // 手动检票
        async onInputCode() {
            this.isScan = false;
            this.code = this.code.trim();
            if (!this.code) {
                this.myMessage('请输入票码')
                return;
            }
            const res = await this.affirm();
            this.affrimData = res || {};
            this.showModal = false;
            // 如果扫码是取票码，且大于一张
            if (res.type === 'tickets') {
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
            this.getData();
        },

        // 确认核销-门票扫出来的入场码
        async handleConfirmTicket(item) {
            if (item.disabled) return;
            this.code = item.dynamic;
            await this.scan()
            this.myMessage('核销成功')
            item.disabled = true;
            this.getData();
            // 如果全部核销了，就自动关闭
            if (!this.affrimData.tickets.filter(el => !el.disabled).length) {
                this.showTicketConfirmModal = false;
                if (this.isQuickMode) {
                    this.onScan();
                }
            }
        },

        onShowCheckModal() {
            this.code = '';
            this.showModal = true;
        },

        inputCode(event) {
            this.code = event.detail.value;
            setTimeout(() => {
                this.code = this.code.trim();
            });
        },

        affirm() {
            return this.request("staff.verify.query", { row_id: this.id, dynamic: this.code, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }, 'POST')
        },

        scan() {
            return this.request("staff.verify.push", { row_id: this.id, dynamic: this.code, cinema_id: this.options.cinema_id, staff_id: this.options.staff_id }, 'POST')
        }
    },
};
</script>


<style lang="scss" scoped>
.tag-wrap::v-deep .u-tag {
    height: 20px;
    line-height: 20px;
}
</style>