<template>
    <div class="page-box bg-gray-bg box-border">
        <loading />
        <!-- 倒计时区域 -->
        <div style="background: linear-gradient(180deg, #FF545C 0%, #FF545C 100%);"
            class="p-30px flex flex-col justify-center items-center text-white relative">
            <div class="text-16 font-semibold">剩余确认预约时间 {{ expire_time }}</div>
            <div class="absolute bg-red w-20px h-20px right-0 top-0"></div>
        </div>
        <div class="p-20px pb-80px box-border" v-if="order.id">
            <div class="flex items-center bg-white p-20px rounded-10px">
                <div class="w-80px h-80px mr-10px rounded-10px"
                    :style="{ 'background-image': `url(${'http://mallsaasphoto.djlcom.com/images/1/sonCinema/id_1/fRf7zr4Cxaqs5FFZ5N5RdzrrSSsNKF.jpg'})`, backgroundSize: 'cover' }">
                </div>
                <div class="flex-1">
                    <div class="text-20px font-semibold text-black">{{ order.ext.film_title }}</div>
                    <div class="text-16px text-gray-666 mt-15px">{{ navigation.title }}
                    </div>
                </div>
            </div>
            <!-- 订单信息 -->
            <div class="bg-white p-20px rounded-10px mt-10px">
                <!-- <div class="font-semibold text-gray-333 text-16">{{ order.order_no }}</div> -->
                <div class="flex items-center mt-10px font-normal text-gray-999 text-14 flex items-center">
                    <u-icon size="18px" class="mr-4px" color="#aaa" name="clock"></u-icon>
                    <span>
                        {{ moment(order.create_time * 1000).format('YYYY-MM-DD HH:mm') }}
                    </span>
                </div>
                <div class="flex items-center mt-10px font-normal text-gray-999 text-14">
                    <u-icon size="18px" class="mr-4px" color="#aaa" name="map"></u-icon>
                    {{ navigation.address }}
                </div>
                <u-divider></u-divider>
                <div class="flex items-center text-gray-333 text-14 font-semibold">
                    <u-icon size="18px" class="mr-4px" color="#aaa" name="home"></u-icon>
                    {{ order.ext.hall_title }}
                </div>
                <div class="flex items-center mt-10px font-normal text-gray-999 text-14">
                    <u-icon size="18px" class="mr-4px" color="#aaa" name="coupon"></u-icon>
                    {{ order.ext.film_title }}
                </div>
                <div class="flex items-center mt-10px font-normal text-gray-999 text-14">
                    <u-icon size="18px" class="mr-4px" color="#aaa" name="account"></u-icon>
                    {{ order.seats.map(el => el.name).join('、') }}
                </div>
            </div>

            <!-- 观演人 -->
            <div class="bg-white mt-10px p-20px rounded-10px" v-if="order.is_autonym == 1">
                <div class="text-gray-999 flex justify-between items-center text-14px">实名观演人</div>
                <div class="text-red flex justify-between items-center text-12px mt-10px">
                    仅需选择{{ maxSelectIdcard }}位，入场需携带对应身份证</div>
                <div style="border-top: 1px dashed #ccc" class="h-0px w-full my-10px"></div>
                <div class="text-gray-666 text-14px mt-15px">
                    <div class="flex items-cetner justify-between mb-8px" v-for="(item, index) in curIdacrds" :key="index">
                        <div>
                            <span class=text-gray-333>{{ item.realname }}</span>
                            <span class="ml-10px">{{ item.idcard }}</span>
                        </div>
                        <div @click="onDeleteIdcard(item)">
                            <u-icon size="18px" color="#FF545C" name="trash"></u-icon>
                        </div>
                    </div>
                    <div class="py-8px mt-12px text-red rounded-4px text-14px flex justify-center"
                        style="border: 1px dashed #FF545C;" @click="onShowIdcardPopup">点击选择观影人</div>
                </div>
            </div>

            <!-- 配送方式 -->
            <div class="bg-white mt-10px p-20px rounded-10px">
                <div class="text-gray-999 flex justify-between items-center text-14">配送方式</div>
                <template v-if="rule.ticket_rule.ticket_mode == 1">
                    <div class="mt-10px">{{ rule.ticket_explain.title }}</div>
                    <div class="text-12px text-gray-400 mt-6px leading-4">{{ rule.ticket_explain.desc }}</div>
                    <div class="mt-10px">地址</div>
                    <div class="mt-10px flex justify-between items-center" v-if="curAddress && curAddress.realname"
                        @click="showAddressComp">
                        <div>
                            <div class="text-gray-333"><span class="mr-10px">{{ curAddress.realname }}</span><span>{{
                                curAddress.mobile }}</span>
                            </div>
                            <div class="text-12px text-gray-400 mt-6px leading-4">{{ curAddress.address }}</div>
                        </div>
                        <div class="ml-6px">
                            <u-icon color="#999" name="arrow-right"></u-icon>
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-10px" v-else @click="showAddressComp">
                        <div class="text-14px text-red">点击选择地址</div>
                        <u-icon color="#FF545C" name="arrow-right"></u-icon>
                    </div>
                    <!-- <div class="mt-15px flex justify-between items-center">
                        <div class=text-gray-333>运费</div>
                        <div class="text-14px text-gray-666">¥{{ rule.ticket_rule.express_fee }}</div>
                    </div> -->
                </template>
                <template v-else>
                    <div class="mt-10px">{{ rule.ticket_explain.title }}</div>
                    <div class="text-12px text-gray-400 mt-6px leading-4">{{ rule.ticket_explain.desc }}</div>
                </template>
            </div>

            <!-- 联系人 -->
            <div class="bg-white mt-10px p-20px rounded-10px is-input">
                <!-- 姓名 -->
                <div class="text-gray-999 flex justify-between items-center text-14">联系人</div>
                <div class="mt-10px flex items-center flex-1" v-if="rule.ticket_rule.ticket_mode != '1'">
                    <div class="text-14px font-semibold text-gray-333 w-5em">姓名<span class="text-red">*</span></div>
                    <u--input :customStyle="inputCustomStyle" @change="onCustomChange(user, 'name', $event)"
                        placeholder="请输入姓名" border="surround" class="flex-1" :value="user.name"></u--input>
                </div>
                <!-- 手机号 -->
                <div class="mt-10px flex items-center">
                    <div class="text-14px font-semibold text-gray-333 w-5em">手机号<span class="text-red">*</span></div>
                    <div class="relative h-40px flex-1">
                        <div class="w-full h-full text-14px box-border flex items-center px-20px py-8px rounded"
                            :style="{ background: '#F2F3F5' }"
                            :class="{ 'text-black': user.phone, 'text-gray-999': !user.phone }">
                            {{ user.phone || '点击获取手机号' }}
                        </div>
                        <my-phone-button v-model="user.phone"></my-phone-button>
                    </div>
                </div>

                <!-- 自定义表单 - 快递不需要姓名和自定义表单 -->
                <template v-if="diyform.diyform_set && diyform.fields && diyform.fields.length">
                    <div class="mt-10px flex items-center" v-for="(item, index) in diyform.fields" :key="index">
                        <div class="text-14px font-semibold text-gray-333 w-5em">{{ item.tp_name }}<span
                                v-if="item.tp_must == 1" class="text-red">*</span></div>

                        <u--input v-if="item.data_type == 1" :customStyle="inputCustomStyle" class="flex-1"
                            :placeholder="item.placeholder || ''" border="surround" v-model="diyformData[item.diy_type]">
                        </u--input>
                        <u--input v-if="item.data_type == 6" :customStyle="inputCustomStyle" class="flex-1"
                            :placeholder="item.placeholder || ''" border="surround" v-model="diyformData[item.diy_type]">
                        </u--input>
                        <picker v-if="item.data_type == 2" @change="bindPickerChange($event, item)" class="flex-1"
                            :value="diyformData[item.diy_type]" :range="item.tp_text">
                            <view
                                class="rounded-10px px-20px box-border text-14px text-gray-333 box-border h-40px w-full flex items-center"
                                style="background:#F2F3F5">
                                {{ item.tp_text[diyformData[item.diy_type]] || item.placeholder }}
                            </view>
                        </picker>
                    </div>
                </template>
            </div>
        </div>
        <!-- 骨架屏 -->
        <div v-else class="p-20px pb-80px box-border">
            <div class="mt-10px">
                <u-skeleton rows="3" titleWidth="100%" titleHeight="100" title :title="true" loading></u-skeleton>
            </div>
            <div class="mt-10px">
                <u-skeleton rows="0" titleWidth="100%" titleHeight="100" title :title="true" loading></u-skeleton>
            </div>
            <div class="mt-10px">
                <u-skeleton rows="0" titleWidth="100%" titleHeight="100" title :title="true" loading></u-skeleton>
            </div>
            <div class="mt-10px">
                <u-skeleton rows="0" titleWidth="100%" titleHeight="100" title :title="true" loading></u-skeleton>
            </div>
            <div class="mt-10px">
                <u-skeleton rows="2" titleWidth="100%" titleHeight="100" title :title="false" loading></u-skeleton>
            </div>
        </div>


        <!-- 底部已选展示，购买 -->
        <div
            class="fixed flex px-20px justify-between items-center z-998 bottom-0 h-70px left-0 w-full box-border bg-white">
            <!-- 《服务条款》 -->
            <div class="text-14px box-border flex items-center">
                <image v-if="read" @click="onRead(false)" src="@/static/common/agree-sel@2x.png" class="w-15px h-15px">
                </image>
                <div v-if="!read" @click="showReadPopup = true"
                    class="box-border rounded-full w-15px h-15px border border-solid border-red">
                </div>
                <span class="ml-4px text-gray-333">同意<span class="text-blue"
                        @click="showReadPopup = true">《服务条款》</span></span>
            </div>
            <u-button :disabled="!pageLoad || paying" shape="circle" size="normal"
                :customStyle="{ height: '44px', width: '160px', margin: 0 }"
                color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="立即预约" @click="toPay">
            </u-button>
        </div>

        <!-- 身份证选择 -->
        <u-popup :show="showIdcardPopup" :round="20" @close="showIdcardPopup = false" :safeAreaInsetBottom="false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 选择观演人 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showIdcardPopup = false"></u-icon>
                    </span>
                </div>
                <div class="h-60vh w-100vw">
                    <idcard-list :maxSelect="maxSelectIdcard" v-if="showIdcardPopup" :curSelect="curIdacrds"
                        :isHeight="'60vh'" ref="isIdcard" @onChange="onChangeIdcards" :cinema_id="cinema_id"
                        @onClose="showIdcardPopup = false"></idcard-list>
                </div>
            </div>
        </u-popup>

        <!-- 服务条款 -->
        <u-popup :show="showReadPopup" :round="20" @close="showReadPopup = false" :key="'showReadPopup'">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 服务条款 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showReadPopup = false"></u-icon>
                    </span>
                </div>
                <scroll-view scroll-y="true" class="text-gray-666 max-h-50vh px-15px box-border mt-15px">
                    <u-parse :lazyLoad="true" :selectable="true" :scrollTable="true"
                        :content="mySetting.buy_text"></u-parse>
                </scroll-view>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '200px' }"
                        color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="确定" @click="onRead(true)">
                    </u-button>
                </div>
            </div>
        </u-popup>

        <!-- 地址选择 -->
        <u-popup :show="showAddressPopup" :round="20" @close="showAddressPopup = false" :key="'showAddressPopup'"
            :safeAreaInsetBottom="false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 选择地址 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showAddressPopup = false"></u-icon>
                    </span>
                </div>
                <div class="h-60vh w-100vw">
                    <address-list :cinema_id="cinema_id" :curSelect="curAddress" v-if="showAddressPopup" :isHeight="'60vh'"
                        ref="isAddress" @onChange="onChangeAddress"></address-list>
                </div>
            </div>
        </u-popup>


        <!-- 确认预约 -->
        <u-modal :show="showConfirmBookModal" width="580rpx" :title="'确认预约'" :confirmColor="'#FF545C'">
            <div class="flex flex-col w-full">
                <div class="text-red text-12px flex justify-center mb-5px">出票后不可修改</div>
                <div class="w-full max-h-60vh overflow-y-auto">
                    <div class="text-gray-333 py-6px flex mb-4px">
                        <u-icon class="mr-4px relative top-2px" size="18px" color="#3eaf7c"
                            name="checkmark-circle"></u-icon>
                        <div>
                            时间：{{ moment(order.create_time * 1000).format('YYYY-MM-DD HH:mm') }}
                        </div>
                    </div>
                    <div class="text-gray-333 py-6px flex mb-4px">
                        <u-icon class="mr-4px relative top-2px" size="18px" color="#3eaf7c"
                            name="checkmark-circle"></u-icon>
                        <div>
                            座位：{{ order.seats ? order.seats.map(el => el.name).join('、') : '-' }}
                        </div>
                    </div>
                    <div class="text-gray-333 py-6px flex mb-4px">
                        <u-icon class="mr-4px relative top-2px" size="18px" color="#3eaf7c"
                            name="checkmark-circle"></u-icon>
                        <div>
                            姓名：{{ (curIdacrds && curIdacrds.length ? curIdacrds.map(el =>
                                el.realname).join('、') :
                                user.name) }}
                        </div>
                    </div>
                    <div class="text-gray-333 py-6px flex">
                        <u-icon class="mr-4px relative top-2px" size="18px" color="#3eaf7c"
                            name="checkmark-circle"></u-icon>
                        <div>
                            电话：{{ user.phone }}
                        </div>
                    </div>
                </div>
            </div>
            <div slot="confirmButton" class="flex justify-between w-full">
                <u-button shape="circle" size="normal" plain :customStyle="{ height: '44px', width: '28vw', margin: 0 }"
                    color="#999" text="再想想" @click="cancelConfirmBook">
                </u-button>
                <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '28vw', margin: 0 }"
                    color="#FF545C" text="确认预约" @click="handleConfirmBook">
                </u-button>
            </div>
        </u-modal>
    </div>
</template>

<script>
import { parseRichText } from '@/util';
import moment from 'moment';
import AddressList from '@/order/address-comp/list.vue';
import IdcardList from '@/order/idcard-comp/list.vue';
import MyPhoneButton from '@/components/my-phone-button/index.vue';
export default {
    components: { AddressList, IdcardList, MyPhoneButton },
    data() {
        return {
            showConfirmBookModal: false,
            showIdcardPopup: false,
            curIdacrds: [],
            user: {
                name: '',
                phone: ''
            },
            showReadPopup: false,
            read: false,
            order: {},
            expire_time: '',   // 支付剩余时间
            timer: null,  // 计时器
            diyform: {},
            diyformData: {},
            paying: false,
            timePassed: false,
            showAddressPopup: false,
            curAddress: null,
            maxSelectIdcard: 0,
            order_id: '',
            rule: {},
            navigation: {},
            mySetting: {},
            pay: {},
            _diyFormData: {},
            cinema_id: '',
        }
    },
    onUnload() {
        this.timer && clearInterval(this.timer)
    },
    onLoad(options) {
        this.order_id = options.order_id;
        this.cinema_id = options.cinema_id;
        this.waitLogin().then(() => {
            this.getData();
        });
        this.user.name = uni.getStorageSync('payName') || '';
    },
    methods: {
        onShowIdcardPopup() {
            this.curIdacrds = [...this.curIdacrds]
            this.showIdcardPopup = true;
        },
        onChangeIdcards(e) {
            this.curIdacrds = e || [];
        },
        onDeleteIdcard(item) {
            const index = this.curIdacrds.findIndex(e => e.id === item.id);
            if (index !== -1) {
                this.curIdacrds.splice(index, 1);
            }
        },
        onChangeAddress(e) {
            this.curAddress = e;
            if (e && e.id) {
                this.showAddressPopup = false;
            }
        },
        showAddressComp() {
            this.showAddressPopup = true;
        },
        async getData() {
            this.request('pay.index', { order_id: this.order_id, cinema_id: this.cinema_id }).then(res => {
                this.pageLoad = true;
                this.order = res.order;
                this.pay = res.pay;
                this.navigation = res.navigation;
                this.rule = res.rule;
                this.mySetting = res.setting;
                this.diyform = res.diy_form;
                this.maxSelectIdcard = Number(res.order.number) || 0;
                // 服务条款
                if (this.mySetting.buy_text) {
                    this.mySetting.buy_text = this.mySetting ? parseRichText(this.mySetting.buy_text) : '';
                }
                if (this.timePassed) {
                    return; // 时间过了就不倒计时了
                }
                // 倒计时
                const time = res.order.expire_time;
                this.getExpireTime(time);
                this.timer && clearInterval(this.timer)
                this.timer = setInterval(() => {
                    this.getExpireTime(time);
                }, 1000);
                if (this.rule.ticket_rule.ticket_mode == 1) {
                    this.request('address.defaults', { cinema_id: this.cinema_id }, 'GET').then(res => {
                        this.curAddress = res.address;
                    })
                }
            }, err => {
                uni.showModal({
                    title: '错误',
                    content: err.message || '订单出错啦',
                    showCancel: false,
                    success: () => {
                        this.back()
                    }
                });
            })
        },
        getExpireTime(time) {
            // 等待支付时间结束，清除定时器，重新获取数据,发现超时会重定向到订单状态页order/detail/index去
            if (moment(time * 1000).isBefore(moment())) {
                this.timer && clearInterval(this.timer);
                this.getData();
                this.timePassed = true;
                return;
            }
            const t = (moment(time * 1000).diff(moment())) / 1000;
            let m = Math.floor(t / 60);
            let s = Math.floor(t % 60);
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            this.expire_time = m + ':' + s;
        },
        toPay() {
            if (!this.pageLoad) {
                return;
            }
            if (!this.read) {
                uni.showToast({ title: "请勾选同意服务条款", icon: 'none' })
                this.showReadPopup = true;
                return;
            }
            if ((!this.curAddress || !this.curAddress.id) && this.rule.ticket_rule.ticket_mode == 1) {
                uni.showToast({ title: "请选择票务配送地址", icon: 'none' })
                return;
            }
            if (this.order.is_autonym == 1 && this.curIdacrds.length != this.maxSelectIdcard) {
                uni.showToast({ title: `请选择${this.maxSelectIdcard}位观演人`, icon: 'none' })
                return;
            }
            // 快递模式不需要姓名
            if (this.rule.ticket_rule.ticket_mode == '0' && !this.user.name) {
                uni.showToast({ title: "请填写姓名", icon: 'none' })
                return;
            }
            // 没手机号（快递模式也要，以免地址电话是错得）
            if (!this.user.phone) {
                uni.showToast({ title: '请授权手机号', icon: 'none' })
                return;
            }
            if (this.paying) {
                uni.showToast({ title: "操作频繁，请稍后重试", icon: 'none' })
                return;
            }
            if (this.diyform.diyform_set && this.diyform.fields && this.diyform.fields.length) {
                // 检查自定义表单必填
                for (let index = 0; index < this.diyform.fields.length; index++) {
                    const el = this.diyform.fields[index];
                    if (el.tp_must == 1 && !this.diyformData[el.diy_type]) {
                        uni.showToast({ title: el.placeholder, icon: 'none' });
                        return;
                    }
                }
                // 整理自定义表单数据
                this._diyFormData = { ...this.diyformData };
                for (const key in this._diyFormData) {
                    if (Object.hasOwnProperty.call(this._diyFormData, key)) {
                        let ele = this._diyFormData[key];
                        const curDiy = this.diyform.fields.find(el => el.diy_type === key);
                        if (curDiy.data_type == 2) {
                            this._diyFormData[key] = [ele + '', curDiy.tp_text[ele]];
                        }
                    }
                }
            }
            this.paying = true;
            this.showConfirmBookModal = true;
        },

        cancelConfirmBook() {
            this.paying = false;
            this.showConfirmBookModal = false;
        },
        handleConfirmBook() {
            const params = {
                order_id: this.order_id,
                realname: this.user.name,
                mobile: this.user.phone,
                form_id: this.diyform.form_id,
                address_id: '',
                diydata: encodeURIComponent(JSON.stringify(this._diyFormData)),
            }
            if (this.rule.ticket_rule.ticket_mode == 1) {
                params.address_id = this.curAddress.id;
                params.realname = this.curAddress.realname;
            } else {
                params.realname = this.user.name;
                params.mobile = this.user.phone;
            }
            if (this.order.is_autonym == 1) {
                params.autonym_ids = this.curIdacrds.map(el => el.id).join(',');
            }
            uni.setStorageSync('payName', this.user.name);
            this.request('pay.payment' + '&cinema_id=' + this.cinema_id, params, 'POST').then(res => {
                this.showConfirmBookModal = false;
                tt.booking({
                    orderId: res.orderId,
                    bookInfo: res.bookInfo,
                    scene: 2,
                    success: (res) => {
                        console.log('booking: success-res', res);
                        this.confirmVerification();
                    },
                    fail: (err) => {
                        console.log('booking: fail-err', err);
                        uni.showToast({ title: err.errMsg, icon: 'none' });
                        this.paying = false;
                        this.showConfirmBookModal = false;
                    }
                })
            })
        },
        confirmVerification() {
            uni.redirectTo({
                url: '/order/detail/index?order_id=' + this.order_id + '&cinema_id=' + this.cinema_id,
            });
            this.paying = false;
        },
        handlerPaySuccess() {
            this.toOrderDetail();
        },
        toOrderDetail() {
            this.paying = false;
            setTimeout(() => {
                uni.redirectTo({
                    url: '/order/detail/index?order_id=' + this.order_id + '&cinema_id=' + this.cinema_id,
                });
            }, 1000);
        },
        onRead(val) {
            this.read = val;
            this.showReadPopup = false;
        },
    }
};
</script>

<style scoped>
.last-mb-0:last-child {
    margin-bottom: 0px !important;
}
</style>