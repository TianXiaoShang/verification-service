<template>
    <div class="w-full">
        <div class="text-gray-999 flex justify-between items-center text-14px">实名观演人</div>
        <div class="text-red flex justify-between items-center text-12px mt-10px">
            仅需选择{{ maxSelect }}位，入场需携带对应身份证
        </div>
        <div style="border-top: 1px dashed #ccc" class="h-0px w-full my-10px"></div>
        <div class="text-gray-666 text-14px mt-15px">
            <div class="flex items-cetner justify-between mb-8px" v-for="(item, index) in curSelectIdcards" :key="index">
                <div>
                    <span class="text-gray-333">{{ item.realname }}</span>
                    <span class="ml-10px">{{ item.idcard }}</span>
                </div>
                <div @click="onDeleteIdcard(item)">
                    <u-icon size="18px" color="#FF545C" name="trash"></u-icon>
                </div>
            </div>
            <div class="py-8px mt-12px text-red rounded-4px text-14px flex justify-center"
                style="border: 1px dashed #FF545C;" @click="onShowIdcardPopup">点击选择观影人</div>
        </div>

        <u-popup :show="showIdcardPopup" :round="20" @close="showIdcardPopup = false" :safeAreaInsetBottom="false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16 font-semibold ">
                    <span> 选择观演人 </span>
                    <span>
                        <u-icon name="close" size="18px" @click="showIdcardPopup = false"></u-icon>
                    </span>
                </div>
                <div class="h-60vh w-100vw">
                    <idcard-list :maxSelect="maxSelect" v-if="showIdcardPopup" :curSelect="curSelectIdcards"
                        :isHeight="'60vh'" :cinema_id="cinema_id" @onChange="onChangeIdcards"
                        @onClose="showIdcardPopup = false"></idcard-list>
                </div>
            </div>
        </u-popup>
    </div>
</template>

<script>
import IdcardList from '@/order/idcard-comp/list.vue';

export default {
    components: { IdcardList },
    props: {
        maxSelect: Number,
        cinema_id: String,
        curSelect: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            showIdcardPopup: false,
            curSelectIdcards: [],
        }
    },
    watch: {
        curSelect: {
            handler(val) {
                this.curSelectIdcards = val ? [...val] : [];
            },
            immediate: true,
        }
    },
    methods: {
        onShowIdcardPopup() {
            this.curSelectIdcards = [...this.curSelectIdcards];
            this.showIdcardPopup = true;
        },
        onChangeIdcards(e) {
            this.curSelectIdcards = e || [];
            this.$emit('onChange', this.curSelectIdcards);
        },
        onDeleteIdcard(item) {
            const index = this.curSelectIdcards.findIndex(e => e.id === item.id);
            if (index !== -1) {
                this.curSelectIdcards.splice(index, 1);
                this.$emit('onChange', this.curSelectIdcards);
            }
        },
    }
};
</script>

<style lang="scss" scoped></style>
