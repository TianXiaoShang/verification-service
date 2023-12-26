<template>
	<scroll-view class="w-100vw box-border overflow-x-hidden" scroll-y="true" @scroll="onHandleScrollChange($event, 40)"
		:style="{ height: '100vh' }">
		<view class="page-box bg-gray-bg box-border">
			<loading />
			<!-- 自定义导航 -->
			<nav-bar :title="showNavTitle ? '首页' : ''" :backgroundColor="'transparent'"></nav-bar>
			<!-- 背景 -->
			<div class="fixed h-100vh overflow-hidden left-0 top-0 w-100vw">
				<image src="@/static/self/colorbg@2x.png" mode="widthFix" class="w-full" />
			</div>

			<!-- 内容区域 -->
			<div class="relative z-99 pb-20px">
				<!-- 基本资料 -->
				<div class="flex justify-between items-center px-20px w-100vw box-border pt-40px pb-30px">
					<div class="flex items-center" style="width: calc(100% - 62px)">
						<!-- 头像 -->
						<div @click="toPath('/pages/auth-user-info/index')"
							class="relative rounded-full border-solid w-full shadow-lg border-2 border-white box-border overflow-hidden w-60px h-60px">
							<image :src="(userInfo.avatar || DEFAULT_AVATAR)" class="w-full h-full" />
						</div>
						<!-- 昵称 -->
						<div class="ml-10px" style="width: calc(100% - 60px - 10px)">
							<div @click="toPath('/pages/auth-user-info/index')"
								class="truncate text-333 font-semibold text-20">
								{{ userInfo.nickname || '点击登录' }}</div>
							<!-- 手机号 -->
							<div class="text-gray-666 text-12 mt-5px">
								<span class="relative" @click="toPath('/pages/auth-user-info/index')">
									{{ userInfo.mobile || '点击授权手机号' }}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="bg-gray-bg content-box px-20px pt-20px">
					<!-- 我的工具 -->
					<div class="mb-20px px-0 py-14px pb-22px rounded-8px bg-white box-border mb-14px">
						<div class="text-16px pl-18px text-[#3D3D3D] font-semibold mb-18px">我的工具</div>
						<u-scroll-list class="scroll-list is-scroll" :indicator="false">
							<div class="flex justify-around items-center" :style="{ width: `calc(100vh - 40px - 36px)` }">
								<div class="scroll-list-item-plus flex flex-col justify-center items-center"
									@click="switchToPath('/pages/ticket/index')">
									<image mode="aspectFit" src="@/static/self/mine-tickets.png"
										class="w-12vw h-12vw rounded-full" />
									<span class="mt-5px text-12 text-gray-333">我的票夹</span>
								</div>
								<div class="scroll-list-item-plus flex flex-col justify-center items-center"
									@click="toPath('/order/list/index')">
									<image mode="aspectFit" src="@/static/self/guanyanren.png"
										class="w-12vw h-12vw rounded-full" />
									<span class="mt-5px text-12 text-gray-333">我的订单</span>
								</div>
							</div>
						</u-scroll-list>
					</div>

					<!-- 功能卡片 -->
					<!-- <div class="bar-wrap">
						<div @click="toPath('/order/address/list')"
							class="h-56px mt-10px px-20px box-border py-18px flex items-center justify-between bg-white rounded">
							<div class="flex items-center">
								<image mode="aspectFit" src="@/static/self/dizhiguanli.png" class="w-16px h-16px" />
								<span class="ml-10px text-gray-333 text-14px">地址管理</span>
							</div>
							<u-icon name="arrow-right" class="ml-4px" size="16px" color="#999"></u-icon>
						</div>
						<div @click="toPath('/order/idcard/list')"
							class="h-56px mt-10px px-20px box-border py-18px flex items-center justify-between bg-white rounded">
							<div class="flex items-center">
								<image mode="aspectFit" src="@/static/self/guanyanren.png" class="w-16px h-16px" />
								<span class="ml-10px text-gray-333 text-14px">观演人管理</span>
							</div>
							<u-icon name="arrow-right" class="ml-4px" size="16px" color="#999"></u-icon>
						</div>
					</div> -->
				</div>
				<div class="pt-15px pb-10px text-center text-gray-999 text-12px">大激梨提供技术支持
				</div>
				<div class="pb-10px text-center text-gray-999 text-12px" @click="onSendCall()">联系客服技术支持
				</div>
			</div>
		</view>
	</scroll-view>
</template>

<script>
import NavBar from '@/components/nav-bar';
import store from "@/store";
import { sendCall } from '@/util';

export default {
	data() {
		return {
			member: {},
			card: {},
			global: {},
			neerTicket: {},
			partner: null,
			loginFlag: false,
			agentUrl: '',
			showLive: false,
			is_agent: 0,
			agent_status: 0,
		}
	},
	components: { NavBar },
	onShow() {
		store.commit("SET_CAN_FETCH_TICKET", true);
	},
	onLoad(options) {
		console.log(options, 'options');
		// // 确保已经登录完成，再去检查是否有授权
		this.waitLogin().then(() => {
			console.log(this.userInfo, '----');
		})
	},
	methods: {
		onSendCall() {
			sendCall('15096350911');
		}
	}
};
</script>

<style lang="scss" scoped>
.page-box::v-deep .u-scroll-list {
	padding-bottom: 0 !important;
}

.scroll-list-item {
	width: calc((100vw - 40px) / 4);
}

.scroll-list-item-plus {
	width: calc((100vw - 40px - 36px) / 3);
}

.card {
	background: linear-gradient(166deg, #3D3669 0%, #1B2E57 100%);
}
</style>
