<template>
    <div class="page-box relative">
        <!-- <loading /> -->
        <div class="w-full relative">
            <div class="image-filter translate-y-25vw transform scale-130 flex flex-col justify-center items-center">
                <image class="w-full" src="@/static/common/nav-tickets-sel.png"></image>
                <!-- 比下面的字大一些 -->
                <div class="text-48px text-gray-111 font-extrabold mt-60px">核销小工具</div>
            </div>
            <div
                class="w-full absolute left-1/2 top-18vh transform -translate-x-1/2 flex flex-col justify-center items-center">
                <image class="w-120px h-120px" src="@/static/common/nav-tickets-sel.png"></image>
                <div class="text-28px text-gray-111 font-extrabold mt-20px">核销小工具</div>
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
                            :class="{ 'text-black': user.mobile, 'text-gray-999': !user.mobile }">
                            {{ user.mobile || '授权手机号' }}
                        </div>
                        <my-phone-button v-model="user.mobile"></my-phone-button>
                    </div>
                </div>

                <!-- 头像昵称 -->
                <!-- 有头像则说明授权过，名称可能为默认昵称 -->
                <div style="box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.05);" @click="getUserProfile"
                    class="w-full h-50px bg-white rounded py-10px px-15px box-border mt-10px flex items-center">
                    <div class="text-gray-666 text-14px mr-10px">头像</div>
                    <div class="flex-1 relative text-0px h-full flex items-center">
                        <image v-if="user.avatar" class="w-35px h-35px rounded-full overflow-hidden" :src="user.avatar">
                        </image>
                        <span v-else class="text-14px text-gray-999">点击授权头像昵称</span>
                    </div>
                </div>
                <div style="box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.05);" @click="getUserProfile"
                    class="w-full h-50px bg-white rounded py-10px px-15px box-border mt-10px flex items-center">
                    <div class="text-gray-666 text-14px mr-10px">昵称</div>
                    <div class="flex-1 relative h-full flex items-center">
                        <div class="w-full h-23px text-14px flex items-center"
                            :class="{ 'text-black': user.nickname, 'text-gray-999': !user.nickname }">
                            {{ user.nickname || '点击授权头像昵称' }}
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
                    <div>本指引是为处理你的个人信息而制定。</div>
                    <div>1.开发者处理的信息</div>
                    <div>根据法律规定，开发者仅处理实现本小程序功能所必要的信息。</div>
                    <div>*为了导航到活动地点，开发者将在获取你的明示同意后，收集你的位置信息。</div>
                    <div>*为了售后联系沟通，开发者将在获取你的明示同意后，收集你的手机号。</div>
                    <div>*为了售后上传凭证，开发者将在获取你的明示同意后，使用你的相册（仅写入）权限。</div>
                    <div>*开发者 收集你选中的文件，用于售后上传凭证。</div>
                    <div>*开发者 收集你的身份证号码，用于会员发放积分礼品。</div>
                    <div>2.你的权益</div>
                    <div>关于你的个人信息，你可以通过系统客服入口与开发者联系，行使查阅、复制、更正、删除等法定权利。</div>
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
import { updateUserInfo } from '@/util/base';
import MyPhoneButton from '@/components/my-phone-button/index.vue';

export default {
    components: { MyPhoneButton },
    data() {
        return {
            read: false,
            showPopup: false,
            user: {
                avatar: '',
                nickname: '',
                mobile: '',
            },
            disabled: false,
        }
    },
    onLoad() {
        this.waitLogin().then(() => {
            this.user.avatar = this.userInfo.avatar;
            this.user.nickname = this.userInfo.nickname;
            this.user.mobile = this.userInfo.mobile;
        })
    },
    methods: {
        getUserProfile() {
            tt.getUserProfile({
                success: (res) => {
                    this.user.nickname = res.userInfo.nickName;
                    this.user.avatar = res.userInfo.avatarUrl;
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
                if (!this.user.nickname) {
                    uni.showToast({
                        title: "请授权头像昵称",
                        icon: 'none'
                    })
                    return;
                };
                this.user.nickname = this.user.nickname.trim();
                if (!this.user.mobile) {
                    uni.showToast({
                        title: '请授权手机号',
                        icon: 'none'
                    })
                    return;
                };
                this.disabled = true;
                updateUserInfo({ ...this.userInfo, avatar: this.user.avatar, nickname: this.user.nickname, mobile: this.user.mobile }).then((res) => {
                    uni.showToast({
                        title: "授权成功",
                        icon: "none",
                    });
                    this.disabled = false;
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
