<template>
    <div class="w-full overflow-hidden">
        <div class="mb-10px flex items-end">
            <div class="text-gray-333 text-15px">实名观演人</div>
            <div class="text-gray-666 text-12px ml-10px">
                需选择<span class="text-red">{{ maxSelect }}位</span>，用于入场身份验证
            </div>
        </div>
        <div class="w-full flex items-center">
            <scroll-view scroll-x="true" :enable-flex="true" class="min-w-0 flex-1 whitespace-nowrap"
                @scrolltolower="loadMore">
                <div v-for="item in listData" :key="item.id" @click="onCheck(item)"
                    class="text-gray-333 text-13px inline-flex items-center justify-center px-12px min-w-70px py-9px mr-8px rounded-sm relative box-border overflow-hidden"
                    style="border: 1px solid #ddd;"
                    :class="{ activeBoxName: curSelectIdcards.some(el => el.id === item.id) }">
                    {{ item.realname }}
                    <div v-if="curSelectIdcards.some(el => el.id === item.id)" class="idcard-selected-corner">
                        <u-icon name="checkmark" color="#ffffff" size="9px" class="absolute bottom-0 right-0"></u-icon>
                    </div>
                </div>
            </scroll-view>
            <div @click="onOpen"
                class="text-gray-333 text-13px flex-none flex items-center rounded-sm px-12px py-9px relative"
                style="border: 1px solid #ddd;">
                <span class="mr-4px">选择/新增</span>
                <u-icon name="arrow-right" size="12px" color="#666666"></u-icon>
                <div class="absolute -left-12px top-0 h-33px w-12px"
                    style="background: linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.8));">
                </div>
            </div>
        </div>
        <div v-if="!curSelectIdcards.length" class="h-14px w-full"></div>
        <div v-else class="selected-attendees">
            <div v-for="(item, index) in curSelectIdcards" :key="item.id" class="selected-attendee">
                <div class="selected-attendee__body">
                    <div class="selected-attendee__heading">
                        <span class="selected-attendee__label">观演人{{ index + 1 }}</span>
                        <span class="selected-attendee__name">{{ item.realname }}</span>
                    </div>
                    <div class="attendee-document">
                        <span class="attendee-document__type">{{ types[Number(item.type)] }}</span>
                        <span>{{ item.idcard }}</span>
                    </div>
                    <div v-if="item.country_name" class="attendee-country">国家/地区：{{ item.country_name }}</div>
                </div>
                <div class="selected-attendee__remove" @click="onDeleteIdcard(item)">
                    <u-icon name="minus-circle" size="18px" color="#999999"></u-icon>
                </div>
            </div>
        </div>

        <!-- 选择观演人 -->
        <u-popup :show="showIdcardList" :round="20" @close="closeList" :closeOnClickOverlay="false">
            <div>
                <div class="attendee-picker__header">
                    <span>需选择{{ maxSelect }}位观演人</span>
                    <div class="attendee-picker__close" @click="closeList">
                        <u-icon name="close" size="18px" color="#999999"></u-icon>
                    </div>
                </div>
                <div class="attendee-picker__content">
                    <scroll-view scroll-y="true" :enable-flex="true" class="attendee-picker__list" :style="{ height: attendeeListHeight + 'px' }"
                        @scrolltolower="loadMore">
                        <div v-if="listLoading && !listData.length" class="attendee-picker__empty">加载中...</div>
                        <div v-else-if="!listData.length" class="attendee-picker__empty">暂无观演人～</div>
                        <div v-for="item in listData" :key="item.id" @click="onCheck(item)" class="attendee-option">
                            <div class="attendee-option__check">
                                <u-icon v-if="curSelectIdcards.some(el => el.id === item.id)" size="20px"
                                    name="checkmark-circle-fill" color="#FF214C"></u-icon>
                                <div v-else class="attendee-option__unchecked"></div>
                            </div>
                            <div class="attendee-option__body">
                                <div class="attendee-option__heading">
                                    <span class="attendee-option__name">{{ item.realname }}</span>
                                    <div class="idcard-actions" :class="{ 'idcard-actions--disabled': isManaging }" @click.stop>
                                        <div class="idcard-actions__button" @click.stop="onEdit(item)">{{ editLoadingId === item.id ? '加载中' : '编辑' }}</div>
                                        <div class="idcard-actions__button idcard-actions__button--delete" @click.stop="onDelete(item)">删除</div>
                                    </div>
                                </div>
                                <div class="attendee-document">
                                    <span class="attendee-document__type">{{ types[Number(item.type)] }}</span>
                                    <span>{{ item.idcard }}</span>
                                </div>
                                <div v-if="item.country_name" class="attendee-country">国家/地区：{{ item.country_name }}</div>
                            </div>
                        </div>
                        <div v-if="listData.length && listLoading" class="attendee-picker__status">加载中...</div>
                        <div v-else-if="listData.length && pageFinish" class="attendee-picker__status">没有更多啦~</div>
                    </scroll-view>
                    <div class="attendee-picker__footer">
                        <u-button shape="circle" size="normal" :disabled="isManaging"
                            :customStyle="{ height: '44px', width: 'calc((100vw - 56px) / 2)', margin: 0, background: '#fff', border: '1px solid #dddddd', color: '#333333' }"
                            color="#FF214C" text="新增观演人" @click="onAdd">
                        </u-button>
                        <u-button shape="circle" size="normal" :disabled="isManaging"
                            :customStyle="{ height: '44px', width: 'calc((100vw - 56px) / 2)', margin: 0 }"
                            color="#FF214C" text="确定" @click="closeList">
                        </u-button>
                    </div>
                </div>
            </div>
        </u-popup>

        <!-- 新增/编辑观演人 -->
        <u-popup :show="showAddIdcard" :round="20" :zIndex="10085" :overlayStyle="{ zIndex: 10080 }"
            @close="closeForm" :closeOnClickOverlay="false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16px font-semibold">
                    <span>{{ editingId === null ? '添加观演人' : '编辑观演人' }}</span>
                    <u-icon name="close" size="18px" @click="closeForm"></u-icon>
                </div>
                <scroll-view scroll-y="true" class="box-border px-20px w-full h-60vh">
                    <u--form labelPosition="left" labelWidth="80px">
                        <u-form-item label="姓名" prop="realname" labelWidth="80px" borderBottom>
                            <input :value="formData.realname" class="w-full min-w-0 text-14px text-gray-333"
                                placeholder-style="color: #c0c4cc" placeholder="请输入姓名"
                                @input="onChangeText('realname', $event)" />
                        </u-form-item>
                        <u-form-item label="证件类型" prop="type" labelWidth="80px" borderBottom>
                            <div class="flex w-full items-center justify-between text-14px text-gray-333" @click="handleSelect">
                                <span>{{ types[Number(formData.type)] }}</span>
                                <u-icon name="arrow-right" color="#999999"></u-icon>
                            </div>
                        </u-form-item>
                        <u-form-item label="证件号码" prop="idcard" labelWidth="80px" borderBottom>
                            <input :value="formData.idcard" class="w-full min-w-0 text-14px text-gray-333"
                                placeholder-style="color: #c0c4cc" placeholder="请输入证件号码"
                                @input="onChangeText('idcard', $event)" />
                        </u-form-item>
                        <u-form-item v-if="needsCountry" label="国家/地区" prop="country_code" labelWidth="80px" borderBottom required>
                            <div class="flex w-full min-w-0 items-center justify-between text-14px" @click="openCountryPicker">
                                <span v-if="countryName" class="min-w-0 flex-1 text-gray-333 leading-5">{{ countryName }}</span>
                                <span v-else class="flex-1 text-gray-999">请选择国家/地区</span>
                                <u-icon name="arrow-right" color="#999999" class="ml-10px flex-none"></u-icon>
                            </div>
                        </u-form-item>
                    </u--form>
                    <div class="flex items-center mt-15px pb-20px justify-center w-full box-border">
                        <u-button shape="circle" size="normal" :loading="saving" :disabled="saving"
                            :customStyle="{ height: '44px', width: 'calc(100vw - 40px)', margin: 0 }" color="#FF214C" text="保存"
                            @click="onSubmit">
                        </u-button>
                    </div>
                </scroll-view>
            </div>
        </u-popup>

        <!-- 选择证件类型 -->
        <u-popup :show="showSelectType" :round="20" :zIndex="10095" :overlayStyle="{ zIndex: 10090 }"
            @close="showSelectType = false" :closeOnClickOverlay="false">
            <div class="w-full">
                <div
                    class="text-gray-333 px-20px pt-20px pb-10px flex justify-between items-center border-l-0 border-t-0 border-r-0 border-b-1px border-gray-100 border-solid text-16px font-semibold">
                    <span>选择证件类型</span>
                    <u-icon name="close" size="18px" @click="showSelectType = false"></u-icon>
                </div>
                <scroll-view scroll-y="true" class="text-gray-333 h-60vh px-20px box-border">
                    <div v-for="(item, index) in types" :key="index" class="py-14px" @click="confirm(index)"
                        style="border-bottom: 1px solid #eee;">
                        <div class="flex items-center w-full justify-between text-14px">
                            <span>{{ item }}</span>
                            <u-icon v-if="Number(formData.type) === index" name="checkbox-mark" color="#FF214C" size="18px"></u-icon>
                        </div>
                    </div>
                </scroll-view>
            </div>
        </u-popup>
        <country-picker :show="showCountry" :value="formData.country_code" :cinema_id="cinema_id"
            @select="selectCountry" @close="showCountry = false"></country-picker>
    </div>
</template>

<script>
import CountryPicker from './country-picker.vue';
import countryMixin from '../country-mixin.js';

export default {
    components: { CountryPicker },
    mixins: [countryMixin],
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
            types: ['身份证', '港澳台居民居住证', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '护照', '外国人永久居留身份证'],
            curSelectIdcards: [],
            listData: [],
            listLoading: false,
            listRequestId: 0,
            showIdcardList: false,
            showAddIdcard: false,
            showSelectType: false,
            saving: false,
            editingId: null,
            editLoadingId: null,
            deletingId: null,
            formData: {
                realname: '',
                idcard: '',
                type: '0',
                country_code: '',
            },
        }
    },
    computed: {
        attendeeListHeight() {
            if (!this.listData.length) {
                return 72;
            }
            return this.listData.reduce((height, item) => height + (item.country_name ? 89 : 70), 32);
        },
        isOpenPopup() {
            return this.showIdcardList || this.showAddIdcard || this.showSelectType || this.showCountry;
        },
        isManaging() {
            return this.saving || this.editLoadingId !== null || this.deletingId !== null;
        }
    },
    watch: {
        curSelect: {
            handler(val) {
                this.curSelectIdcards = [...val];
            },
            immediate: true,
        },
        isOpenPopup(val) {
            this.$emit('onOpenPopup', val);
        },
    },
    created() {
        return this.getData();
    },
    methods: {
        closeList() {
            if (!this.isManaging) {
                this.showIdcardList = false;
            }
        },
        closeForm() {
            if (this.saving) {
                return;
            }
            this.showAddIdcard = false;
            uni.hideKeyboard();
        },
        resetForm() {
            this.editingId = null;
            this.formData = { realname: '', idcard: '', type: '0', country_code: '' };
            this.countryName = '';
            this.showCountry = false;
            this.showSelectType = false;
        },
        onAdd() {
            if (this.isManaging) {
                return;
            }
            if (this.editingId !== null) {
                this.resetForm();
            }
            this.showAddIdcard = true;
        },
        async onEdit(item) {
            if (this.isManaging) {
                return;
            }
            this.editLoadingId = item.id;
            let res;
            try {
                res = await this.request('idcard.show', { idcard_id: item.id, cinema_id: this.cinema_id });
            } catch (error) {
                this.onRequestError(error);
                return;
            } finally {
                this.editLoadingId = null;
            }
            const { idcard } = res;
            this.resetForm();
            this.editingId = item.id;
            this.formData = {
                realname: idcard.realname,
                idcard: idcard.idcard,
                type: String(idcard.type),
                country_code: idcard.country_code,
            };
            this.countryName = idcard.country_name;
            this.showAddIdcard = true;
        },
        async onDelete(item) {
            if (this.isManaging) {
                return;
            }
            this.deletingId = item.id;
            try {
                const confirmed = await new Promise(resolve => {
                    uni.showModal({
                        title: '删除观演人',
                        content: `确定删除观演人“${item.realname}”吗？`,
                        confirmColor: '#FF214C',
                        success: res => resolve(res.confirm),
                        fail: error => {
                            console.error('删除确认失败', error);
                            this.myMessage('无法打开删除确认，请重试');
                            resolve(false);
                        },
                    });
                });
                if (!confirmed) {
                    return;
                }
                try {
                    await this.request('idcard.delete&cinema_id=' + this.cinema_id, { idcard_id: item.id }, 'POST');
                } catch (error) {
                    this.onRequestError(error);
                    return;
                }
                this.onDeleteIdcard(item);
                this.myMessage('删除观演人成功');
                await this.refreshData();
            } finally {
                this.deletingId = null;
            }
        },
        refreshData() {
            this.listData = [];
            this.myCurrentPage = 1;
            this.pageFinish = false;
            return this.getData(true);
        },
        onRequestError(error) {
            console.error('观演人请求失败', error);
            if (error.errMsg) {
                this.myMessage('网络异常，请稍后重试');
            }
        },
        onOpen() {
            this.showIdcardList = true;
            if (!this.listLoading) {
                return this.getData(true);
            }
        },
        onCheck(item) {
            const index = this.curSelectIdcards.findIndex(el => el.id === item.id);
            if (index === -1) {
                if (this.curSelectIdcards.length >= this.maxSelect) {
                    this.myMessage(`最多可选${this.maxSelect}人`);
                    return;
                }
                this.curSelectIdcards.push(item);
            } else {
                this.curSelectIdcards.splice(index, 1);
            }
            this.$emit('onChange', [...this.curSelectIdcards]);
        },
        onDeleteIdcard(item) {
            const index = this.curSelectIdcards.findIndex(e => e.id === item.id);
            if (index !== -1) {
                this.curSelectIdcards.splice(index, 1);
                this.$emit('onChange', [...this.curSelectIdcards]);
            }
        },
        loadMore() {
            return this.getData();
        },
        async getData(reset = false) {
            if (!reset && (this.listLoading || this.pageFinish)) {
                return;
            }
            const requestId = ++this.listRequestId;
            const page = reset ? 1 : this.myCurrentPage;
            this.listLoading = true;
            try {
                let res;
                try {
                    res = await this.request('idcard.index', {
                        page,
                        cinema_id: this.cinema_id,
                        _showLoading: false,
                    });
                } catch (error) {
                    this.onRequestError(error);
                    return;
                }
                if (requestId !== this.listRequestId) {
                    return;
                }
                const { data, total } = res;
                this.listData = reset ? data : [...this.listData, ...data];
                this.myCurrentPage = page + 1;
                this.pageFinish = this.listData.length >= Number(total);
            } finally {
                if (requestId === this.listRequestId) {
                    this.listLoading = false;
                }
            }
        },
        onChangeText(key, e) {
            this.formData[key] = e.detail.value;
        },
        handleSelect() {
            uni.hideKeyboard();
            this.showSelectType = true;
        },
        confirm(index) {
            this.formData.type = String(index);
            this.showSelectType = false;
        },
        async onSubmit() {
            if (this.saving) {
                return;
            }
            if (!this.formData.realname || !this.formData.idcard || this.formData.type === '') {
                this.myMessage('请填写完整后提交');
                return;
            }
            if (this.needsCountry && !this.formData.country_code) {
                this.myMessage('请选择国家/地区');
                return;
            }
            const editingId = this.editingId;
            const params = this.getIdcardParams();
            if (editingId !== null) {
                params.idcard_id = Number(editingId);
            }
            this.saving = true;
            try {
                const route = editingId === null ? 'idcard.store' : 'idcard.update';
                let res;
                try {
                    res = await this.request(route + '&cinema_id=' + this.cinema_id, params, 'POST');
                } catch (error) {
                    this.onRequestError(error);
                    return;
                }
                if (editingId !== null && this.curSelectIdcards.some(item => item.id === editingId)) {
                    this.curSelectIdcards = this.curSelectIdcards.map(item => item.id === editingId ? res.idcard : item);
                    this.$emit('onChange', [...this.curSelectIdcards]);
                }
                this.myMessage(editingId === null ? '添加身份信息成功' : '修改身份信息成功');
                this.showAddIdcard = false;
                this.resetForm();
                uni.hideKeyboard();
                await this.refreshData();
            } finally {
                this.saving = false;
            }
        },
    }
};
</script>

<style lang="scss" scoped>
.selected-attendees {
    margin-top: 6px;
}

.selected-attendee {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;
    border-top: 1px solid #f3f3f3;
}

.selected-attendee__body {
    flex: 1;
    min-width: 0;
}

.selected-attendee__heading {
    display: flex;
    align-items: baseline;
    line-height: 20px;
}

.selected-attendee__label {
    flex-shrink: 0;
    margin-right: 8px;
    color: #999999;
    font-size: 12px;
}

.selected-attendee__name {
    min-width: 0;
    color: #333333;
    font-size: 14px;
    font-weight: 500;
    word-break: break-all;
}

.selected-attendee__remove {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin: -5px -6px 0 6px;
}

.attendee-document {
    margin-top: 2px;
    color: #666666;
    font-size: 12px;
    line-height: 18px;
    word-break: break-all;
}

.attendee-document__type {
    margin-right: 6px;
}

.attendee-country {
    margin-top: 1px;
    color: #999999;
    font-size: 12px;
    line-height: 18px;
    word-break: break-all;
}

.attendee-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px 6px;
    color: #333333;
    font-size: 16px;
    font-weight: 600;
    line-height: 26px;
}

.attendee-picker__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: -6px;
}

.attendee-picker__content {
    padding: 0 20px 10px;
}

.attendee-picker__list {
    width: 100%;
    max-height: 46vh;
}

.attendee-picker__empty {
    padding: 12px 0;
    color: #999999;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
}

.attendee-option {
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
    min-height: 68px;
    padding: 10px 0;
    border-bottom: 1px solid #f3f3f3;
}

.attendee-option__check {
    flex-shrink: 0;
    width: 20px;
    margin: 4px 12px 0 0;
}

.attendee-option__unchecked {
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    border: 1px solid #dddddd;
    border-radius: 50%;
}

.attendee-option__body {
    flex: 1;
    min-width: 0;
}

.attendee-option__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;
}

.attendee-option__name {
    flex: 1;
    min-width: 0;
    margin-right: 12px;
    color: #333333;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    word-break: break-all;
}

.attendee-picker__status {
    padding: 8px 0;
    color: #aaaaaa;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
}

.attendee-picker__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
}

.idcard-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
}

.idcard-actions__button {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 36px;
    height: 28px;
    padding: 0 6px;
    color: #666666;
    font-size: 12px;
    line-height: 18px;
}

.idcard-actions__button--delete {
    color: #FF214C;
    margin-left: 4px;
}

.idcard-actions--disabled {
    opacity: 0.45;
}

.activeBoxName {
    border-color: #FF214C !important;
    background: rgba(255, 33, 76, 0.1);
}

.idcard-selected-corner {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, transparent 50%, #FF214C 50%);
}
</style>
