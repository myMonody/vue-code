import { initState } from "./state";
export function initMixin(Vue) {
  // 初始化方法。---
  Vue.prototype._init = function (options) {
    // console.log(options);
    // 吧options放到实例上去
    const vm = this;
    vm.$options = options;

    // vue里面的核心特性-- 响应式数据原理。

    // 初始化状态---将数据进行一个初始化的劫持。当我们改变数据的时候应该更新视图。
    // vue组件中有很多状态--data props watch computed
    initState(vm);
  };
}
