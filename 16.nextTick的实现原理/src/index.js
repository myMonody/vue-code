// export  const fn = () => {
// }
// 使用构造函数来实现
/*
options写法的就是将new Vue({
   el:'#app',
   data(){
   return {
     a:1
   }
   },
   watch:{} 得的各类参数传递给了 Vue这个构造函数的options中。
})
*/
import { initMixin } from "./init";
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './vdom/index'
import initGlobalApi from './global-api/index'
import {stateMixin} from './state';
function Vue(options) {
  //   console.log(options)
  this._init(options); // 入口方法，做初始化操作
}
// 写成一个个的插件，对原型进行扩展。
initMixin(Vue);

lifecycleMixin(Vue); // 混合生命周期  渲染--扩展的update方法。

renderMixin(Vue); // 扩展的render方法

stateMixin(Vue); // 原型上扩展一个更新state的方法



initGlobalApi(Vue);

// 静态方法--Vue.component,Vue.extend, Vue.directive,Vue.mixin...

export default Vue;
