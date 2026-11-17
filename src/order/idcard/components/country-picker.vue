<template>
    <u-popup :show="show" :round="20" :zIndex="10105" :overlayStyle="{ zIndex: 10100 }"
        :closeOnClickOverlay="true" @close="$emit('close')">
        <div class="country-picker">
            <div class="country-picker__header">
                <span class="country-picker__title">选择国家/地区</span>
                <div class="country-picker__close" @click="$emit('close')">
                    <u-icon name="close" size="18px" color="#999999"></u-icon>
                </div>
            </div>
            <div class="country-picker__search">
                <u--input v-model="keyword" border="none" placeholder="搜索国家/地区" clearable
                    prefixIcon="search" :prefixIconStyle="{ color: '#999999', fontSize: '18px' }"
                    fontSize="14px" color="#333333" placeholderStyle="color: #999999"
                    :customStyle="{ padding: '0', backgroundColor: 'transparent', width: '100%' }"></u--input>
            </div>
            <scroll-view scroll-y="true" :enable-flex="true" class="country-picker__list">
                <div v-if="loading" class="country-picker__message">加载中...</div>
                <div v-else-if="loadFailed" class="country-picker__message">国家列表获取失败，请关闭后重试</div>
                <template v-else>
                    <div v-for="item in filteredCountries" :key="item.code"
                        class="country-picker__row" :class="{ 'country-picker__row--selected': value === item.code }"
                        @click="$emit('select', item)">
                        <span class="country-picker__name">{{ item.name }}</span>
                        <u-icon v-if="value === item.code" name="checkbox-mark" color="#FF214C" size="18px"
                            :customStyle="{ marginLeft: '12px', flexShrink: 0 }"></u-icon>
                    </div>
                    <div v-if="!filteredCountries.length" class="country-picker__message">
                        {{ keyword ? '暂无匹配的国家/地区' : '暂无可选国家/地区' }}
                    </div>
                </template>
            </scroll-view>
        </div>
    </u-popup>
</template>

<script>
export default {
    props: {
        show: Boolean,
        value: String,
        cinema_id: String,
    },
    data() {
        return {
            countries: [],
            keyword: '',
            loaded: false,
            loading: false,
            loadFailed: false,
        };
    },
    computed: {
        filteredCountries() {
            const keyword = this.keyword.trim();
            return this.countries.filter(item => item.name.includes(keyword) || item.code.includes(keyword.toUpperCase()));
        },
    },
    watch: {
        show(value) {
            if (value) {
                this.keyword = '';
                if (!this.loaded && !this.loading) {
                    this.loadCountries();
                }
            } else {
                uni.hideKeyboard();
            }
        },
    },
    methods: {
        loadCountries() {
            this.loading = true;
            this.loadFailed = false;
            return this.request('idcard.countries', { cinema_id: this.cinema_id, _showLoading: false }).then(res => {
                this.countries = res.list;
                this.loaded = true;
                this.loading = false;
            }, () => {
                this.loadFailed = true;
                this.loading = false;
            });
        },
    },
};
</script>

<style scoped>
.country-picker {
    display: flex;
    flex-direction: column;
    height: 70vh;
}

.country-picker__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 12px;
}

.country-picker__title {
    color: #333333;
    font-size: 17px;
    font-weight: 600;
    line-height: 26px;
}

.country-picker__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: -6px;
}

.country-picker__search {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 40px;
    margin: 0 20px 8px;
    padding: 0 12px;
    border-radius: 5px;
    background-color: #f5f5f5;
}

.country-picker__list {
    flex: 1;
    min-height: 0;
    height: 0;
    width: 100%;
}

.country-picker__row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    min-height: 52px;
    margin: 0 20px;
    padding: 14px 0;
}

.country-picker__row::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1px;
    background-color: #eeeeee;
    content: '';
    transform: scaleY(0.5);
    transform-origin: bottom;
}

.country-picker__row:last-child::after {
    display: none;
}

.country-picker__name {
    flex: 1;
    min-width: 0;
    color: #333333;
    font-size: 15px;
    line-height: 24px;
}

.country-picker__row--selected .country-picker__name {
    color: #FF214C;
    font-weight: 500;
}

.country-picker__message {
    padding: 40px 20px;
    color: #999999;
    font-size: 14px;
    line-height: 22px;
    text-align: center;
}
</style>
