<template>
	<div class="page-box bg-white box-border">
		<loading />
		<!-- 背景图 -->
		<div class="relative" :style="{
			paddingTop: mixinStatusBarHeight + mixNavBarHeight + 'px',
			backgroundImage: `url(${filmData.logo})`,
			backgroundSize: 'cover',
			backgroundPosition: 'top center',
			marginTop: isWx ? (0 - mixinStatusBarHeight - mixNavBarHeight + 'px') : 0,
			backgroundColor: '#fff',
		}">
			<!-- 阴影 + title -->
			<div class="w-full box-border px-20px pb-40px pt-10px"
				:style="{ background: 'linear-gradient(360deg, #000000 15%, rgba(0,0,0,0) 100%)' }">
				<div class="text-white text-18px font-semibold">{{ filmData.title || '-' }}</div>
			</div>
			<!-- 圆角 -->
			<div class="bg-white absolute left-0 -bottom-2px w-full overflow-hidden rounded-t-24px h-26px"></div>
		</div>
		<!-- 骨架图 -->
		<div v-if="!isLoad" class="px-20px">
			<u-skeleton :loading="true" :animate="true" :title="true" :titleWidth="'80%'" :titleHeight="20"
				:rows="3"></u-skeleton>
			<div class="h-25px w-full"></div>
			<u-skeleton :loading="true" :animate="true" :title="true" :titleWidth="'80%'" :titleHeight="20"
				:rows="3"></u-skeleton>
			<div class="h-25px w-full"></div>
			<u-skeleton :loading="true" :animate="true" :title="true" :titleWidth="'80%'" :titleHeight="20"
				:rows="3"></u-skeleton>
		</div>
		<!-- 内容区域 -->
		<template v-else>
			<template v-if='((dateList && dateList.length) || (sessionList && sessionList.length))'>
				<!-- 选票信息 -->
				<div class="bg-white overflow-hidden px-20px pt-10px box-border w-full pb-130px">
					<!-- 日期 -->
					<div class="text-12px mb-12px">
						<span class="text-gray-333 font-semibold">日期</span>
						<span class="ml-5px text-gray-999">场次时间均为演出当地时间</span>
					</div>
					<scroll-view scroll-x="true" :scroll-with-animation="true" :scroll-left="scrollLeft"
						class="mb-20px text-gray-999 w-full box-border whitespace-nowrap">
						<div v-for="(item, index) in dateList" :key="index" @click="choiseDate(item)"
							:class="{ active: curDate.title === item.title, 'mr-10px': index !== dateList.length - 1 }"
							style="background-color: #F8F8F8; border-color: #ddd"
							class="w-105px mb-10px h-45px rounded-5px border border-solid bg-bg inline-flex flex-col items-center justify-center">
							<span class="text-10px text-999">{{ item.week }}</span>
							<span class="text-14px text-999 mt-3px">{{ item.title_y }}</span>
						</div>
					</scroll-view>
					<!-- 场次 -->
					<template v-if="sessionList && sessionList.length">
						<div class="text-12px mb-12px">
							<span class="text-gray-333 font-semibold">场次</span>
						</div>
						<div class="mb-20px text-gray-999">
							<div v-for="(item, index) in sessionList" :key="index">
								<div @click="choiseSession(item)" :class="{
									active: curSession.id === item.id,
									'mr-10px': index !== sessionList.length - 1,
									disabled: !curSessionResidue,
								}" style="background-color: #F8F8F8; border-color: #ddd"
									:style="{ 'padding-right': !curSessionResidue ? '33px' : '20px' }"
									class="mb-10px pl-20px h-40px rounded-5px relative overflow-hidden border border-solid bg-bg inline-flex items-center">
									<span class="text-14px text-999">
										{{ item.date_title }}
									</span>
									<div v-if='!curSessionResidue'
										class="absolute right-0 flex items-center top-0 text-white text-10px w-32px rounded-bl-5px h-18px justify-center bg-gray-444">
										售罄
									</div>
								</div>
							</div>
						</div>
					</template>
					<template v-if="partList && partList.length">
						<!-- 票档 -->
						<div class="text-12px mb-12px flex justify-between">
							<span class="text-gray-333 font-semibold">票档</span>
						</div>
						<div class="mb-20px text-gray-999 flex flex-wrap">
							<div v-for="(item, index) in partList" :key="index" @click="choisePart(item)" :class="{
								active: curPart.part_id === item.part_id,
								'mr-10px': index !== partList.length - 1,
								'pr-20px': item.residue,
								'pr-38px': !item.residue,
								disabled: !item.residue
							}" :style="{ 'background': '#f8f8f8', 'border-color': '#ddd' }"
								class="mb-10px pl-20px h-40px flex rounded-5px overflow-hidden border border-solid bg-bg inline-flex  items-center relative">
								<!-- 名称 -->
								<div class="">
									<div class="flex items-center justify-start">
										<span class="text-14px text-999">{{ item.name }}</span>
									</div>
								</div>
								<!-- 标签 -->
								<div v-if='!item.residue'
									class="absolute right-0 flex items-center top-0 text-white text-10px w-32px rounded-bl-5px h-18px justify-center bg-gray-444">
									售罄
								</div>
							</div>
						</div>
					</template>
					<div class="tips text-14px text-gray-999 mt-20px flex items-start" v-if="curPart && curPart.tip">
						<u-icon name="bell" size="14px" color="#999"></u-icon>
						<span class="ml-5px leading-5 -mt-3px">{{ curPart.tip }}</span>
					</div>
				</div>
			</template>
			<!-- 无数据 -->
			<u-empty v-else mode="data" text="暂无场次安排" icon="http://cdn.uviewui.com/uview/empty/data.png">
			</u-empty>
		</template>

		<!-- 底部数量选择，按钮， 不选座模式 -->
		<div class="fixed bottom-0 h-130px left-0 w-full box-border bg-white"
			style="box-shadow: 0px -2px 6px 0px rgba(51,51,51,0.05);">
			<div class="flex px-20px justify-between items-center h-60px" v-if="is_timing != 1">
				<div class="text-12px">
					<span class="text-gray-333">数量</span>
					<span class="text-gray-999 ml-4px">
						{{ ' (余票:' + ((curPart.residue || curPart.residue === 0) ?
							curPart.residue :
							(curSessionResidue || curSessionResidue === 0) ? curSessionResidue
								: '-') + ')' }}
					</span>
				</div>
				<div style="background: #F4F4F4;" class="h-32px rounded-16px px-3px flex items-center">
					<div class="text-333 font-semibold text-14px mx-12px">{{ seatNum }}张</div>
				</div>
			</div>
			<div v-else
				class="h-60px flex justify-center items-center w-full box-border bg-white text-16px text-red font-semibold"
				style="background-image: linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%); border-radius: 15px 15px 0 0;">
				{{ moment(sell_timing * 1000).format('MM月DD日 HH:mm:ss') }}开抢
			</div>
			<div
				class="h-60px px-20px border-t border-b-0 pb-9px border-l-0 border-r-0 border-gray-100 border-solid justify-between flex items-center">
				<div class="flex">
					<div class="text-gray-666 text-12 flex items-center ml-5px">
						<span>
							{{ curDate.title ? curDate.title + ' |' : '' }}
							{{
								curSession.id ? moment(Number(curSession.entrance_time) * 1000).format('HH:mm') :
								'未选择场次'
							}}
							{{ curPart.name ? ' | ' + curPart.name : '' }}
							{{ ' | 余票:' + ((curPart.residue || curPart.residue === 0) ?
								curPart.residue :
								(curSessionResidue || curSessionResidue === 0) ? curSessionResidue
									: '-') }}
						</span>
					</div>
				</div>
				<u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '140px', margin: 0 }"
					color="#FF545C" :text="getBtnStatusText()" @click="toSelectFilm(true)">
				</u-button>
			</div>
		</div>
	</div>
</template>

<script>
import NavBar from '@/components/nav-bar';
export default {
	data() {
		return {
			disabledBtn: false,
			filmData: {},
			isLoad: false,
			orderData: {},
			curDate: {},
			curSession: {},
			curPart: {},
			dateList: [],
			sessionList: [],
			seatNum: 0,
			partList: [],
			is_timing: 0,
			sell_timing: 0,
			scrollLeft: 0, // 控制日期行的滚动距离
			curSessionResidue: 1,  // 默认一张余票
			order_id: '',
			is_selection: null,
		}
	},
	components: { NavBar },
	onLoad(options) {
		console.log(options, 'optionsoptions---options');
		// options = { account_id: '7287482799568652299', order_id: '1019404595856667295' };
		if (!options.order_id) {
			uni.showModal({
              title: "提示",
              content: '未找到订单',
              showCancel: false,
              success: () => {
                this.goHome();
              },
            });
			return;
		}
		this.order_id = options.order_id;
		this.waitLogin().then(() => {
			this.request('certificate.index', { order_id: options.order_id, account_id: options.account_id, _showErrorToast: false }, 'POST').then(res => {
				this.orderData = res;
				this.seatNum = res.quantity;
				this.request('row.index', { cinema_id: res.cinema_id, film_id: res.film_id }).then(res => {
					// 影片标题等信息
					this.filmData = res.film;
					this.dateList = res.rows && Object.keys(res.rows).length ? Object.keys(res.rows).map(key => {
						return {
							...res.rows[key],
							title_y: key
						}
					}) : [];
					this.dateList = this.dateList.filter(el => el.row && el.row.length);
					this.curDate = this.dateList[0];
					this.isLoad = true;
				})
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
	watch: {
		curDate: {
			handler() {
				if (!this.curDate || !this.curDate.title) {
					return;
				};
				this.sessionList = this.dateList.find(el => el.title === this.curDate.title).row || [];
				this.curSession = this.sessionList[0] ? this.sessionList[0] : {};
				this.partList = [];
				this.curPart = {};
			},
			deep: true,
		},
		curSession: {
			handler() {
				if (!this.curSession.id) {
					return;
				}
				this.partList = [];
				this.curPart = {};
				// 根据场次获取分区数据
				this.request("partition.index", { cinema_id: this.orderData.cinema_id, film_id: this.orderData.film_id, row_id: this.curSession.id, part_id: this.orderData.part_id }, 'GET').then(res => {
					// 场次余票
					this.curSessionResidue = res.row.residue;
					this.is_timing = res.row.is_timing;
					this.sell_timing = res.row.sell_timing;
					this.is_selection = res.row.is_selection;
					// 票档
					this.partList = res.partition || [];
					const curIndex = this.partList.findIndex(el => el.residue);
					this.curPart = this.partList[curIndex || 0] || {};
					console.log('curPart', this.curPart)
				});
			},
			deep: true
		},
	},
	methods: {
		getBtnStatusText() {
			if (!this.curSession.id) {
				return '请选择场次';
			}
			if (this.is_timing == 1) {
				return '即将开抢'
			}
			return (this.curSession.sell == 1 ? (this.curSession.seat_random == 1 || this.is_selection == 1 ? '去下单' : '去选座') : '未开抢')
		},
		toSelectFilm() {
			if (!this.isLoad || this.disabledBtn) {
				return;
			}
			if (!this.curDate.title) {
				this.myMessage('请选择日期');
				return;
			}
			if (!this.curSession.id) {
				this.myMessage('请选择场次');
				return;
			}
			if (this.curSession.sell != 1) {
				this.myMessage('未开抢');
				return;
			}
			// 没有curPart的情况下，再检查是否场次没余票
			if ((this.curPart.part_id && !this.curPart.residue) || !this.curSessionResidue) {
				this.myMessage('暂无余票');
				return;
			}
			this.disabledBtn = true;
			if (this.curSession.seat_random == 0 && this.is_selection == 0) {
				this.toPath(`/pages/h5-seat/index?order_id=${this.order_id}=&cinema_id=${this.orderData.cinema_id}&film_id=${this.orderData.film_id}&curDate=${this.curDate.title_y}&row_id=${this.curSession.id}&part_id=${this.curPart.part_id}&seatNum=${this.seatNum}`);
				this.disabledBtn = false;
			} else {
				this.createOrder();
			}
		},
		createOrder() {
			this.request("create.other" + '&cinema_id=' + this.orderData.cinema_id, {
				tiktok_order_id: this.order_id,
				row_id: this.curSession.id,
				part_id: Number(this.curPart.part_id),
				number: this.seatNum,
			}, 'POST').then(res => {
				this.disabledBtn = false;
				if (res.order_id) {
					uni.redirectTo({
						url: '/order/pay/index?order_id=' + res.order_id + '&cinema_id=' + this.orderData.cinema_id,
					})
				} else {
					uni.showToast({
						title: '下单发生错误',
						icon: 'none'
					})
					this.disabledBtn = false;
				}
			}, () => {
				this.disabledBtn = false;
			})
		},
		choiseDate(item) {
			this.curDate = item;
			if (this.curDate.row && this.curDate.row.length) {
				this.curSession = this.curDate.row[0];
			}
		},
		choiseSession(item) {
			this.curSession = item;
		},
		choisePart(item) {
			if (!item.residue) {
				return;
			}
			this.curPart = item;
		},
	}
};
</script>


<style lang="scss" scoped>
.active {
	background-color: rgb(251, 234, 236) !important;
	border-color: #FF545C !important;
	color: #FF545C !important;
}

.disabled {
	color: #aaa !important;
	border-color: #aaa !important;
	background-color: #fff !important;
}
</style>