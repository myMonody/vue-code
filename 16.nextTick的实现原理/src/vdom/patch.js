export function patch(oldVnode, vnode) {
  // 将虚拟节点转化为真实节点---递归创建元素的过程
  // console.log("---path--", oldVnode, vnode); // 这里oldVnode就是我们原来的#app所在的节点。
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    let el = createElm(vnode); // 产生真实的dom
    let parentElm = oldVnode.parentNode;
    // 然后塞进去新的节点
    parentElm&&parentElm.insertBefore(el, oldVnode.nextSibling); // 插入到下一个元素的前面去。
    parentElm&&parentElm.removeChild(oldVnode); // 删除老的节点
    return el;
  }
}
function createElm(vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag == "string") {
    // 创建元素 放到vnode.el上面去
    vnode.el = document.createElement(tag);

    // 只有元素才有属性--
    updateProperties(vnode);

    // 渲染children。将children塞到vnode的el上面去。
    children.forEach((child) => {
      // 遍历儿子 将儿子渲染后的结果扔到父级
      vnode.el.appendChild(createElm(child));
    });
  } else {
    // 创建文本 放到vnode的el上面去。
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function updateProperties(vnode) {
  let el = vnode.el;
  let newProps = vnode.data || {};
  for (let key in newProps) {
    if (key === "style") {
      // {color:red}
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = el.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}

/* !!!!!!!!! 初步渲染的流程--> 后面还有数据的同步更新。
vue的渲染流程：
1--先初始化数据-->
2--将模板编译成ast语法树-->
3--render函数--->
4--生成虚拟dom节点(描述dom的一个对象)--->
5--生成真实的dom(patch方法调用)--->
6--扔到页面上去
*/
