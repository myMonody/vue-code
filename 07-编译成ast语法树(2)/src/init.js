import { initState } from "./state";
import {compilerToFunction} from './compiler/index'
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


    // (如果当前有el属性说明要渲染模板
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
// 做挂载操作的
    const vm = this;
    el = document.querySelector(el);
    // console.log(el);
    const options = vm.$options; 
    if (!options.render) {
       // 没有render方法，将template转化为render方法。
      let template = options.template;
      if (!template && el) {
        // 如果没有template，有el,此时就是拿到所有的html结构了。
        template = el.outerHTML;

      }
      // console.log(template);
      // 然后要做的事件是---把我们的模板编译成render
      const render = compilerToFunction(template);
      options.render = render; // 拿到render后给到options，到处都可以拿到次render方法了
    } else {
      
    }
  }
}
