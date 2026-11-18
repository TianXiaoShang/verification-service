<template>
	<div class="page-box bg-[#F7F8FC] box-border">
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
			<div class="bg-[#F7F8FC] absolute left-0 -bottom-2px w-full overflow-hidden rounded-t-24px h-26px"></div>
		</div>
		<!-- 骨架图 -->
		<div v-if="!isLoad" class="px-16px">
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
				<div class="overflow-hidden px-16px pt-10px box-border w-full"
					:style="{ paddingBottom: `calc(${76 + (!cantBuy && !isSelectSeat ? 56 : 0) + (is_timing == 1 ? 60 : 0)}px + env(safe-area-inset-bottom))` }">
					<!-- 日期 -->
					<div class="text-12px leading-17px">
						<span class="text-gray-333">日期</span>
						<span class="ml-5px text-gray-999">场次时间均为演出当地时间</span>
					</div>
					<scroll-view scroll-x="true" :scroll-with-animation="true"
						class="mb-6px text-gray-333 w-full box-border whitespace-nowrap">
						<div v-for="(item, index) in dateList" :key="index" @click="choiseDate(item)"
							:class="{ active: curDate.title === item.title, 'mr-8px': index !== dateList.length - 1 }"
							style="background-color: #F7F8FC; border-color: #C8CAD5"
							class="w-80px my-10px h-40px rounded-8px border border-solid box-border inline-flex flex-col items-center justify-center">
							<span class="text-12px leading-17px">{{ item.week }}</span>
							<span class="text-12px leading-14px">{{ item.title_y }}</span>
						</div>
					</scroll-view>
					<!-- 场次 -->
					<template v-if="sessionList && sessionList.length">
						<div class="text-12px leading-17px mb-10px">
							<span class="text-gray-333">场次</span>
						</div>
						<div class="mb-8px text-gray-333 flex flex-wrap gap-x-8px">
							<div v-for="(item, index) in sessionList" :key="index" class="max-w-full">
								<div @click="choiseSession(item)" :class="{
									active: curSession.id === item.id,
								}" style="background-color: #F7F8FC; border-color: #C8CAD5"
									class="mb-8px px-8px min-h-40px max-w-full rounded-8px relative overflow-hidden border border-solid box-border inline-flex items-center">
									<span class="text-13px leading-18px min-w-0 break-words py-6px">
										{{ item.date_title }}
									</span>
								</div>
							</div>
						</div>
					</template>
					<template v-if="partList && partList.length">
						<!-- 票档 -->
						<div class="text-12px leading-17px mb-10px flex justify-between">
							<span class="text-gray-333">票档</span>
						</div>
						<div class="mb-8px text-gray-333 flex flex-wrap gap-x-8px">
							<div v-for="(item, index) in partList" :key="index" @click="choisePart(item)" :class="{
								active: curPart.part_id === item.part_id,
								disabled: !item.residue
							}" style="background-color: #F7F8FC; border-color: #C8CAD5;"
								class="mb-8px px-8px min-h-40px min-w-68px max-w-full box-border rounded-8px border border-solid inline-flex items-center relative">
								<!-- 名称 -->
								<div class="min-w-0">
									<div class="flex items-center justify-start flex-wrap py-6px">
										<span class="text-13px leading-18px min-w-0 break-words">{{ item.name }}</span>
										<span class="text-13px leading-18px text-red ml-3px whitespace-nowrap">¥{{ item.price }}</span>
									</div>
								</div>
								<!-- 标签 -->
								<div v-if='!item.residue'
									class="inline-flex flex-none items-center ml-4px my-2px px-3px h-16px rounded-4px text-10px leading-14px font-medium whitespace-nowrap text-gray-666 bg-[#e6e6e6]">
									售罄
								</div>
							</div>
						</div>
					</template>
					<div class="tips text-14px text-gray-999 mt-20px pb-20px flex items-start" v-if="curPart && curPart.tip">
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
		<div class="schedule-footer fixed bottom-0 left-0 z-10 w-full box-border bg-[#F7F8FC]">
			<div class="flex px-16px justify-between items-center h-56px" v-if="!cantBuy && !isSelectSeat">
				<div class="text-12px leading-17px min-w-0 flex-1">
					<span class="text-gray-333">数量</span>
					<span class="text-gray-999 ml-4px" v-if="setting.is_residue == '1'">
						{{ ` (余${curPart.type == 1 ? '量' : '票'}:` + ((curPart.residue || (curPart.residue === 0)) ?
							curPart.residue : '-') + ')' }}
					</span>
				</div>
				<div style="background: #F8F8F8;" class="h-40px min-w-110px box-border rounded-full px-9px ml-8px flex-none flex items-center justify-between">
					<image class="w-22px h-22px" :class="{ 'opacity-40': seatNum <= quantity }" src="@/static/detail/reduce.png" @click="reduce" />
					<div class="text-gray-333 font-medium text-14px mx-12px" v-if="curPart.type != 1">{{ seatNum }}张</div>
					<div class="text-gray-333 font-medium text-14px mx-12px" v-if="curPart.type == 1">{{ seatNum }}套 <span
							class="text-gray-999 ml-3px">/{{ curPart.people * seatNum }}张</span></div>
					<image class="w-22px h-22px" src="@/static/detail/add.png" @click="add" />
				</div>
			</div>
			<div v-if="is_timing == 1"
				class="h-60px flex justify-center items-center w-full box-border text-16px text-red font-semibold"
				style="background-image: linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%); border-radius: 15px 15px 0 0;">
				{{ moment(sell_timing * 1000).format('MM月DD日 HH:mm:ss') }}开抢
			</div>
			<div
				class="h-60px box-border px-16px border-t border-b-0 border-l-0 border-r-0 border-gray-100 border-solid justify-between flex items-center">
				<div class="flex min-w-0 flex-1 mr-8px">
					<div class="text-gray-666 text-12px min-w-0 flex items-center ml-5px">
						<span class="break-words leading-18px">
							{{ curDate.title ? curDate.title + ' |' : '' }}
							{{
								curSession.id ? moment(Number(curSession.entrance_time) * 1000).format('HH:mm') :
									'未选择场次'
							}}
							{{ curPart.name ? ' | ' + curPart.name : '' }}
							{{ setting.is_residue != '1' ? '' : (` | 余${curPart.type == 1 ? '量' : '票'}:` +
								((curPart.residue ||
									(curPart.residue === 0)) ?
									curPart.residue : '-')) }}
						</span>
					</div>
				</div>
				<u-button shape="circle" size="normal" :customStyle="{ height: '44px', width: '108px', maxWidth: '28vw', margin: 0, flexShrink: 0, fontSize: '15px', fontWeight: 500 }"
					:disabled="cantBuy" color="#FF214C" :text="getBtnStatusText" @click="toSelectFilm(true)">
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
			curDate: {},
			curSession: {},
			curPart: {},
			dateList: [],
			sessionList: [],
			seatNum: 1,
			quantity: 0,
			hasConfirmedExtra: false,
			confirmingExtra: false,
			partList: [],
			is_timing: 0,
			sell_timing: 0,
			order_id: '',
			is_selection: null,
			setting: {},

			cinema_id: '',
			film_id: '',
			coupon_id: '',
		}
	},
	components: { NavBar },
	onLoad(options) {
		console.log(options, 'optionsoptions---33333');
		// options = { account_id: '7672275903212161059', order_id: '1118193510321017295' }
		// 2+1
		// options = { account_id: '7672275903212161059', order_id: '1117604146467577295' }
		// 2+1（2次测试）
		// options = { account_id: '7672275903212161059', order_id: '1117604054815737295' }
		// options = { account_id: '7672275903212161059', order_id: '1117953335064057295' }
		// options = { account_id: '7672275903212161059', order_id: '1117370301943417295' }
		this.account_id = options.account_id;
		this.order_id = options.order_id;
		this.waitLogin().then(async () => {
			let couponRes = null;
			try {
				couponRes = await this.request('schedule.index', {
					order_id: this.order_id,
					account_id: this.account_id,
					redeem_all: 1,
					_showErrorToast: false
				}, 'POST');
			} catch (err) {
				console.log(err, 'errerrerr')
				if (err.code === 409) {
					uni.redirectTo({ url: `/pages/coupon-unavailable/index?cinema_id=${encodeURIComponent(err.message)}` });
					return;
				}
				uni.showToast({
					title: err && err.message ? err.message : '券详情获取失败',
					icon: 'none'
				});
				setTimeout(() => {
					this.goHome();
				}, 800);
				return;
			}
			const coupon = (couponRes.coupon_data || {});
			if (!coupon) {
				throw new Error('未找到可用抵扣券');
			}
			this.coupon_id = coupon.id;
			this.cinema_id = couponRes.cinema_id;
			this.film_id = couponRes.film_id;
			this.quantity = couponRes.quantity;
			this.seatNum = couponRes.quantity;
			
			this.request('film.detail', { cinema_id: this.cinema_id, film_id: this.film_id, coupon_id: this.coupon_id }).then(res => {
				// 影片标题等信息
				this.filmData = res.film;
			})
			this.request('row.index', { cinema_id: this.cinema_id, film_id: this.film_id, coupon_id: this.coupon_id }).then(res => {
				this.setting = res.setting;
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
				this.request("partition.index", { cinema_id: this.cinema_id, film_id: this.film_id, row_id: this.curSession.id, coupon_id: this.coupon_id }, 'GET').then(res => {
					// 场次余票
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
	computed: {
		cantBuy() {
			return this.curSession.sell != 1 || this.is_timing == 1 || !this.curSession.id;
		},
		getBtnStatusText(){
			if (!this.curSession.id) {
				return '请选择场次';
			}
			if (this.is_timing == 1) {
				return '即将开抢'
			}
			return this.curSession.sell == 1 ? !this.isSelectSeat ? '去下单' : '去选座' : '未开抢'
		},
		isSelectSeat(){
			return this.curSession.seat_random == 0 && this.is_selection == 0;
		}
	},
	methods: {
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
			if (!this.curPart || !this.curPart.part_id) {
				this.myMessage('请选择票档');
				return;
			}
			// 没有curPart的情况下，再检查是否场次没余票
			if (this.curPart.part_id && !this.curPart.residue) {
				this.myMessage('暂无余票');
				return;
			}
			if (this.seatNum > this.curPart.residue) {
				this.myMessage('余票不足');
				return;
			}
			this.disabledBtn = true;
			if (this.isSelectSeat) {
				const minSeats = this.curPart.type == 1 ? this.quantity * this.curPart.people : this.quantity;
				this.toPath(`/pages/h5-seat/index?order_id=${this.order_id}&coupon_id=${this.coupon_id}&cinema_id=${this.cinema_id}&film_id=${this.film_id}&curDate=${this.curDate.title_y}&row_id=${this.curSession.id}&part_id=${this.curPart.part_id}&redeem_all=1&minSeats=${minSeats}`);
				this.disabledBtn = false;
			} else {
				this.createOrder();
			}
		},
		createOrder() {
			this.request("create.other" + '&cinema_id=' + this.cinema_id, {
				tiktok_order_id: this.order_id,
				row_id: this.curSession.id,
				coupon_id: this.coupon_id,
				redeem_all: 1,
				part_id: Number(this.curPart.part_id),
				number: this.seatNum,
			}, 'POST').then(res => {
				this.disabledBtn = false;
				if (res.order_id) {
					uni.redirectTo({
						url: '/order/pay/index?order_id=' + res.order_id + '&cinema_id=' + this.cinema_id,
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
		reduce() {
			if (!this.confirmingExtra && this.seatNum > this.quantity) {
				this.seatNum--;
			}
		},
		add() {
			if (!this.isLoad || this.confirmingExtra) {
				return;
			}
			if (!this.hasConfirmedExtra && this.seatNum === this.quantity) {
				this.confirmingExtra = true;
				uni.showModal({
					title: '提示',
					content: '您选择的兑换数量超过了您的团购券，继续增加，需按原价购买，确认增加吗？',
					cancelText: '取消',
					confirmText: '确认',
					success: (res) => {
						if (res.confirm) {
							this.seatNum++;
							this.hasConfirmedExtra = true;
						}
					},
					complete: () => {
						this.confirmingExtra = false;
					}
				});
				return;
			}
			this.seatNum++;
		},
	}
};
</script>


<style lang="scss" scoped>
.active {
	background-color: #F7F8FC !important;
	border-color: #FF214C !important;
	color: #FF214C !important;
	font-weight: 500;
}

.disabled {
	color: #BFC0C7 !important;
	border-color: #E5E5EB !important;
	background-color: #F7F8FC !important;

	span {
		color: #BFC0C7 !important;
	}
}

.schedule-footer {
	padding-bottom: env(safe-area-inset-bottom);
}
</style>
