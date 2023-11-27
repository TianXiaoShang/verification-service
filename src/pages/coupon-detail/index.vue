<template>
	<div class="page-box bg-gray-bg p-20px pt-0 box-border">
		<loading />
		<div>
			{{ options }}
		</div>
		<!-- 空状态 -->
		<div class="mt-20px text-12px text-gray-666 flex justify-center">
			你的票夹空空哒
		</div>
	</div>
</template>

<script>
import store from "@/store";
export default {
	data() {
		return {
			options: ''
		}
	},
	methods: {
	},
	onLoad: function (options) {
		console.log(options, 'optionsoptions')
		this.options = JSON.stringify(options);
	},
};
</script>
