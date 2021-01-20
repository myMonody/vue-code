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
function Vue(options) {
  //   console.log(options)
  this._init(options); // 入口方法，做初始化操作
}
// 写成一个个的插件，对原型进行扩展。
initMixin(Vue);

export default Vue;
