export function renderMixin (Vue) {
  Vue.prototype._c = function () { // 创建元素
    return createElement(...arguments); // 创建虚拟dom
  }
  Vue.prototype._s = function (val) { // stringify
    return val == null ? '' : (typeof val == 'object' ? JSON.stringify(val) : val)
  }
  Vue.prototype._v = function (text) { // 创建文本元素。
    return createTextVnode(text)
  }
  Vue.prototype._render = function () {
    const vm = this
    // 调用我们之前的render方法。
    const render = vm.$options.render
     let vnode = render.call(vm)
   //   console.log('===', vnode);
    return vnode
  }
}

function createElement (tag, data = {} , ...children) {
  //   console.log(arguments)
  return vnode(tag, data, data.key, children)
}
function createTextVnode (text) {
  //   console.log(text, '----text')
  return vnode(undefined, undefined, undefined, undefined, text)
}
// 用来产生虚拟dom的
function vnode (tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
  text}
}
