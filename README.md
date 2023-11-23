# ticket-service

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run start
```

### Compiles and minifies for production
```
pnpm run build:mp-weixin
pnpm run build:mp-toutiao
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


# 以下需要注意
## 对于uview组件库，需要给u-picker组件进行修改，否则抖音端该组件有bug
### 1: 手动将show改成true，或外部传入
``` <u-toolbar
        v-if="showToolbar"
        :show="true"
        :cancelColor="cancelColor"
        :confirmColor="confirmColor"
        :cancelText="cancelText"
        :confirmText="confirmText"
        :title="title"
        @cancel="cancel"
        @confirm="confirm"
    ></u-toolbar> 
```
### 2: methods中添加toJSON空方法，否则会报错；
### 3: 在使用组件时，需要手动传入一些值，默认值不会生效(title、cancelText、confirmText、cancelColor、confirmColor、showToolbar)
``` <u-picker :show="show" ref="uPicker" :title="'请选择'" :cancelText="'取消'" :confirmText="'确认'" :cancelColor="'#999999'"
        :confirmColor="'#FF545C'" :showToolbar="true" :immediateChange="true" :columns="columns" :defaultIndex="defaultIndex"
        @cancel="show = false" @confirm="confirm"></u-picker> 
```

## 对于uni-data-picker组件，要注释uni-data-picker.js中的186行：``` // this._treeData = [] ```，否则真机安卓抖音端有问题，这里没必要清空；从打印日志看，真机跟模拟器执行顺序有出入。在模拟器是正常的；

## 对于uview组件库，需要对u-slider组件进行修改（:inactiveColor="inactiveColor" 改成 :backgroundColor="inactiveColor"），uni原生slider组件没有inactiveColor属性，实则为backgroundColor
