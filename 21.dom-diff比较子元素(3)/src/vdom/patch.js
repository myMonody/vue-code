export function patch(oldVnode, vnode) {
  // 默认初始化的时候， 是直接用虚拟节点创建出真实的节点来，替换老节点。
  if (oldVnode.nodeType === 1) {
    let el = createElm(vnode); // 产生真实的dom
    let parentElm = oldVnode.parentNode;
    // 然后塞进去新的节点
    parentElm && parentElm.insertBefore(el, oldVnode.nextSibling); // 插入到下一个元素的前面去。
    parentElm && parentElm.removeChild(oldVnode); // 删除老的节点
    return el;
  } else {
    // 在更新的时候，拿老的虚拟节点和新的虚拟节点做对比，将不同的地方更新真实的dom

    // 更新功能。
    // 那当前2个节点  整个
    // 1， 比较两个元素的标签，标签不一定直接替换掉即可。
    if (oldVnode.tag !== vnode.tag) {
      // 老的dom
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }

    // 2,有可能是标签一样 <div>1</div>   <div>2</div>
    // 文本节点的虚拟节点tag都是undefined
    if (!oldVnode.tag) {
      // 文本的比较
      if (oldVnode.text !== vnode.text) {
        return (oldVnode.el.textContent = vnode.text);
      }
    }

    // 标签一样，并且需要开始比对标签的属性和儿子。
    // 标签一样，最好复用。
    let el = (vnode.el = oldVnode.el); // 复用老节点。

    // 更新属性，用新的虚拟节点的属性
    updateProperties(vnode, oldVnode.data);

    // 儿子比较
    /*
    1, 老的有儿子 新的没有儿子
    2，老的没有儿子，新的有儿子
    3，老的有儿子，新的有儿子----真正的diff算法。
    */
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];
    // 老的有儿子，新的也有儿子 diff
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 递归去比较
      updateChildren(oldChildren, newChildren, el);
    } else if (oldChildren.length > 0) {
      // 新的没有--清空老的节点。
      el.innerHTML = "";
    } else if (newChildren.length > 0) {
      // 老的没有--开始添加插入新的元素
      for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElm(child));
      }
    }
  }
  // 儿子之间的比较。
  function updateChildren(oldChildren, newChildren, parent) {
    // 开头指针
    let oldStartIndex = 0; // 老的索引
    let oldStartVnode = oldChildren[0]; // 老的索引指向的节点
    // 尾指针
    let oldEndIndex = oldChildren.length - 1; // 老的尾部索引
    let oldEndVnode = oldChildren[oldEndIndex]; // 老的尾节点

    // 开头指针
    let newStartIndex = 0; // 新的索引
    let newStartVnode = newChildren[0]; // 新的索引指向的节点
    // 尾指针
    let newEndIndex = newChildren.length - 1; // 新的尾部索引
    let newEndVnode = newChildren[newEndIndex]; // 新的尾节点

    // 当首尾指针碰头的时候过程结束。老的和新的一起循环 || 一个true就继续， && 两个都得是true
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 比较谁先循环完。有一个不满足了就结束了while循环。
      if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 如果两个是同一元素--比较儿子
        patch(oldStartVnode, newStartVnode); // 更新属性和再去递归更新子节点。
        oldStartVnode = oldChildren[++oldStartIndex]; // 修改指针，并取下一个数据
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 上面的情况是前置和后置插入。
        // 还有一种情况 ---反转节点。--头部移动到尾部，尾部移动到头部
        // 老的头 新的尾
        patch(oldStartVnode, newEndVnode);
        // 将老的开头加点插入到，老的结尾节点的下一个元素的前面。
        parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex]
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode,newStartVnode)) {
        patch(oldEndVnode,newStartVnode);
        parent.insertBefore(oldEndVnode.el,oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      }
      /*
        为什么要加key,循环的时候为什么不能用index作为key
        index ---就像没有key一样。
      */
    }
    // 当到达重合条件的时候
    if (newStartIndex <= newEndIndex) {
      // 将多余的数据插入到parent中
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        // 可能是向前添加，也可能是向后添加node
        // parent.appendChild(createElm(newChildren[i]));

        // 尾指针的下一个存不存在的问题，存在就是在头部前面插入，不存在就追加到后面
        // 向后插入 ele = null
        // 向前插入 ele 就是当前向谁前面插入
        let ele =
          newChildren[newEndIndex + 1] == null
            ? null
            : newChildren[newEndIndex + 1].el;
        // insertBefore兼有appendChild的功能。
        parent.insertBefore(createElm(newChildren[i]), ele);
      }
    }

    // vue中的diff算法做了很多优化
    /*
   dom操作有很多常见的逻辑 把节点插入到当前儿子的头部，尾部，儿子倒叙正序
   vue2 中采用的是双指针的方式。
   */

    // 1,我们需要在尾部添加。
    // 我要做一个循环，同时循环老的和新的，哪个先结束，循环停止，将多余的删除或者添加进去。
  }

  function isSameVnode(oldVnode, newVnode) {
    // key和标签的同时满足
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
  }

  // 将虚拟节点转化为真实节点---递归创建元素的过程
  // console.log("---path--", oldVnode, vnode); // 这里oldVnode就是我们原来的#app所在的节点。
  // const isRealElement = oldVnode.nodeType;
  // if (isRealElement) {
  //   let el = createElm(vnode); // 产生真实的dom
  //   let parentElm = oldVnode.parentNode;
  //   // 然后塞进去新的节点
  //   parentElm&&parentElm.insertBefore(el, oldVnode.nextSibling); // 插入到下一个元素的前面去。
  //   parentElm&&parentElm.removeChild(oldVnode); // 删除老的节点
  //   return el;
  // }
}
export function createElm(vnode) {
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

function updateProperties(vnode, oldProps = {}) {
  // let newProps = vnode.data || {};// 新的属性

  let el = vnode.el;
  let newProps = vnode.data || {};

  // 老的有新的没有 需要删除属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key); // 移除真实dom的属性。
    }
  }

  // 样式处理  老的 style={color:red} 新的style={background:red};
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};

  //新的有，那就直接用新的做耿勋覆盖
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ""; // 移除真实dom的属性。
    }
  }

  // 老的样式中有 新的没有  删除老的样式

  for (let key in newProps) {
    if (key === "style") {
      // {color:red}
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      // el.className = el.class;
      el.className = newProps.class;
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

