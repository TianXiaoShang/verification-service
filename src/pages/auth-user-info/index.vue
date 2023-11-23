<template>
    <div class="page-box relative">
        <!-- <loading /> -->
        <div class="w-full relative">
            <div class="image-filter translate-y-25vw transform scale-130 flex flex-col justify-center items-center">
                <image class="w-full" src="@/static/common/nav-tickets-sel.png"></image>
                <!-- 比下面的字大一些 -->
                <div class="text-48px text-gray-111 font-extrabold mt-60px">预约小工具</div>
            </div>
            <div
                class="w-full absolute left-1/2 top-18vh transform -translate-x-1/2 flex flex-col justify-center items-center">
                <image class="w-120px h-120px" src="@/static/common/nav-tickets-sel.png"></image>
                <div class="text-28px text-gray-111 font-extrabold mt-20px">预约小工具</div>
            </div>
        </div>
        <div class="fixed bottom-10vh w-full flex flex-col items-center justify-center">
            <div class="flex w-8/10 flex-col items-center justify-center mb-36px">
                <!-- 授权手机号 -->
                <div style="box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.05);"
                    class="w-full h-50px bg-white rounded py-10px px-15px box-border mt-10px flex items-center">
                    <div class="text-gray-666 text-14px mr-10px">手机</div>
                    <div class="flex-1 relative h-full flex items-center">
                        <div class="w-full h-23px text-14px flex items-center"
                            :class="{ 'text-black': user.phone, 'text-gray-999': !user.phone }">
                            {{ user.phone || '授权手机号' }}
                        </div>
                        <my-phone-button v-model="user.phone"></my-phone-button>
                    </div>
                </div>

                <!-- 头像昵称 -->
                <!-- 有头像则说明授权过，名称可能为默认昵称 -->
                <div style="box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.05);" @click="getUserProfile"
                    class="w-full h-50px bg-white rounded py-10px px-15px box-border mt-10px flex items-center">
                    <div class="text-gray-666 text-14px mr-10px">头像</div>
                    <div class="flex-1 relative text-0px h-full flex items-center">
                        <image v-if="user.avatarUrl" class="w-35px h-35px rounded-full overflow-hidden"
                            :src="user.avatarUrl"></image>
                        <span v-else class="text-14px text-gray-999">点击授权头像昵称</span>
                    </div>
                </div>
                <div style="box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.05);" @click="getUserProfile"
                    class="w-full h-50px bg-white rounded py-10px px-15px box-border mt-10px flex items-center">
                    <div class="text-gray-666 text-14px mr-10px">昵称</div>
                    <div class="flex-1 relative h-full flex items-center">
                        <div class="w-full h-23px text-14px flex items-center"
                            :class="{ 'text-black': user.name, 'text-gray-999': !user.name }">
                            {{ user.name || '点击授权头像昵称' }}
                        </div>
                    </div>
                </div>

            </div>
            <div class="flex w-full flex-col items-center justify-center">
                <div class="w-3/5">
                    <u-button shape="circle" :disabled="(!loginStatus || disabled)" class='w-full' @click="onSubmit"
                        color="#FF545C" type="primary" text="完成授权"></u-button>
                </div>
            </div>
            <div class="flex mt-25px justify-center items-center text-14 text-gray-333">
                <image v-if="read" @click="onRead(false)" src="@/static/common/agree-sel@2x.png" class="w-15px h-15px">
                </image>
                <div v-if="!read" @click="showPopup = true"
                    class="box-border rounded-full w-15px h-15px border border-solid border-red">
                </div>
                <span class="ml-4px">我已阅读并同意<span class="text-blue" @click="showPopup = true">《服务条款》</span></span>
            </div>
        </div>

        <!-- 服务条款 -->
        <u-popup :show="showPopup" :round="20" @close="showPopup = false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 
                                                                                border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 服务条款 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showPopup = false"></u-icon>
                    </span>
                </div>
                <scroll-view scroll-y="true" class="text-gray-666 max-h-50vh px-15px box-border mt-15px">
                    <u-parse v-if="login_explain" :lazyLoad="true" :selectable="true" :scrollTable="true"
                        :content="login_explain"></u-parse>
                    <span v-else>内容为空</span>
                </scroll-view>
                <div class="py-10px">
                    <u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '200px' }"
                        color="linear-gradient(180deg, #FF545C 0%, #FF545C 100%);" text="确定"
                        @click.native.stop="onRead(true)">
                    </u-button>
                </div>
            </div>
        </u-popup>
    </div>
</template>

<script>
import { updateUserInfo, getBaseUrl } from '@/util/base';
import { parseRichText } from '@/util';
import MyPhoneButton from '@/components/my-phone-button/index.vue';

export default {
    components: { MyPhoneButton },
    data() {
        return {
            read: false,
            showPopup: false,
            user: {
                avatarUrl: '',
                name: '',
                phone: '',
            },
            disabled: false,
            login_explain: '',
            loginCode: '',
        }
    },
    onLoad() {
        this.waitLogin().then(() => {
            // this.waitInitConfig().then(() => {
            //     this.updateSettingInit();
            //     this.login_explain = this.setting.login_explain ? parseRichText(this.setting.login_explain) : '';
            //     this.user.avatarUrl = this.userInfo.avatar;
            //     this.user.name = this.userInfo.nickname;
            //     this.user.phone = this.userInfo.mobile;
            // })
        })
    },
    methods: {
        getUserProfile() {
            tt.getUserProfile({
                success: (res) => {
                    this.user.name = res.userInfo.nickName;
                    this.user.avatarUrl = res.userInfo.avatarUrl;
                    uni.showToast({
                        title: "授权成功",
                        icon: 'none'
                    })
                    console.log(`tt-getUserProfile 调用成功 ${res.userInfo}`, res.userInfo);
                },
                fail: (res) => {
                    uni.showToast({
                        title: "授权失败",
                        icon: 'none'
                    })
                    console.log(`tt-getUserProfile 调用失败`, res);
                },
            })
        },
        onRead(val) {
            this.showPopup = false;
            this.read = val;
        },
        onSubmit() {
            if (this.read) {
                if (!this.user.name) {
                    uni.showToast({
                        title: "请授权头像昵称",
                        icon: 'none'
                    })
                    return;
                };
                this.user.name = this.user.name.trim();
                if (!this.user.phone) {
                    uni.showToast({
                        title: '请授权手机号',
                        icon: 'none'
                    })
                    return;
                };
                this.disabled = true;
                updateUserInfo({ ...this.userInfo, avatarUrl: this.user.avatarUrl, nickName: this.user.name, mobile: this.user.phone }).then(() => {
                    uni.showToast({
                        title: "授权成功",
                        icon: "none",
                    });
                    getCurrentPages().length ? this.back(800) : this.goHome(800);
                }, () => {
                    this.disabled = false;
                })
            } else {
                uni.showToast({
                    title: "请先阅读并同意《服务条款》",
                    icon: 'none'
                })
                this.showPopup = true;
            }
        },
    }
};
</script>

<style lang="scss" scoped>
.image-filter {
    /* 关键模糊属性  */
    filter: blur(20px);
}
</style>
