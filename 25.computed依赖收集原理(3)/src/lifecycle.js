import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher";
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const prevVnode = vm._vnode; // 如果第一次_vnode不存在
    // 这里需要区分一下 到底首次渲染还是更新---
    if (!prevVnode) {
      // 用新的创建的元素，替换掉老的vm.$el
      vm.$el = patch(vm.$el, vnode);
    } else {
      // 拿上一次的vnode和 本次的vnode做对比。
      vm.$el = patch(prevVnode,vnode);
    }
    vm._vnode = vnode;// 保存vnode;
  };
}

export function mountComponent(vm, el) {
  // 调用render方法去渲染 el属性。

  // 先调用render方法创建虚拟节点，在将虚拟节渲染到页面中去。
  // !!! 核心逻辑---是先调用render方法转化为虚拟dom，然后再调用update方法转化为真实的dom
  vm.$el = el;
  callHook(vm, "beforeMount");

  let updateComponent = () => {
    vm._update(vm._render());
  };
  // !!!!!初始化的时候就会创建watcher
  // watcher是用于渲染，自动调动了updateComponent
  let watcher = new Watcher(
    vm,
    updateComponent,
    () => {
      callHook(vm, "beforeUpdate");
    },
    true
  );

  /*
  setTimeout(() => {
    watcher.get()
  },2000)
*/

  // 要把属性和watcher绑定起来。

  callHook(vm, "mounted");
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm);
    }
  }
}
