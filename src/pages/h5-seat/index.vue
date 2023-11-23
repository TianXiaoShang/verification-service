<template>
    <div class="page-box bg-white box-border" v-if="webViewUrl">
        <web-view :src="webViewUrl"></web-view>
    </div>
    <!-- <div class="page-box bg-white box-border" v-if="webViewUrl">
        <web-view src="https://www.baidu.com"></web-view>
    </div> -->
</template>

<script>
import { getToken } from "@/util";
import { getBaseUrl } from "@/util/base";
import store from "@/store";

export default {
    data() {
        return {
            path: '/addons/webseat/#/center',   // h5访问路径
            webViewUrl: '',   // h5访问全路径

            id: '',
            is_tiktoksop: '',
            currentPartId: '',

            domain: '',
            h5ReqBasePath: '',
            baseHttpUrl: '',

            isLoad: false,
            goods_id: '',
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
        // 确保已经登录完成
        this.waitLogin().then(() => {
            // 获取基础参数
            this.goods_id = options.goods_id;
            this.id = options.id || '';
            this.is_tiktoksop = options.is_tiktoksop || '';
            this.currentPartId = options.activePartId || '';
            if (!this.id) {
                this.myMessage('id未找到，请返回重试')
                return;
            }

            // 通过getBaseUrl拿到当前请求路径url。
            const baseUrl = getBaseUrl();   // 如： https://6test.djlnet.com.cn/app/theater_new_api.php?i=1&cinemaid=4&r=  || https://movie.djlcom.net/app/theater_new_api.php?i=1&cinemaid=4&r=

            // 取出域名和h5请求所需要的基础路径
            const paths = baseUrl.split('/');
            this.domain = paths.slice(0, 3).join('/');   // 域名  https://6test.djlnet.com.cn
            this.h5ReqBasePath = paths.splice(3, paths.length - 1).join('/');   // 比如:  /app/theater_new_api.php?i=1&cinemaid=4&r=
            this.request('seat.webseat').then((res) => {
                // 最终的基础路径
                this.baseHttpUrl = `${this.domain}/addons/${res.name}/#/center`;
                // 开始生成url
                this.getWebViewFullUrl();
                this.isLoad = true;
            });
            // setTimeout(()=>{
            //     // 最终的基础路径
            //     this.baseHttpUrl = `${this.domain}/addons/test-yundun/#/center`;
            //     // 开始生成url
            //     this.getWebViewFullUrl();
            //     this.isLoad = true;
            // }, 500)
        })
    },
    methods: {
        getWebViewFullUrl() {
            this.webViewUrl = '';
            // 加上携带参数
            const query = `?token=${encodeURIComponent(getToken())}&openid=${this.userInfo.openid}&env=${this.isWx ? 'wx' : 'tiktok'}&id=${this.id}&is_tiktoksop=${this.is_tiktoksop}&currentPartId=${this.currentPartId}&needAuth=${!this.getCurAuth()}&domain=${encodeURIComponent(this.domain)}&basePath=${encodeURIComponent('/' + this.h5ReqBasePath)}&needVerify=${this.cinema.is_captcha == '1' ? 'true' : 'false'}&part_discount_mode=${this.setting.part_discount_mode}&goods_id=${this.goods_id}&partner_id=${store.state.sales_partner_id}`;
            setTimeout(() => {
                // 打开webview
                this.webViewUrl = this.baseHttpUrl + query;
                console.log(this.webViewUrl, '------------------------baseUrl------------------------');
            }, 100)
        }
    }
};
</script>