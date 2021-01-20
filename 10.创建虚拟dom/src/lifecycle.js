export function lifecycleMixin(Vue) {
   Vue.prototype._update = function (vnode) {
      
   }
}

export function mountComponent(vm, el) {
   // 调用render方法去渲染 el属性。

   // 先调用render方法创建虚拟节点，在将虚拟节渲染到页面中去。
   // !!! 核心逻辑---是先调用render方法转化为虚拟dom，然后再调用update方法转化为真实的dom;
   vm._update(vm._render());
}