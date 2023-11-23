
<script>
import { login } from '@/util/base';

export default {
	data() {
		return {
			isLaunching: false,
		}
	},
	onLaunch: function (options) {
		console.log('App Launch', options);
		// 获取绑定上级id；
		this.isLaunching = true;
		login().then(() => {
			this.isLaunching = false;
		})
	},
	onShow: function (options) {
		console.log('App Show', options, this.isLaunching)
		
	},
	onHide: function () {
		console.log('App Hide')
	},
}
</script>

<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import "uview-ui/index.scss";

body {
	font-size: 16px;
}
</style>
