import { mergeOptions } from '../util';
export default function initGlobalApi(Vue) {
   Vue.options = {}; // Vue.components Vue.directive
   Vue.mixin = function (mixin) {
      // console.log(mixin);
      // 合并对象， 先考虑生命周期---先不考虑其他的合并 data computed watch
      this.options = mergeOptions(this.options, mixin);
      console.log(this.options, '00000')
      return this;
   }
   // Vue.options, options
   // 用户new Vue({created(){}})
}