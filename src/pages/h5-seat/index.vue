<template>
    <div class="page-box bg-white box-border" v-if="webViewUrl">
        <web-view :src="webViewUrl"></web-view>
    </div>
</template>

<script>
import { getToken } from "@/util";
import { getBaseUrl } from "@/util/base";

export default {
    data() {
        return {
            webViewUrl: '',   // h5访问全路径

            id: '',
            currentPartId: '',

            domain: '',
            h5ReqBasePath: '',
            baseHttpUrl: '',

            isLoad: false,
            orderData: {},
        }
    },
    onShow() {
        // 授权回来要重新打开webview，同时更新了授权状态
        // 第一次肯定load先执行，因为是异步
        if (this.isLoad) {
            this.getWebViewFullUrl();
        }
    },
    onLoad(options) {
        console.log(options, 'ht-seat-options');
        this.orderData = options;
        // 确保已经登录完成
        this.waitLogin().then(() => {
            // 获取基础参数
            this.currentPartId = options.activePartId || '';
            // 通过getBaseUrl拿到当前请求路径url。
            const baseUrl = getBaseUrl();   // 如： https://6test.djlnet.com.cn/app/theater_new_api.php?i=1&cinemaid=4&r=  || https://movie.djlcom.net/app/theater_new_api.php?i=1&cinemaid=4&r=

            // 取出域名和h5请求所需要的基础路径
            const paths = baseUrl.split('/');
            this.domain = paths.slice(0, 3).join('/');   // 域名  https://6test.djlnet.com.cn
            this.h5ReqBasePath = paths.splice(3, paths.length - 1).join('/');   // 比如:  /app/theater_new_api.php?i=1&cinemaid=4&r=
            this.request('seat.version').then((res) => {
                // 最终的基础路径
                this.baseHttpUrl = `${this.domain}/addons/${res.version}/#/center`;
                // 开始生成url
                this.getWebViewFullUrl();
                this.isLoad = true;
            });
        })
    },
    methods: {
        getWebViewFullUrl() {
            this.webViewUrl = '';
            // 加上携带参数
            const query = `?token=${encodeURIComponent(getToken())}&order_id=${this.orderData.order_id}&cinema_id=${this.orderData.cinema_id}&film_id=${this.orderData.film_id}&curDate=${this.orderData.curDate}&row_id=${this.orderData.row_id}&part_id=${this.orderData.part_id}&seatNum=${this.orderData.seatNum}&needAuth=${false}&domain=${encodeURIComponent(this.domain)}&basePath=${encodeURIComponent('/' + this.h5ReqBasePath)}`;
            setTimeout(() => {
                // 打开webview
                this.webViewUrl = this.baseHttpUrl + query;
                console.log(this.webViewUrl, this.h5ReqBasePath, '------------------------baseUrl------------------------');
            }, 100)
        }
    }
};
</script>