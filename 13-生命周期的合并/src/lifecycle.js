import {patch} from './vdom/patch'
export function lifecycleMixin(Vue) {
   Vue.prototype._update = function (vnode) {
      const vm = this;
      patch(vm.$el, vnode);
   }
}

export function mountComponent(vm, el) {
   // 调用render方法去渲染 el属性。

   // 先调用render方法创建虚拟节点，在将虚拟节渲染到页面中去。
   // !!! 核心逻辑---是先调用render方法转化为虚拟dom，然后再调用update方法转化为真实的dom;
  
   callHook(vm, 'beforeMount');
  
  
   vm._update(vm._render());

   callHook(vm,'mounted')
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm);
        }
    }
}