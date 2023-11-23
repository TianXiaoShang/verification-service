<template>
    <div class="page-box bg-gray-bg box-border">
        <loading />
        <!-- 倒计时区域 -->
        <div style="background: linear-gradient(180deg, #FF545C 0%, #FF545C 100%);"
            class="p-30px flex flex-col justify-center items-center text-white relative">
            <div class="text-16 font-semibold">剩余支付时间 {{ payTime }}</div>
            <div class="absolute bg-red w-20px h-20px right-0 top-0" @click="showLogPopup = true"></div>
        </div>
        <div class="p-20px pb-122px box-border" v-if="order.id">
            <!-- 订单信息 -->
            <div class="bg-white p-20px rounded-10px">
                <div class="font-semibold text-gray-333 text-16">{{ order.order_no }}</div>
                <div class="mt-10px font-normal text-gray-999 text-14 flex items-center">
                    <span>
                        {{ moment(order.entrance_time * 1000).format('YYYY-MM-DD HH:mm') }}
                    </span>
                    <div v-if="order.is_live == 1" class="inline-block live-tag-bg-img ml-6px">
                        直播
                    </div>
                </div>
                <div class="mt-10px font-normal text-gray-999 text-14">{{ myCinema.address }}</div>
                <u-divider></u-divider>
                <div class="text-gray-333 text-14 font-semibold">{{ myCinema.title }}</div>
                <!-- 直播场次 -->
                <div class="mt-10px font-normal text-gray-999 text-14" v-if="order.is_live == 1">
                    {{ order.film_title }}
                </div>
                <div class="mt-10px font-normal text-gray-999 text-14" v-else>{{ order.film_title }} | {{ order.hall_title
                }} |
                    {{ order.seats.map(el => el.name).join('、') }}
                </div>
            </div>

            <!-- 进场方式 -->
            <!-- <div class="bg-white mt-10px p-20px rounded-10px">
                <div class="font-semibold text-gray-333 flex justify-between items-center text-14">
                    <span>{{ ticket_explain.title }}</span>
                    <span class="text-blue font-normal">{{ ticket_explain.detail_enter_desc }}</span>
                </div>
                <div class="mt-10px font-normal text-gray-999 text-14">{{ ticket_explain.desc }}</div>
            </div> -->

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
                <template v-if="ticket_rule.ticket_mode == 1">
                    <div class="mt-10px">{{ ticket_explain.title }}</div>
                    <div class="text-12px text-gray-400 mt-6px leading-4">{{ ticket_explain.desc }}</div>
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
                    <div class="mt-15px flex justify-between items-center">
                        <div class=text-gray-333>运费</div>
                        <div class="text-14px text-gray-666">¥{{ ticket_rule.express_fee }}</div>
                    </div>
                </template>
                <template v-else>
                    <div class="mt-10px">{{ ticket_explain.title }}</div>
                    <div class="text-12px text-gray-400 mt-6px leading-4">{{ ticket_explain.desc }}</div>
                </template>
            </div>

            <!-- 联系人 -->
            <div class="bg-white mt-10px p-20px rounded-10px is-input">
                <!-- 快递不需要姓名和自定义表单 -->
                <div class="text-gray-999 flex justify-between items-center text-14">联系人</div>
                <div class="mt-10px flex items-center flex-1"
                    v-if="ticket_rule.ticket_mode != 1 && filmData.is_realname_hide == '0'">
                    <div class="text-14px font-semibold text-gray-333 w-5em">姓名<span class="text-red">*</span></div>
                    <u--input :customStyle="inputCustomStyle" @change="onCustomChange(user, 'name', $event)"
                        placeholder="请输入姓名" border="surround" class="flex-1" :value="user.name"></u--input>
                </div>
                <!-- setting.mobile_verify不为1走授权验证 -->
                <div class="mt-10px flex items-center" v-if="setting.mobile_verify != 1">
                    <div class="text-14px font-semibold text-gray-333 w-5em">手机号<span class="text-red">*</span></div>
                    <div class="relative h-40px flex-1">
                        <div class="w-full h-full text-14px box-border flex items-center px-20px py-8px rounded"
                            :style="{ background: '#F2F3F5' }"
                            :class="{ 'text-black': user.phone, 'text-gray-999': !user.phone }">
                            {{ user.phone || '点击获取手机号' }}
                        </div>
                        <my-phone-button v-model="user.phone" :phone="member.order_mobile"></my-phone-button>
                    </div>
                </div>
                <!-- setting.mobile_verify为1则手动输入，不走授权 -->
                <div class="mt-10px flex items-center flex-1" v-else>
                    <div class="text-14px font-semibold text-gray-333 w-5em">手机号<span class="text-red">*</span></div>
                    <u--input :customStyle="inputCustomStyle" type="number" placeholder="请输入手机号" border="surround"
                        class="flex-1" v-model="user.phone"></u--input>
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

            <!-- 优惠券 -->
            <div class="bg-white mt-10px p-20px rounded-10px" v-if="!pay.offline && payType !== 'annual'"
                @click="onShowCoupon">
                <div class="font-semibold text-gray-333 flex justify-between items-center text-14">
                    <span>优惠券</span>
                    <span class="text-gray-999 font-normal flex items-center"
                        :style="{ color: isContinueToPay ? '#ccc !important' : '' }">
                        <span class="mr-4px">{{ hasEnbalCoupon ? showCouponName : '暂无可用优惠券' }}</span>
                        <u-icon color="#999" name="arrow-right"></u-icon>
                    </span>
                </div>
            </div>

            <!-- 增值服务 -->
            <div class="bg-white mt-10px p-20px rounded-10px is-input"
                v-if="order.charge.charge_price > 0 && order.charge.charge_open == 1">
                <div class="">
                    <u-checkbox-group v-model="charge_radio" shape="circle">
                        <div class="w-full">
                            <div class="flex justify-between items-center">
                                <div class="flex">
                                    <div class="flex flex-col">
                                        <span class="text-14 text-gray-333 font-semibold">
                                            {{ order.charge.charge_name }}
                                        </span>
                                        <span class="font-normal text-12px mt-4px text-blue"
                                            @click="showChargePopup = true">查看详情</span>
                                    </div>
                                </div>
                                <div class="flex">
                                    <div class="text-gray-999 text-14 mr-8px"> ￥{{ order.charge.charge_price }} </div>
                                    <div class="w-22px h-22px">
                                        <u-checkbox size="22px" activeColor="#FF545C" :label="' '" name="true">
                                        </u-checkbox>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </u-checkbox-group>
                </div>
            </div>

            <!-- 支付方式 -->
            <div class="bg-white mt-10px p-20px rounded-10px is-input" v-if="pageLoad">
                <div class="text-gray-999 flex justify-between items-center text-14">支付方式</div>
                <div class="mt-10px">
                    <u-radio-group v-model="payType">
                        <div class="w-full">
                            <div class="flex justify-between" v-if="pay.wechat && money !== 0 && isWx">
                                <div class="flex">
                                    <image src="../static/wechat@2x.png" class="w-22px h-22px" alt="" />
                                    <div class="ml-10px flex flex-col">
                                        <span class="text-gray-333 font-semibold">微信支付</span>
                                        <span class="font-normal text-10px mt-4px text-yellow">
                                            {{ pay.wechat.desc || '' }}</span>
                                    </div>
                                </div>
                                <div class="w-22px h-22px">
                                    <u-radio size="22px" activeColor="#FF545C" :label="' '" :disabled="!pay.wechat.enable"
                                        name="wechat"></u-radio>
                                </div>
                            </div>
                            <div class="flex justify-between" v-if="pay.tiktok && money !== 0 && !isWx">
                                <div class="flex">
                                    <image src="../static/toutiao@2x.png" class="w-22px h-22px" alt="" />
                                    <image src="../static/wechat@2x.png" class="w-22px h-22px ml-3px" alt="" />
                                    <image src="../static/alipay.png" class="w-22px h-22px ml-3px" alt="" />
                                    <div class="ml-10px flex flex-col">
                                        <span class="text-gray-333 font-semibold">立即支付</span>
                                        <span class="font-normal text-10px mt-4px text-yellow">
                                            {{ pay.tiktok.desc || '' }}</span>
                                    </div>
                                </div>
                                <div class="w-22px h-22px">
                                    <u-radio size="22px" activeColor="#FF545C" :label="' '" :disabled="!pay.tiktok.enable"
                                        name="tiktok"></u-radio>
                                </div>
                            </div>
                            <div class="flex justify-between mt-20px" v-if="pay.card && money !== 0">
                                <div class="flex">
                                    <image src="../static/balance@2x.png" class="w-22px h-22px" alt="" />
                                    <div class="ml-10px flex flex-col">
                                        <span class="text-gray-333 font-semibold">
                                            余额支付
                                            <span class="text-12px ml-8px">¥{{ pay.card.money || 0 }}</span>
                                        </span>
                                        <span class="font-normal text-10px mt-4px text-yellow">
                                            {{ pay.card.desc || '' }}</span>
                                    </div>
                                </div>
                                <div class="w-22px h-22px">
                                    <u-radio size="22px" activeColor="#FF545C" :label="' '" :disabled="!pay.card.enable"
                                        name="card"></u-radio>
                                </div>
                            </div>
                            <!-- 不是权益卡支付的时候，如果金额为0，则隐藏，让用户选择免费购票 -->
                            <div class="mt-20px" v-if="pay.annual && (payType === 'annual' ? true : money !== 0)">
                                <div class="flex justify-between">
                                    <div class="flex">
                                        <image src="../static/vip@2x.png" class="w-22px h-22px" alt="" />
                                        <div class="ml-10px flex flex-col">
                                            <span class="text-gray-333 font-semibold">
                                                权益卡兑换
                                            </span>
                                            <span class="font-normal text-10px mt-4px text-yellow">
                                                {{ pay.annual ? pay.annual.desc : '' }}</span>
                                        </div>
                                    </div>
                                    <div class="w-22px h-22px">
                                        <u-radio size="22px" activeColor="#FF545C" :label="' '"
                                            :disabled="!pay.annual || !pay.annual.enable" name="annual"></u-radio>
                                    </div>
                                </div>
                                <!-- 权益卡选择 -->
                                <div v-if="payType === 'annual'" @click="tapAnnulType()"
                                    class="flex items-center ml-32px mt-4px text-14px">
                                    <span class="text-red mr-5px underline">{{
                                        curConfirmAnnual.name || '请选择'
                                    }}</span>
                                    <u-icon name="arrow-right-double" color="#FF545C"></u-icon>
                                </div>
                            </div>
                            <!-- 如果金额为0，并且不是用的权益卡支付方式，则用免费购票 -->
                            <div class="flex justify-between mt-20px" v-if="money === 0 && payType !== 'annual'">
                                <div class="flex">
                                    <image src="../static/free@2x.png" class="w-22px h-22px" alt="" />
                                    <div class="ml-10px flex flex-col">
                                        <span class="text-gray-333 font-semibold">免费购票 (￥0)</span>
                                    </div>
                                </div>
                                <div class="w-22px h-22px">
                                    <u-radio size="22px" activeColor="#FF545C" :label="' '" name="offline"></u-radio>
                                </div>
                            </div>
                        </div>
                    </u-radio-group>
                </div>
            </div>
        </div>
        <!-- 骨架屏 -->
        <div v-else class="p-20px pb-122px box-border">
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
        <div class="fixed z-998 bottom-0 h-100px left-0 w-full box-border bg-white">
            <!-- 《服务条款》 -->
            <div class="h-40px pt-15px text-14px box-border px-20px flex items-center">
                <image v-if="read" @click="onRead(false)" src="@/static/common/agree-sel@2x.png" class="w-15px h-15px">
                </image>
                <div v-if="!read" @click="showReadPopup = true"
                    class="box-border rounded-full w-15px h-15px border border-solid border-red">
                </div>
                <span class="ml-4px text-gray-333">同意<span class="text-blue"
                        @click="showReadPopup = true">《服务条款》</span></span>
            </div>
            <!-- 购买 -->
            <div class="h-60px px-20px justify-between flex items-center">
                <div class="flex">
                    <div class="text-red flex items-center">
                        <span class="text-12 ml-3px relative top-2px">¥</span>
                        <span class="text-18px font-semibold">{{ money }}</span>
                    </div>
                    <div class="text-333 text-12 flex items-center ml-5px" @click="showPopup = true">
                        <span>价格明细</span>
                        <div class="ml-3px">
                            <u-icon name="arrow-up-fill" size="10px" color="#333"></u-icon>
                        </div>
                    </div>
                </div>
                <u-button :disabled="!pageLoad || paying" shape="circle" size="normal"
                    :customStyle="{ height: '44px', width: '160px', margin: 0 }"
                    color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="提交订单" @click="toPay">
                </u-button>
            </div>
        </div>

        <!-- 优惠券 -->
        <u-popup :show="showCouponPopup" :round="20" @close="showCouponPopup = false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0  border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 优惠券 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showCouponPopup = false"></u-icon>
                    </span>
                </div>
                <div class="text-gray-666 px-15px box-border mt-15px">
                    <u-radio-group v-model="curCoupon">
                        <div class="w-full">
                            <div class="flex justify-between items-center w-full">
                                <span class="text-14 font-semibold text-gray-333">
                                    不使用优惠券
                                </span>
                                <div class="w-22px h-22px">
                                    <u-radio size="22px" activeColor="#FF545C" :label="' '" :name="'none'">
                                    </u-radio>
                                </div>
                            </div>
                            <scroll-view scroll-y="true" class="max-h-50vh box-border mt-15px">
                                <div class="flex mb-10px justify-between bg-red p-2px rounded border border-red border-solid  overflow-hidden"
                                    v-for="(item, index) in couponList" :key="index">
                                    <div class="flex flex-col text-white justify-center items-center bg-red p-15px">
                                        <div class="font-semibold special-text">
                                            <span class="text-14px">¥</span>
                                            <span class="text-28px">
                                                {{ item.is_viewing == 1 ? '观影券' : item.deduct }}
                                            </span>
                                        </div>
                                        <div class="text-10px font-normal mt-5px -mb-5px">
                                            {{ item.condition }}
                                        </div>
                                    </div>
                                    <div class="flex items-center relative justify-between px-20px py-15px flex-1"
                                        :class="{ 'bg-white': curCoupon !== item.id, 'bg-red-100': curCoupon === item.id }"
                                        style="border-radius: 0 10px 10px 0;">
                                        <div>
                                            <div class="text-gray-333 text-16px font-semibold">{{ item.name }}</div>
                                            <div class="text-gray-999 text-12px mt-8px">{{ item.subtract }}</div>
                                            <div class="text-gray-999 text-10px mt-15px">{{ item.strtime }}</div>
                                        </div>
                                        <div class="w-22px h-22px min-w-22px">
                                            <u-radio :disabled="item.disabled" size="22px" activeColor="#FF545C"
                                                :label="' '" :name="item.id">
                                            </u-radio>
                                        </div>
                                        <div class="absolute top-0 bottom-0 -left-4px flex flex-col justify-between">
                                            <div :class="{ 'bg-white': curCoupon !== item.id, 'bg-red-100': curCoupon === item.id }"
                                                class="rounded-full w-8px h-8px" v-for="el in 7" :key="el">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </scroll-view>
                        </div>
                    </u-radio-group>
                </div>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '200px' }"
                        color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="确定" @click="onSelectCoupon()">
                    </u-button>
                </div>
            </div>
        </u-popup>

        <!-- 权益卡 -->
        <u-popup :show="showAnnualPopup" :round="20" @close="onCloseAnnual()">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 请选择权益卡 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="onCloseAnnual()"></u-icon>
                    </span>
                </div>
                <div class="inline-flex items-center justify-center w-full box-border px-15px pt-15px pb-5px bg-gray-bg"
                    v-if="curConfirmAnnual.id">
                    <span class="text-13px mr-5px underline text-red" @click="cancelAnnual()">
                        取消用权益卡
                    </span>
                    <u-icon name="minus-circle-fill" color="#FF545C" size="18px"></u-icon>
                </div>
                <div class="text-gray-666 p-15px pt-10px box-border bg-gray-bg max-h-50vh overflow-y-auto">
                    <div class="last-mb-0 rounded mb-10px bg-white px-20px py-16px box-border" :style="{
                        border: curAnnual.id === item.id ? '2px solid red' : '',
                    }" v-for="(item, index) in annual_card_list" :key="index" @click="onClickAnnual(item)">
                        <div class="text-gray-333 font-semibold text-14px">{{ item.name }}</div>
                        <div class="text-gray-999 font-normal text-12px mt-8px">卡号：{{ item.order_no }}</div>
                        <div class="text-gray-999 text-12px mt-8px font-normal" v-if="item.part_name">可选分区：{{
                            item.part_name
                        }}</div>
                        <div class="text-yellow text-12px mt-8px font-normal" v-if="item.no_part">不可选分区：{{
                            item.no_part
                        }}</div>
                        <template v-if="item.is_row == 1 && item.is_pay == 1 && !(item.no_seat && item.no_seat.length)">
                            <div class="flex justify-between text-gray-333 text-10px mt-8px">
                                <div class="w-1/2">影片限购：{{ item.film_num_use }}/{{ item.film_num }}</div>
                                <div class="text-red w-1/2">场次限购：{{ item.row_num_use }}/{{ item.row_num }}</div>
                            </div>
                            <div class="flex justify-between text-gray-333 text-10px mt-8px">
                                <div class="w-1/2">每座消耗：{{ item.buy_num }}张</div>
                                <div class="w-1/2">使用情况：{{ item.expend_num }}/{{ item.surplus_num }}</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="flex mt-8px items-center">
                                <u-icon name="info-circle-fill" color="#FF545C"></u-icon>
                                <span class="ml-5px text-red text-13px">
                                    {{ item.is_row == 1 ? '不支持的权益卡' : '不支持的场次' }}
                                </span>
                            </div>
                        </template>
                        <template v-if="(item.is_seat && item.is_seat.length) || (item.no_seat && item.no_seat.length)">
                            <u-divider></u-divider>
                            <div class="flex w-full items-center mb-6px" v-if="item.is_seat && item.is_seat.length">
                                <div class="text-green text-12px font-semibold inline-block w-72px">可选座位：</div>
                                <div class="overflow-hidden h-25px box-border overflow-x-auto relative"
                                    style="white-space: nowrap; width: calc(100% - 75px)">
                                    <div class="inline-flex mr-10px items-center bg-gray-bg px-10px py-2px border rounded-5px box-border border-solid border-gray-ddd"
                                        v-for="(item, index) in item.is_seat" :key="index">
                                        <div class="w-16px h-16px mr-4px" :style="{ background: '#2BC881' }">
                                            <image class="w-16px h-16px min-w-16px min-h-16px"
                                                src="../static/seat-sel@10.png" mode="aspectFill">
                                            </image>
                                        </div>
                                        <span class="text-gray-333 leading-relaxed text-12px">
                                            {{ item }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex w-full items-center" v-if="item.no_seat && item.no_seat.length">
                                <div class="text-red text-12px font-semibold inline-block">不可选座位：</div>
                                <div class="overflow-hidden h-25px box-border overflow-x-auto relative"
                                    style="white-space: nowrap; width: calc(100% - 75px)">
                                    <div class="inline-flex mr-10px items-center bg-gray-bg px-10px py-2px border rounded-5px box-border border-solid border-gray-ddd"
                                        v-for="(item, index) in item.no_seat" :key="index">
                                        <div class="w-16px h-16px mr-4px" :style="{ background: '#FF545C' }">
                                            <image class="w-16px h-16px min-w-16px min-h-16px"
                                                src="../static/seat-sel@10.png" mode="aspectFill">
                                            </image>
                                        </div>
                                        <span class="text-gray-333 leading-relaxed text-12px">
                                            {{ item }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :disabled="!curAnnual.id"
                        :customStyle="{ height: '44px', width: '200px' }" color="#FF545C" text="确定"
                        @click="onConfirmAnnual()">
                    </u-button>
                </div>
            </div>
        </u-popup>

        <u-popup :show="showPopup" :closeOnClickOverlay="true" :round="20" @close="showPopup = false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 费用明细 </span>
                    <u-icon name="close" size="18px" @click="showPopup = false"></u-icon>
                </div>
                <scroll-view scroll-y="true" class="text-gray-666 max-h-60vh px-15px box-border mt-15px">
                    <div class="mb-25px">
                        <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                            <span>票品总价</span>
                            <span>¥{{ original_price }}</span>
                        </div>
                        <div class="mt-15px text-12px text-gray-999" v-if="order.seats && order.seats.length">
                            {{ order.seats.map(el => el.name).join('、') }}
                        </div>
                    </div>
                    <div class="mb-25px" v-if='disInfo.ticket_mode == 1'>
                        <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                            <span>运费</span>
                            <span>¥{{ disInfo.express_fee }}</span>
                        </div>
                    </div>
                    <!-- 有增值费，且打开了增值收费，且勾选了增值收费 -->
                    <template
                        v-if="order.charge.charge_price > 0 && order.charge.charge_open == 1 && charge_radio && charge_radio.length">
                        <div class="text-gray-999 pb-10px text-12px flex justify-center items-center">
                            <div class="h-0 w-1/3" style="border-top: 1px solid #eee"></div>
                            <span class='mx-10px'> 增值项 </span>
                            <div class="h-0 w-1/3" style="border-top: 1px solid #eee"></div>
                        </div>
                        <!-- 增值收费 -->
                        <div class="mb-25px">
                            <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                                <span>{{ order.charge.charge_name }}</span>
                                <span class="text-blue">+¥{{ order.charge.charge_price }}</span>
                            </div>
                            <div class="mt-15px text-12px text-blue" @click="showPopup = false; showChargePopup = true">
                                增值收费说明</div>
                        </div>
                    </template>

                    <!-- 有任意优惠项目 -->
                    <template v-if="disInfo.is_level || disInfo.is_coupon == 1 || pay.part_discount">
                        <div class="text-gray-999 pb-10px text-12px flex justify-center items-center">
                            <div class="h-0 w-1/3" style="border-top: 1px solid #eee"></div>
                            <span class='mx-10px'> 优惠项 </span>
                            <div class="h-0 w-1/3" style="border-top: 1px solid #eee"></div>
                        </div>
                        <!-- 折扣信息 -->
                        <div class="mb-25px" v-if="disInfo.is_level">
                            <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                                <span>{{ disEnum[disInfo.is_level] }}</span>
                                <span class="text-red" v-if="disInfo.is_level !== 6">-¥{{ disInfo.discount }}</span>
                            </div>
                            <div class="mt-15px text-12px text-gray-999">{{ Number(disInfo.level_discounts) }}折</div>
                        </div>
                        <!-- 优惠券信息 -->
                        <div class="mb-25px" v-if="disInfo.is_coupon == 1">
                            <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                                <span>优惠券</span>
                                <span class="text-red">-¥{{ disInfo.coupon_price }}</span>
                            </div>
                            <div class="mt-15px text-12px text-gray-999">{{ disInfo.coupon_name }}</div>
                        </div>
                        <!-- 套票折扣 -->
                        <div class="mb-25px" v-if="pay.part_discount">
                            <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                                <span>套票折扣</span>
                                <span class="text-red">-¥{{ pay.part_discount }}</span>
                            </div>
                            <div class="mt-15px text-12px text-gray-999"
                                v-if="part_desc && part_desc.length && setting.part_discount_mode == 1">
                                <div v-for="(item, index) in part_desc" :key="index" class="mt-8px">
                                    {{ item.name }} 满{{ item.discount_num }}张减{{ item.discount_price }}元
                                </div>
                            </div>
                            <div class="mt-15px text-12px text-gray-999" v-else>套票满减</div>
                        </div>
                        <!-- 限时折扣 -->
                        <div class="mb-25px" v-if="limit_discount">
                            <div class="text-gray-333 text-14px font-semibold flex justify-between items-center">
                                <span>限时折扣</span>
                                <span class="text-red">-¥{{ limit_discount }}</span>
                            </div>
                            <div class="mt-15px text-12px text-gray-999"
                                v-if="limit_desc && limit_desc.length && setting.part_discount_mode == 1">
                                <div v-for="(item, index) in limit_desc.filter(el => !!el.discount)" :key="index"
                                    class="mt-8px">
                                    {{ item.name }} - 限时优惠{{ item.discount }}元
                                </div>
                            </div>
                            <div class="mt-15px text-12px text-gray-999" v-else>套票满减</div>
                        </div>
                    </template>
                    <!-- 当前价格 -->
                    <div class="text-gray-999 pb-10px text-12px flex justify-center items-center">
                        <div class="h-0 w-1/3" style="border-top: 1px solid #eee"></div>
                        <span class='mx-10px'> 合计 </span>
                        <div class="h-0 w-1/3" style="border-top: 1px solid #eee"></div>
                    </div>
                    <div class="mb-25px">
                        <div class="text-red text-14px font-semibold flex justify-between items-center">
                            <span>当前价格</span>
                            <span>¥{{ money }}</span>
                        </div>
                    </div>
                </scroll-view>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '200px' }"
                        color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="确定" @click="showPopup = false">
                    </u-button>
                </div>
            </div>
        </u-popup>

        <!-- 增值费用 -->
        <u-popup :show="showChargePopup" :round="20" @close="showChargePopup = false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 增值收费说明 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showChargePopup = false"></u-icon>
                    </span>
                </div>
                <scroll-view scroll-y="true"
                    class="text-gray-666 text-14px max-h-50vh px-15px box-border mt-15px min-h-10vh">
                    {{ order.charge.charge_desc }}
                </scroll-view>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '200px' }"
                        color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="确定"
                        @click="showChargePopup = false">
                    </u-button>
                </div>
            </div>
        </u-popup>


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
                        :isHeight="'60vh'" ref="isIdcard" @onChange="onChangeIdcards"
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
                    <u-parse :lazyLoad="true" :selectable="true" :scrollTable="true" :content="global.buy_text"></u-parse>
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
                    <address-list :curSelect="curAddress" v-if="showAddressPopup" :isHeight="'60vh'" ref="isAddress"
                        @onChange="onChangeAddress"></address-list>
                </div>
            </div>
        </u-popup>
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
            showIdcardPopup: false,
            curIdacrds: [],
            id: '',
            order: {},
            user: {
                name: '',
                phone: ''
            },
            payType: '',
            showPopup: false,
            showReadPopup: false,
            showCouponPopup: false,
            showChargePopup: false,
            showAnnualPopup: false,  // 权益卡选择弹窗
            read: false,

            money: 0,
            myCinema: {},
            order: {},
            global: {},
            ticket_explain: {},
            member: {},
            pay: {},
            payTime: '',   // 支付剩余时间
            total: 0,  // 订单金额
            canAnnualTotal: 0,
            annualTotal: 0,
            timer: null,  // 计时器
            couponList: [], // 优惠券列表
            hasEnbalCoupon: false, // 是否有可用优惠券
            curCoupon: 'none',
            showCouponName: '',
            diyform: {},
            diyformData: {},
            charge_radio: '', // 增值服务
            disInfo: {},
            disEnum: ['', '会员价', '半价日', '特殊人群', '兑换观影优惠券', '自定义优惠', '0元购票', '影片会员折扣', '权益卡消费'],
            annual_card_list: [],

            oldPayType: '',
            curAnnual: {},  // 维持选中状态用
            curConfirmAnnual: {},  // 最终选中用

            hasCanUseAnnualCard: {},
            alreadyShowAnnualPopup: false,
            paying: false,
            timePassed: false,
            ticket_rule: {},
            showAddressPopup: false,
            curAddress: null,
            part_desc: null,
            limit_desc: null,
            original_price: 0,
            limit_discount: 0,
            maxSelectIdcard: 0,
            showLogPopup: false,
            filmData: {},
        }
    },
    computed: {
        // 如果是继续支付
        isContinueToPay() {
            return Number(this.order.channel) === 3 && this.order.tiktoksop_order_id != '';
        }
    },
    watch: {
        curCoupon() {
            if (this.curCoupon && this.curCoupon !== 'none') {
                this.showCouponName = this.couponList.find(el => el.id === this.curCoupon).name;
            } else {
                this.showCouponName = '';
            }
            this.getCalculate();
        },
        payType(val, oldValue) {
            // 权益卡支付方式特殊处理
            if (val === 'annual') {
                // 记住上次的支付方式，如果没选权益卡，则恢复勾选上次的支付方式；
                this.oldPayType = oldValue;
                // 赋值选中状态
                this.curAnnual = this.curConfirmAnnual;
                this.curCoupon = 'none';  // 清空优惠券
                this.showAnnualPopup = true;
            } else {
                this.curAnnual = {};
                this.curConfirmAnnual = {};
                this.getCalculate();
            }
        },
        charge_radio: {
            handler() {
                this.getCalculate();
            },
            deep: true
        }
    },
    onUnload() {
        this.timer && clearInterval(this.timer)
    },
    onLoad(options) {
        this.id = options.id;
        // 确保已经登录完成
        this.waitLogin().then(() => {
            this.updateSettingInit();
            this.waitInitConfig().then(() => {
                this.getData();
                if (this.userInfo.mobile) {
                    this.user.phone = this.userInfo.mobile;
                }
                try {
                    const name = uni.getStorageSync('payName')
                    if (name) {
                        this.user.name = name || '';
                    }
                } catch (error) { }
            })
        });
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
        // 选中情况下再次点击，打开权益卡选择弹窗
        tapAnnulType() {
            if (this.payType === 'annual') {
                this.oldPayType = 'annual';
                this.showAnnualPopup = true;
                this.curAnnual = this.curConfirmAnnual;
            }
        },
        // 确认选择权益卡
        onConfirmAnnual() {
            this.showAnnualPopup = false;
            this.curConfirmAnnual = this.curAnnual;
            this.getCalculate();
        },
        // 点击权益卡
        onClickAnnual(item) {
            if (item.is_pay == 0 || item.is_row == 0 || (item.no_seat && item.no_seat.length)) {
                // uni.showToast({ title: "该权益卡无法使用", icon: 'none' })
            } else {
                this.curAnnual = item;
            }
        },
        // 关闭权益卡
        onCloseAnnual() {
            this.showAnnualPopup = false;
            this.payType = this.oldPayType || this.pay.default;
        },
        // 取消使用权益卡
        cancelAnnual() {
            this.showAnnualPopup = false;
            this.curAnnual = {};
            this.curConfirmAnnual = {};
            this.payType = this.pay.default
        },
        bindPickerChange(e, item) {
            this.diyformData[item.diy_type] = Number(e.detail.value);
        },
        onShowCoupon() {
            if (this.isContinueToPay) {
                return;  // 此时不能重新选择优惠券
            }
            if (this.couponList.length) {
                this.showCouponPopup = true;
            }
        },
        // 选择优惠券
        onSelectCoupon() {
            this.showCouponPopup = false;
        },
        async getData() {
            await this.getOrderPayment();
            await this.getCouponList();
            await this.getDiyForm();
            this.getCalculate();
        },
        getOrderPayment() {
            return this.request("order.new_payment", {
                order_id: this.id
            }, 'POST').then(res => {
                this.pay = res.pay;
                this.filmData = res.film;
                this.myCinema = res.cinema;
                this.order = res.order;
                this.global = res.global;
                this.ticket_explain = res.ticket_explain;
                this.ticket_rule = res.ticket_rule;
                this.member = res.member;
                this.total = res.order.total;
                this.charge_radio = res.order.charge.charge_open == 1 ? ['true'] : [];
                this.maxSelectIdcard = Number(res.order.number) || 0;
                // 根据环境强行改变
                if (this.isWx && this.pay.default === 'tiktok') {
                    this.pay.default = 'wechat'
                }
                if (!this.isWx && this.pay.default === 'wechat') {
                    this.pay.default = 'tiktok'
                }
                this.payType = this.pay.default;
                this.annual_card_list = this.pay.annual ? this.pay.annual.annual_card || [] : [];

                // 只在第一次试图帮助弹出权益卡选择框
                if (!this.alreadyShowAnnualPopup) {
                    this.alreadyShowAnnualPopup = true;
                    this.hasCanUseAnnualCard = this.annual_card_list.find(item => this.canUseAnnualCard(item));
                    if (this.hasCanUseAnnualCard) {
                        this.showAnnualPopup = true;
                        this.oldPayType = this.pay.default;
                        this.payType = 'annual';
                        setTimeout(() => {
                            this.curAnnual = this.hasCanUseAnnualCard;
                            uni.showToast({ title: "您有可使用的权益卡，请点击确认使用", icon: 'none' })
                        })
                    }
                } else {
                    this.hasCanUseAnnualCard = {};
                }

                // 服务条款
                if (this.global.buy_text) {
                    this.global.buy_text = parseRichText(this.global.buy_text)
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
                if (this.ticket_rule.ticket_mode == 1) {
                    this.request('address.defaults').then(res => {
                        this.curAddress = res.address && res.address.id ? res.address : null;
                    })
                }
            })
        },
        canUseAnnualCard(item) {
            return item.is_row == 1 && item.is_pay == 1 && !(item.no_seat && item.no_seat.length);
        },
        getDiyForm() {
            // 自定义表单
            return this.request("order.payDiyForm", { order_id: this.id }).then(res => {
                if (res.fields && res.fields.length) {
                    res.fields.forEach(el => {
                        if (el.data_type == 1 || el.data_type == 6) {
                            this.diyformData[el.diy_type] = '';
                        } else if (el.data_type == 2) {
                            this.diyformData[el.diy_type] = res.f_data[el.diy_type][0] || 0;
                        }
                    })
                }
                this.diyform = res;
            })
        },
        getCouponList() {
            // 获取优惠券
            return this.request("coupon.used", {
                order_id: this.id
            }).then(res => {
                let flag = false;
                this.couponList = res.list;
                // 如果是继续支付且已经选了优惠券
                const tiktokFlag = this.isContinueToPay && this.order.is_coupon == 1 && this.order.coupon_id;
                res.list.forEach((ele, i) => {
                    if (tiktokFlag && ele.id == this.order.coupon_id) {
                        this.curCoupon = ele.id;
                        this.showCouponName = ele.name;
                        flag = true;
                    }
                    // 是否有可用优惠券
                    if (ele.status == 1) {
                        this.hasEnbalCoupon = true;
                    }
                    if (parseFloat(this.total) < parseFloat(ele.enough) || ele.status != 1) {
                        // 没到满减条件或状态为非可用状态1
                        ele.disabled = true;
                    }
                    // 如果有可用的权益卡，就不用优惠券
                    if (this.hasCanUseAnnualCard && this.hasCanUseAnnualCard.id) {
                        return;
                    }
                    // 默认选中一个可用优惠券
                    if (!flag && !ele.disabled) {
                        this.curCoupon = ele.id;
                        this.showCouponName = ele.name;
                        flag = true;
                    }
                })
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
            this.payTime = m + ':' + s;
        },
        getCalculate() {
            if (!this.payType) {
                return;
            }
            // 如果是权益卡，又没有权益卡id，则可能是切换支付方式时，但又还没选择权益卡时触发的，此时计算为之前的金额即可
            if (!this.curConfirmAnnual.id && this.payType === 'annual') {
                return;
            }
            const params = {
                order_id: this.id,
                data_id: this.curConfirmAnnual.id,
                type: this.payType,
                realname: this.user.name,
                mobile: this.user.phone,
                form_id: this.diyform.form_id,
                coupon_id: this.curCoupon === 'none' ? '' : this.curCoupon,
                charge_radio: this.charge_radio && this.charge_radio.length ? 1 : '',   // 多选框有值则1，否则空
                _showLoading: false,
            }
            this.request('order.calculate', params, 'POST').then(res => {
                this.money = res ? (res.total !== undefined ? res.total : res.price) : 0;
                // 在第一次计算完成后才展示支付方式
                this.pageLoad = true;
                this.disInfo = res;
                this.part_desc = res.part_desc;
                this.limit_discount = res.limit_discount;
                this.limit_desc = res.limit_desc;
                this.original_price = res.original_price;
                if (this.payType === 'annual') {
                    return;
                }
                // 如果计算完以后是0，则改成免费购票方式
                if (this.money === 0) {
                    this.payType = 'offline';
                } else {
                    // 如果不为0，判断是不是免费购票，如果是免费购票，金额又不为0（比如切换了优惠券，可能金额不为0，不能继续使用免费购票方式），则改成默认支付方式
                    this.payType = this.payType === 'offline' ? this.pay.default : this.payType;
                }
            })
        },
        toPay() {
            if (!this.pageLoad) {
                return;
            }
            if (!this.payType) {
                uni.showToast({ title: "请选择支付方式", icon: 'none' })
                return;
            }
            if (!this.read) {
                uni.showToast({ title: "请勾选同意服务条款", icon: 'none' })
                this.showReadPopup = true;
                return;
            }
            if ((!this.curAddress || !this.curAddress.id) && this.ticket_rule.ticket_mode == 1) {
                uni.showToast({ title: "请选择票务配送地址", icon: 'none' })
                return;
            }
            if (this.order.is_autonym == 1 && this.curIdacrds.length != this.maxSelectIdcard) {
                uni.showToast({ title: `请选择${this.maxSelectIdcard}位观演人`, icon: 'none' })
                return;
            }
            // 快递模式不需要手机号信姓名
            if (this.filmData.is_realname_hide == '0' && !this.user.name && this.ticket_rule.ticket_mode != 1) {
                uni.showToast({ title: "请填写姓名", icon: 'none' })
                return;
            }
            // 没手机号（快递模式也要，以免地址电话是错得）
            if (!this.user.phone) {
                if (this.setting.mobile_verify != 1) {
                    uni.showToast({ title: '请授权手机号', icon: 'none' })
                } else {
                    uni.showToast({ title: '请输入手机号', icon: 'none' })
                }
                return;
            }
            if (this.paying) {
                uni.showToast({ title: "支付操作频繁，请稍后重试", icon: 'none' })
                return;
            }
            this.paying = true;
            // 微信的话要做订阅消息,直播场次不需要这里的订阅，直接用列表页的直播订阅
            if (this.isWx && this.global.is_user_inform == 1 && this.order.is_live != 1) {
                wx.requestSubscribeMessage({
                    tmplIds: [this.global.user_buy_id],
                    success: () => {
                        this.startPay();
                    },
                    fail: () => {
                        this.startPay();
                    }
                })
            } else {
                this.startPay();
            }
        },
        startPay() {
            // 整理自定义表单数据
            const _diyFormData = { ...this.diyformData };
            for (const key in _diyFormData) {
                if (Object.hasOwnProperty.call(_diyFormData, key)) {
                    let ele = _diyFormData[key];
                    const curDiy = this.diyform.fields.find(el => el.diy_type === key);
                    if (curDiy.data_type == 2) {
                        _diyFormData[key] = [ele + '', curDiy.tp_text[ele]];
                    }

                    if (curDiy.tp_must == 1 && !_diyFormData[key]) {
                        uni.showToast({ title: curDiy.placeholder, icon: 'none' });
                        this.paying = false;
                        return;
                    }
                }
            }

            const params = {
                order_id: this.id,
                data_id: this.curConfirmAnnual.id,
                type: this.payType,
                price: this.money,
                diydata: encodeURIComponent(JSON.stringify(_diyFormData)),
                form_id: this.diyform.form_id,
                coupon_id: this.curCoupon === 'none' ? '' : this.curCoupon,
                charge_radio: this.charge_radio && this.charge_radio.length ? 1 : '',   // 多选框有值则1，否则空
                // _showToast: true
            }
            if (this.ticket_rule.ticket_mode == 1) {
                params.address_id = this.curAddress.id;
                params.realname = this.curAddress.realname;
                params.mobile = this.curAddress.mobile;
            } else {
                params.realname = this.user.name;
                params.mobile = this.user.phone;
            }
            if (this.order.is_autonym == 1) {
                params.autonym_ids = this.curIdacrds.map(el => el.id).join(',');
            }
            uni.setStorageSync('payName', this.user.name);
            // 免费购买
            if (this.payType === 'offline') {
                this.request("order.pays", params, 'POST').then(res => {
                    this.toOrderDetail();
                }, () => {
                    this.paying = false;
                })
            }
            // 余额支付
            if (this.payType === 'card') {
                if (!this.pay.card.enable) {
                    uni.showToast({ title: '不支持余额支付，请选择其他支付方式！', icon: 'none' })
                    this.paying = false;
                    return;
                }
                if (Number(this.pay.card.money) < this.money) {
                    uni.showToast({ title: '余额不足', icon: 'none' })
                    this.paying = false;
                    return;
                }
                uni.showModal({
                    title: '余额支付',
                    content: '确定使用余额支付吗？',
                    success: (res) => {
                        if (res.confirm) {
                            this.request("order.pays", params, 'POST').then(res => {
                                this.toOrderDetail();
                            }, () => {
                                this.paying = false;
                            })
                        } else {
                            this.paying = false;
                            uni.showToast({ title: '取消支付', icon: 'none' })
                        }
                    }
                });
                return;
            }

            // 微信支付
            if (this.payType == 'wechat' && this.isWx) {
                this.request("order.pays", params, 'POST').then(res => {
                    wx.requestPayment({
                        timeStamp: res.wechat.timeStamp,
                        nonceStr: res.wechat.nonceStr,
                        package: res.wechat.package,
                        signType: res.wechat.signType,
                        paySign: res.wechat.paySign,
                        success: () => {
                            this.handlerPaySuccess();
                        },
                        fail: () => {
                            this.handlerPayFail();
                        }
                    });
                }, () => {
                    this.paying = false;
                })
                this.paying = false;
                return;
            }
            // 抖音支付
            if (this.payType == 'tiktok' && !this.isWx) {
                if (Number(this.order.channel) === 3 && this.order.tiktoksop_order_id != '') {
                    this.continueToPay(this.order.order_no);
                    return;
                }
                this.request("order.pays", params, 'POST').then(res => {
                    if (Number(this.order.channel) === 3) {
                        if (res.totalAmount > 0) {
                            this.tiktokCreateOrder(res.skuList, res.totalAmount, res.callbackData);
                            return;
                        } else {
                            uni.showToast({ title: '付款失败', icon: 'none' })
                            this.paying = false;
                            return;
                        }
                    } else {
                        if (!res && !res.tiktok) {
                            uni.showToast({ title: '唤起收银台错误', icon: 'none' })
                            this.paying = false;
                            return;
                        }
                        tt.pay({
                            orderInfo: {
                                order_id: res.tiktok.order_id,
                                order_token: res.tiktok.order_token
                            },
                            service: 5,
                            success: (res) => {
                                if (res.code == 0) {
                                    // 支付成功处理逻辑，只有res.code=0时，才表示支付成功
                                    // 但是最终状态要以商户后端结果为准
                                    this.handlerPaySuccess();
                                } else {
                                    res.code != 0 && uni.showToast({ title: this.tiktokStatusTextArr[res.code], icon: 'none' })
                                    this.paying = false;
                                }
                            },
                            fail: (res) => {
                                console.log('fail', res)
                                this.handlerPayFail();
                            },
                        });
                    }
                }, () => {
                    this.paying = false;
                })
                return;
            }

            // 权益卡支付
            if (this.payType == 'annual') {
                params.price = 0;
                params.coupon_id = '';
                this.request("order.pays", params, 'POST').then(res => {
                    this.toOrderDetail();
                }, () => {
                    this.paying = false;
                })
                return;
            }
        },
        handlerPayFail() {
            // 调起收银台失败处理逻辑
            this.paying = false;
            uni.showToast({ title: '支付失败', icon: 'none' })
        },
        handlerPaySuccess() {
            if (this.isWx) {
                uni.showLoading({
                    title: '请稍等...'
                });
            }
            setTimeout(() => {
                if (this.isWx) {
                    uni.hideLoading();
                }
                this.refreshData().then(res => {
                    this.toOrderDetail();
                }, () => {
                    this.paying = false;
                })
            }, 1000)
        },
        refreshData() {
            return this.request("order.success", {
                order_id: this.id,
                _showToast: this.isWx
            }, 'POST').then(() => {
                return true
            })
        },
        toOrderDetail() {
            this.paying = false;
            setTimeout(() => {
                uni.redirectTo({
                    url: '/order/detail/index?id=' + this.id,
                });
            }, 1000);
        },
        onRead(val) {
            this.read = val;
            this.showReadPopup = false;
        },
        tiktokCreateOrder(skuList, totalAmount, callbackData) {
            tt.createOrder({
                skuList: skuList,
                payment: {
                    totalAmount: totalAmount, // 订单总价 必填
                },
                callbackData: callbackData, // 透传数据，开发者自定义字段 非必传
                success: res => {
                    if (res.orderId) {
                        this.order.tiktoksop_order_id = res.orderId;
                        this.handlerPaySuccess();
                    } else {
                        this.paying = false;
                    }
                },
                fail: res => {
                    if (res.errLogId) {
                        uni.showToast({ title: res.errMsg, icon: 'none' })
                        this.paying = false;
                        return;
                    }
                    if (res.orderId) {
                        this.order.tiktoksop_order_id = res.orderId;
                    }
                    this.handlerPayFail();
                },
            });
        },
        continueToPay(outOrderNo) {
            tt.continueToPay({
                outOrderNo: outOrderNo,
                success: res => {
                    if (res.orderId) {
                        this.order.tiktoksop_order_id = res.orderId;
                        this.handlerPaySuccess();
                    }
                },
                fail: res => {
                    if (res.errLogId) {
                        uni.showToast({ title: res.errMsg, icon: 'none' })
                        this.paying = false;
                        return;
                    }
                    this.handlerPayFail();
                },
            });
        },
    }
};
</script>

<style scoped>
.last-mb-0:last-child {
    margin-bottom: 0px !important;
}</style>