<template>
	<div class="page-box bg-gray-bg py-20px">
		<loading />
		<scroll-view :style="{ height: 'calc(100vh - 40px)' }" class="px-10px w-full box-border" scroll-y="true" @scrolltolower="searchScrollLower">
			<div v-for="(item, index) in conpupList" :key="index" class="mb-10px">
				<coupon-item :conpupData="item" :order_id="order_id"></coupon-item>
			</div>
		</scroll-view>
		<!-- 空状态 -->
		<div v-if="!conpupList.length" class="mt-20px text-12px text-gray-666 flex justify-center">
			空空哒
		</div>
	</div>
</template>

<script>
// 买后约加价功能
import CouponItem from './coupon-item.vue'

export default {
	components: { CouponItem },
	data() {
		return {
			order_id: '',
			account_id: '',
			conpupList: []
		}
	},
	onLoad: function (options) {
		console.log(options, 'optionsoptions')
		// this.account_id = options.account_id || '7262974717651404835';
		// this.order_id = options.order_id || '1090255175285147295';

		this.account_id = options.account_id;
		this.order_id = options.order_id;
		if(!this.order_id || !this.account_id){
			uni.showModal({
              title: "提示",
              content: '未找到优惠券',
              showCancel: false,
              success: () => {
                this.goHome();
              },
            });
			return;
		}

		this.waitLogin().then(() => {
			this.request('coupon.index', { order_id: this.order_id, account_id: this.account_id, _showErrorToast: false }, 'POST').then(res => {
				this.conpupList = res.list || [];
				console.log(this.conpupList, 'conpupListconpup')
			}, (err) => {
				uni.showModal({
					title: "提示",
					content: err.message || '未找到优惠券',
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
