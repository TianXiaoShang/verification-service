<template>
	<div class="page-box bg-gray-bg py-20px">
		<loading />
		<scroll-view :style="{ height: 'calc(100vh - 40px)' }" class="px-10px w-full box-border" scroll-y="true"
			@scrolltolower="searchScrollLower">
			<div v-for="(item, index) in dataList" :key="index" class="mb-10px">
				<!-- <div>
					<img :src="item.logo" alt="">
				</div>
				<div>
					<div>{{ item.title }}</div>
					<div>{{ item.title }}</div>
				</div> -->
				<film-item :detail="item" :cinema_id="cinema_id" :coupon_id="coupon_id" :order_id="order_id"></film-item>
			</div>
		</scroll-view>
		<!-- 空状态 -->
		<div v-if="!dataList.length" class="mt-20px text-12px text-gray-666 flex justify-center">
			空空哒
		</div>
	</div>
</template>

<script>
import FilmItem from './film-item.vue'

export default {
	components: { FilmItem },
	data() {
		return {
			cinema_id: '',
			coupon_id: '',
			order_id: '',
			dataList: []
		}
	},
	onLoad: function (options) {
		this.cinema_id = options.cinema_id;
		this.coupon_id = options.coupon_id;
		this.order_id = options.order_id;
		this.waitLogin().then(() => {
			this.request('film.index', { cinema_id: this.cinema_id, coupon_id: this.coupon_id }, 'POST').then(res => {
				this.dataList = res.list || [];
			}, (err) => {
				uni.showModal({
					title: "提示",
					content: err.message || '未找到订单',
					showCancel: false,
					success: () => {
						this.goHome();
					},
				});
			});
		});
	},
	methods: {
	},
};
</script>
