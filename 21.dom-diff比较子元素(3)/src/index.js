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
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";
import initGlobalApi from "./global-api/index";
import { stateMixin } from "./state";
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

// 为了看到diff整个流程，创建连个虚拟节点来进行对比操作
import { compilerToFunction } from "./compiler/index";
import { createElm, patch } from "./vdom/patch";
let vm1 = new Vue({
  data: {
    name: "zf",
  },
});
// let render1 = compilerToFunction('<div id="a" class="a" style="color:red">{{name}}</div>')
let render1 = compilerToFunction(`
  <div>
  <li data="a" style="background:red" key="a">A</li>
  <li data="b" style="background:blue" key="b">B</li>
  <li data="c" style="background:gray" key="c">C</li>
  <li data="d" style="background:purple" key="d">D</li>
  </div>`);
let vnode1 = render1.call(vm1);
document.body.appendChild(createElm(vnode1)); // 创建真实的节点。

let vm2 = new Vue({
  data: {
    name: "jw",
  },
});
// let render2 = compilerToFunction(
//   '<div id="b" class="a" style="background:blue">{{name}}</div>'
// )
/*
观测之后，如果加了key,后面2个老节点复用不变，
不加key的情况下，前面E-C都变化了，只有D复用了。进行diff的时候，默认了E和原来的A进行依次对比。
*/
let render2 = compilerToFunction(`
  <div>
  <li style="background:skyblue" key="d">D</li>
  <li data="a" style="background:red" key="c">C</li>
  <li data="b" style="background:blue" key="b">B</li>
  <li data="c" style="background:gray" key="a">A</li>
  </div>`);
let vnode2 = render2.call(vm2);
// document.body.appendChild(createElm(vnode2))

// 执行patch比较，用新的虚拟节点对比老的虚拟节点，找到差异，去更新老的虚拟节点
// patch(vnode1,vnode2); // 传入一个新的虚拟节点和老的对比。
setTimeout(() => {
  patch(vnode1, vnode2); // 传入一个新的虚拟节点和老的对比。
}, 1000);

export default Vue;
