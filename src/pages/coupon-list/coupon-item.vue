<template>
    <div class="bg-white rounded overflow-hidden">
        <div class="flex justify-between p-2px border bg-red border-red border-solid overflow-hidden">
            <div class="flex flex-col text-white justify-center text-34px font-semibold items-center bg-red p-15px">
                券
            </div>
            <div class="flex items-center bg-white relative justify-between p-15px flex-1"
                style="border-radius: 0 10px 10px 0;">
                <div>
                    <div class="text-gray-333 text-16px font-semibold">{{ conpupData.name }}</div>
                    <div class="text-gray-999 text-12px mt-8px">{{ conpupData.subtract }}</div>
                    <div class="text-gray-999 text-10px">{{ conpupData.strtime }}</div>
                </div>
                <div class="height-full min-w-52px flex items-center ml-10px">
                    <u-button class="min-w-52px" @click="toDetail" shape="circle" size="small" :color="'#FF545C'"
                        :text="'去使用'">
                    </u-button>
                </div>
                <!-- 圆点 -->
                <div class="absolute top-0 bottom-0 -left-4px flex flex-col justify-between">
                    <div class="bg-white rounded-full w-8px h-8px" v-for="el in 7" :key="el">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    props: {
        conpupData: Object,
        order_id: String
    },
    data() {
        return {
        }
    },
    methods: {
        toDetail() {
            this.toPath(`/pages/coupon-films/index?cinema_id=${this.conpupData.cinema_id}&coupon_id=${this.conpupData.id}&order_id=${this.order_id}`);
        },
    },
};
</script>