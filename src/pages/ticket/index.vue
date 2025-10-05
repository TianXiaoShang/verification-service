<template>
	<div class="page-box bg-gray-bg p-20px pt-0 box-border">
		<loading />
		<scroll-view v-if="ticketList.length" :style="{ height: 'calc(100vh - 20px)' }" scroll-y="true"
			@scrolltolower="searchScrollLower">
			<!-- 票夹列表 -->
			<div @click="toSelect(item)" class="bg-white rounded box-border mt-20px p-20px relative overflow-hidden"
				v-for="(item, index) in ticketList" :key="index">
				<template v-if="item.id">
					<div class="text-14 font-semibold flex items-center">{{ item.ext.film_title }}</div>

					<div class="text-12px text-gray-999 my-10px font-normal flex justify-between items-center">
						<span>{{ item.ext.cinema_title }}</span>
						<span class="text-red text-14">{{
							moment(item.entrance_time *
								1000).format('YYYY-MM-DD HH:mm')
						}}</span>
					</div>

					<div class="text-14 font-normal flex justify-between items-center">
						<span class="text-gray-333">{{ item.ext.hall_title }}</span>
						<span class="text-12px text-blue">查看详情</span>
					</div>

					<!-- 状态 -->
					<div class="absolute right-0 top-0 text-12px px-8px py-5px"
						:style="{ 'border-radius': '0 10px 0 10px', background: statusBgColor[item.ticket_status], color: statusTextColor[item.ticket_status] }">
						{{ statusSign[item.ticket_status] }}
					</div>
				</template>
				<u-skeleton v-else rows="2" title :avatar="false" loading></u-skeleton>
			</div>
			<div v-if="pageFinish" class="py-15px text-center text-12px text-gray-999">没有更多啦~</div>
		</scroll-view>
		<!-- 空状态 -->
		<div v-if="!ticketList || !ticketList.length" class="mt-20px text-12px text-gray-666 flex justify-center">
			你的票夹空空哒
		</div>
	</div>
</template>

<script>
import store from "@/store";
export default {
	data() {
		return {
			ticketList: new Array(8).fill({}),
			statusSign: ['', '待观看', '已取票', '已结束', '已退款'],
			statusBgColor: ['', '#FF545C', '#EEEEEE', '#EEEEEE', '#EEEEEE'],
			statusTextColor: ['', '#fff', '#333', '#333', '#333'],
		}
	},
	methods: {
		toSelect(item) {
			this.toPath('/order/ticket/index?order_id=' + item.id + '&cinema_id=' + item.cinema_id)
		},
		getData() {
			this.request("ticket.index", {
				page: this.myCurrentPage,
			}).then(res => {
				const { total, data } = res;
				if (this.ticketList[0] && !this.ticketList[0].id) {
					this.ticketList = [];
				}
				this.ticketList = [...this.ticketList, ...(data || [])];
				this.myCurrentPage++;
				this.pageFinish = this.ticketList.length >= Number(total);
			}, () => {
				this.pageFinish = true;
				this.ticketList = [];
			})
		},
		searchScrollLower() {
			if (this.pageFinish) {
				return;
			}
			this.getData();
		},
	},
	onShow() {
			// 确保已经登录完成
			this.waitLogin().then(() => {
				this.myCurrentPage = 1;
				this.ticketList = new Array(8).fill({});
				this.getData();
			});
	},
	// onLoad: function () {
	// 	// 确保已经登录完成
	// 	this.waitLogin().then(() => {
	// 		this.myCurrentPage = 1;
	// 		this.ticketList = new Array(8).fill({});
	// 		this.getData();
	// 		setTimeout(() => {
	// 			this.loginFlag = true;
	// 		}, 800)
	// 	});
	// },
};
</script>
