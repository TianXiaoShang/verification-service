export default {
    data() {
        return {
            countryName: '',
            showCountry: false,
        };
    },
    computed: {
        needsCountry() {
            return Number(this.formData.type) === 4 || Number(this.formData.type) === 5;
        },
    },
    watch: {
        needsCountry(value) {
            if (!value) {
                this.formData.country_code = '';
                this.countryName = '';
                this.showCountry = false;
            }
        },
    },
    methods: {
        openCountryPicker() {
            uni.hideKeyboard();
            this.showCountry = true;
        },
        selectCountry(country) {
            this.formData.country_code = country.code;
            this.countryName = country.name;
            this.showCountry = false;
        },
        getIdcardParams() {
            const params = { ...this.formData, type: Number(this.formData.type) };
            if (!this.needsCountry) {
                delete params.country_code;
            }
            return params;
        },
    },
};
