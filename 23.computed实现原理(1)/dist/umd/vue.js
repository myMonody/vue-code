(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

   // 拿到数组原型上的方法---原来的方法
   let oldArrayProtoMethods = Array.prototype; // 继承一下 arrayMethods.__proto__ = oldArrayProtoMethods;

   let arrayMethods = Object.create(oldArrayProtoMethods);
   let methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']; // 在它上面进行方法的扩展

   methods.forEach(method => {
     arrayMethods[method] = function (...args) {
       // 15.当调用数组我们劫持后的这7个方法。页面应该更新
       // 15.我要知道数组对应的哪个dep;
       // 
       // console.log('数组方法调用了');
       // this就是observe中的value;
       let result = oldArrayProtoMethods[method].apply(this, args);
       let inserted;
       let ob = this.__ob__;

       switch (method) {
         case 'push':
         case 'unshift':
           // 这两种方法都是追加，追加的内容可能是对象，应该再次被劫持。
           inserted = args;
           break;

         case 'splice':
           // vue.$set原理。
           // 就是在第二个index位置进行新增一个，就是splice有3个参数模式
           inserted = args.slice(2);
       }

       if (inserted) ob.observeArray(inserted);
       ob.dep.notify(); // 通知数组更新。

       return result;
     };
   });

   function proxy(vm, data, key) {
     Object.defineProperty(vm, key, {
       // vm.a
       get() {
         return vm[data][key]; // vm._data.a;
       },

       set(newVal) {
         // vm.a = 100;
         vm[data][key] = newVal; // vm._data.a = 100;
       }

     });
   }
   function defineProperty(target, key, value) {
     // 判断一个对象是否被观测过，看他是否有__ob__这个属性。
     Object.defineProperty(target, key, {
       enumerable: false,
       // 不能被枚举，不能被循环。就是不能进行再次递归。
       configurable: false,
       value
     });
   }
   const LIFECYCLE_HOOKS = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"];
   const strats = {};

   function mergeHook(parentVal, childValue) {
     if (childValue) {
       if (parentVal) {
         return parentVal.concat(childValue);
       } else {
         return [childValue];
       }
     } else {
       return parentVal;
     }
   }

   strats.data = function (parentVal, childValue) {
     return childValue; // 这里应该有合并data的操作
   }; // 先注释掉合并
   // strats.computed = function () {};
   // strats.watch = function () {};


   LIFECYCLE_HOOKS.forEach(hook => {
     strats[hook] = mergeHook;
   });
   function mergeOptions(parent, child) {
     const options = {};

     for (let key in parent) {
       mergeField(key);
     }

     for (let key in child) {
       if (!parent.hasOwnProperty(key)) {
         mergeField(key);
       }
     }

     function mergeField(key) {
       if (strats[key]) {
         options[key] = strats[key](parent[key], child[key]);
       } else {
         if (typeof parent[key] == "object" && typeof child[key] == "object") {
           options[key] = { ...parent[key],
             ...child[key]
           };
         } else {
           options[key] = child[key];
         }
       }
     }

     console.log("---222222", options);
     return options;
   }
   let callbacks = [];
   let pending = false;

   function flushCallback() {
     //   callbacks.forEach((cb) => cb()); // 让nextTick中传入的方法依次执行。
     //   pending = false;// 标识已经执行完毕了
     //   callbacks = [];
     while (callbacks.length) {
       let cb = callbacks.pop();
       cb();
     }

     pending = false;
   }

   let timerFunc;

   if (Promise) {
     timerFunc = function () {
       Promise.resolve().then(flushCallback); // 异步处理更新。
     };
   } else if (MutationObserver) {
     // 可以监控dom的变化，监控完毕后是异步执行。
     let observe = new MutationObserver(flushCallback);
     let textNode = document.createTextNode(1); // 先创建一个文本节点

     observe.observe(textNode, {
       characterData: true
     }); // 观察他的数据。

     timerFunc = () => {
       textNode.textContent = 2; // 监控文本节点，异步更新之后变成2;
     };
   } else if (setImmediate) {
     timerFunc = () => {
       setImmediate(flushCallback);
     };
   } else {
     timerFunc = () => {
       setTimeout(flushCallback);
     };
   }

   function nextTick(cb) {
     // 因为内部会调用nextTick,用户也会调用，但是异步只需要执行一次。
     callbacks.push(cb); // vue3里的nextTick原理就是promise.then 没有做兼容处理了。

     if (!pending) {
       timerFunc();
       pending = true;
     } // Promise.resolve().then()

   } // export const LIFECYCLE_HOOKS = [
   //   "beforeCreate",
   //   "crated",
   //   "beforeMount",
   //   "mounted",
   //   "beforeUpdate",
   //   "updated",
   //   "beforeDestroy",
   //   "destroyed",
   // ];
   // // 定义一个策略对象
   // let strats = {};
   // strats.data = function () {};
   // strats.computed = function () {};
   // strats.watch = function () {};
   // // 生命周期的合并都在这个函数里。
   // function mergeHook(parentVal, childValue) {
   //   if (childValue) {
   //     if (parentVal) {
   //       return parentVal.concat(childValue);// 父子都有--数组拼接。
   //     } else {
   //       // 只有儿子--返回儿子数组。
   //       return [childValue];// {} {created:function(){}} // [created]
   //     }
   //   } else {
   //     return parentVal; // 不合并直接返回。采用父亲的。
   //   }
   // }
   // // 策略模式的好处--就是不再写一堆的if else if ...
   // LIFECYCLE_HOOKS.forEach((hook) => {
   //   strats[hook] = mergeHook;
   // });
   // export function mergeOptions(parent, child) {
   //   // 遍历父亲，可能是父亲有 儿子没有
   //   const options = {};
   //   // 父亲和儿子都有的在这里处理
   //   for (let key in parent) {
   //     mergeField(key);
   //   }
   //   // 儿子有父亲没有的在这里处理
   //   for (let key in child) {
   //     // 将儿子多的赋予到父亲上
   //     if (!parent.hasOwnProperty(key)) {
   //       mergeField(key);
   //     }
   //   }
   //   function mergeField(key) {
   //     // 合并字段
   //     // 根据key 不同的策略来进行合并。
   //     if (strats[key]) {
   //       // 如果有策略
   //      options[key] = strats[key](parent[key], child[key]);
   //     } else {
   //       // 如果没有策略--默认合并。
   //     }
   //   }
   //   // 儿子有 父亲没有
   //   return options;
   // }

   let id = 0;

   class Dep {
     constructor() {
       this.subs = [];
       this.id = id++;
     }

     depend() {
       // 我们希望watcher可以存放dep
       // !! 实现双向watcher,让watcher记住dep,同时让dep也记住watcher
       Dep.target.addDep(this); // this.subs.push(Dep.target);
     }

     addSub(watcher) {
       this.subs.push(watcher);
     }

     notify() {
       this.subs.forEach(watcher => {
         watcher.update();
       });
     }

   } // Dep.target是一个全局变量，挂载在window， 静态属性。


   Dep.target = null;
   function pushTarget(watcher) {
     Dep.target = watcher; // 保留watcher
   }
   function popTarget() {
     Dep.target = null; // 将变量删除。
   }
   // dep 可以存多个watcher vm.$watch('name');
   // 一个watcher可以对应多个dep

   class Observer {
     constructor(value) {
       // 使用defineProperty重新定义
       // console.log(value)
       this.dep = new Dep(); // 15. value={}, value=[];一进来就增加一个dep
       // 抽取出去

       defineProperty(value, "__ob__", this); //  // 判断一个对象是否被观测过，看他是否有__ob__这个属性。
       //    Object.defineProperty(value, '__ob__', {
       //       enumerable: false,// 不能被枚举，不能被循环。就是不能进行再次递归。
       //       configurable: false,
       //       value: this
       //  })

       if (Array.isArray(value)) {
         // 使用AOP切片进行方法重写。
         value.__proto__ = arrayMethods; // 观测数组中的对象变化

         this.observeArray(value);
       } else {
         this.walk(value);
       }
     }

     observeArray(value) {
       value.forEach(item => {
         observe(item); // 观测数组的对象。
       });
     }

     walk(data) {
       let keys = Object.keys(data); // 获取对象的key

       keys.forEach(key => {
         defineReactive(data, key, data[key]);
       });
     }

   }

   function defineReactive(data, key, value) {
     // 获取到数组对应的dep
     let childDep = observe(value);
     let dep = new Dep(); // 每一个属性都有一个dep;
     // 当页面取值的时候 说明这个值用来渲染了，将这个watcher和这个属性对应起来。

     Object.defineProperty(data, key, {
       get() {
         // 取值的时候是依赖收集
         if (Dep.target) {
           // 说明在渲染，让这个属性记住这个watcher
           dep.depend();

           if (childDep) {
             // 15.
             // 默认给数组增加了一个dep属性，当对数组这个对象取值的时候
             childDep.dep.depend(); // 数组存起来了这个渲染watcher
           }
         } // console.log(dep.subs);


         return value;
       },

       set(newVal) {
         // 依赖更新
         if (newVal == value) return;
         observe(newVal); // 如果用户将值改成对象，递归设置。

         value = newVal;
         dep.notify(); // 异步更新动作，防止频繁操作
       }

     });
   }

   function observe(data) {
     // console.log(data);
     if (data == null || typeof data !== "object") {
       return; // 15.
     }

     if (data.__ob__) return data;
     return new Observer(data);
   }

   let id$1 = 0;

   class Watcher {
     // exprOrFn vm._update(vm._render())
     constructor(vm, exprOrFn, cb, options) {
       this.vm = vm;
       this.exprOrFn = exprOrFn;
       this.cb = cb;
       this.options = options;
       this.user = options.user; // 这是一个用户watcher

       this.isWatcher = typeof options === 'boolean';
       this.id = id$1++;
       this.deps = []; // watcher记录有多少dep依赖

       this.depsId = new Set();

       if (typeof exprOrFn === "function") {
         this.getter = exprOrFn;
       } else {
         this.getter = function () {
           // exprOrFn传递过来的可能是一个字符串
           // 当去当前实例上去取值的时候 才会触发依赖收集。
           let path = exprOrFn.split(".");
           let obj = vm;

           for (let i = 0; i < path.length; i++) {
             obj = obj[path[i]]; // vm.a.a.a不停的去取值取值。
           }

           return obj;
         };
       } // this.get(); // 默认会调用get
       // 默认会先调用一次get方法---这样先拿到watch里面的数据值。
       // 调用get方法进行取值，把结果先保留下来。


       this.value = this.get(); // 默认会调用get
     }

     addDep(dep) {
       let id = dep.id;

       if (!this.depsId.has(id)) {
         this.deps.push(dep);
         this.depsId.add(id);
         dep.addSub(this);
       }
     }

     get() {
       pushTarget(this); // 当前watcher的实例。

       let result = this.getter(); // 默认调用exprOrFn ----》渲染页面(执行get方法) render方法 with(vm){_v(msg)}

       popTarget();
       return result;
     }

     run() {
       let newValue = this.get(); // 渲染逻辑

       let oldValue = this.value;
       this.value = newValue;

       if (this.user) {
         this.cb.call(this.vm, newValue, oldValue);
       }
     }

     update() {
       // 16.这里不要每次都调用get方法，get方法会重新渲染页面
       queueWatcher(this); // 先缓存watcehr
       //  this.get(); // 调用更新---重新渲染
     }

   }

   let queue = []; // 将需要批量更新的watcher存放到一个队列中，稍后让watcher执行

   let has = {};
   let pending$1 = false; // 刷新当前调用的队列

   function flushSchedulerQueue() {
     queue.forEach(watcher => {
       watcher.run();

       if (watcher.isWatcher) {
         watcher.cb();
       }
     });
     queue = []; // 清空watcher队列，为了下一次使用

     has = {}; // 清空标识的id

     pending$1 = false; // pending还原
   }

   function queueWatcher(watcher) {
     const id = watcher.id; // 对watcher进行去重

     if (has[id] == null) {
       queue.push(watcher); // 并且将watcher存到队列中，

       has[id] = true;
     }

     if (!pending$1) {
       // 如果还没清空队列，就不要再开定时器了---防抖处理，多次调用只执行一次
       // 等待所有同步代码执行完毕之后再执行
       //  setTimeout(() => {
       //     queue.forEach(watcher => watcher.run());
       //     queue = [];// 清空watcher队列，为了下一次使用
       //     has = {};// 清空标识的id
       //     pending = false;// pending还原
       //  }, 0);
       nextTick(flushSchedulerQueue);
       pending$1 = true;
     }
   }
   // 1,是想把这个渲染watcher 放到了Dep.target属性上
   // 2,开始渲染 取值会调用get方法，需要让这个属性dep存储当前的watcher
   // 3,页面上所需要的属性都会将这个watcher存在自己的dep中
   // 4,等会属性更新了 就会重新调用渲染逻辑 通知自己存储的watcher来更新
   // 一个实例只有一个watcher.

   function initState(vm) {
     // vm.$options
     // console.log(vm)
     const options = vm.$options; // 初始化数据的过程。

     if (options.props) ;

     if (options.methods) ;

     if (options.data) {
       initData(vm);
     }

     if (options.computed) ;

     if (options.watch) {
       initWatch(vm);
     }
   }

   function initData(vm) {
     // 数据的初始化---这里的数据可能是函数，也可能是属性。
     let data = vm.$options.data; //  console.log('---', data);
     // 如果是函数，this指向 vm

     /*
      data() {
         this  ---这里指向的就是vm当前实例。
         return {
         
         }
      }
      */
     // 将数据防止当vm上面，让vm可以拿到data

     vm._data = data = typeof data === "function" ? data.call(vm) : data; // 当我们去vm上取属性的时候，帮我将属性的取值代理到vm._data上去。

     for (let key in data) {
       proxy(vm, "_data", key);
     } // 数据的劫持方案---对象Object.defineProperty; 数组--单独处理


     observe(data);
   }

   function initWatch(vm) {
     // console.log('---',vm.watch);
     let watch = vm.$options.watch;

     for (let key in watch) {
       const handler = watch[key]; //handler可能是数组，字符串，对象，函数

       if (Array.isArray(handler)) {
         // 数组
         handler.forEach(handle => {
           createWatcher(vm, key, handle);
         });
       } else {
         // 字符串，对象，函数
         createWatcher(vm, key, handler);
       }
     }
   }

   function createWatcher(vm, exprOrFn, handler, options = {}) {
     // options可以用来表示是用户
     if (typeof handler === "object") {
       options = handler;
       handler = handler.handler; // 是一个函数
     }

     if (typeof handler === "string") {
       handler = vm[handler]; //将实例的方法作为handler
     } // key ,handler, option用户传递的选项。


     return vm.$watch(exprOrFn, handler, options); // immediate，async这些都是用户作为options传递的选项。
   }

   function stateMixin(Vue) {
     Vue.prototype.$nextTick = function (cb) {
       nextTick(cb);
     };

     Vue.prototype.$watch = function (exprOrFn, cb, options) {
       // 数据应该依赖这个watcher,数据变化后让watcher重新执行，
       let watcher = new Watcher(this, exprOrFn, cb, { ...options,
         user: true
       });

       if (options.immediate) {
         cb(); // 如果是immediate的时候立即执行。
       }
     };
   }

   // <div>hello{{name}}<span>world</span></div>
   // {
   //    tag: 'div',
   //       parent: null,
   //       type: 1,
   //       attrs: [],
   //       children: [{
   //          tag: null,
   //          parent: '父div',
   //          attrs: [],
   //          text:hello{{name}}
   //       }]
   // }
   const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名

   const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // ?:是找位置匹配

   const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名

   const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>

   const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

   const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
   function parseHTML(html) {
     function createASTElement(tagName, attrs) {
       return {
         tag: tagName,
         // 标签名
         type: 1,
         // 元素类型
         children: [],
         // 孩子列表
         attrs,
         // 属性集合
         parent: null // 父元素

       };
     }

     let root;
     let currentParent;
     let stack = []; // 标签是否是符合预期的，<div><spn></div> [] 使用栈结构来处理。[div,span]

     function start(tagName, attrs) {
       let element = createASTElement(tagName, attrs);

       if (!root) {
         root = element;
       }

       currentParent = element; // 保存当前解析的标签。

       stack.push(element); // 存入元素。
       // console.log(tagName, attrs, '----开始标签----')
     } // <div><p></p>hello</div> [div] currentParent = p


     function end(tagName) {
       // 在结尾标签树创建父子关系。
       // 结束的时候取出栈中的最后一个
       let element = stack.pop();
       currentParent = stack[stack.length - 1]; // 依次类推，取出一个，然后倒数一个来补位。

       if (currentParent) {
         // 在闭合的时候可以知道这个标签的父亲是谁。
         element.parent = currentParent;
         currentParent.children.push(element);
       } // console.log(tagName, '----结束标签---')

     } // 文本


     function chars(text) {
       text = text.replace(/\s/g, '');

       if (text) {
         currentParent.children.push({
           type: 3,
           text
         });
       } // console.log(text, '----文本标签----')

     }

     while (html) {
       // 只要不为空就一直执行。
       let textEnd = html.indexOf('<');

       if (textEnd === 0) {
         // v-bind
         // v-on
         // <!DOCTYPE
         // <!--->
         // <br/> 以上这些的处理，方式类似。
         // 肯定是标签了。
         // console.log('开始标签')
         const startTagMatch = parseStartTag(); // 开始标签匹配的结果。

         if (startTagMatch) {
           start(startTagMatch.tagName, startTagMatch.attrs);
           continue;
         } // 匹配结束标签


         const endTagMatch = html.match(endTag);

         if (endTagMatch) {
           advance(endTagMatch[0].length); // 结束标签删掉

           end(endTagMatch[1]); // 将结束标签传人。

           continue;
         } // console.log(html)
         // break

       } // 再往下走，可讷讷个是文本的。


       let text;

       if (textEnd >= 0) {
         text = html.substring(0, textEnd);
       }

       if (text) {
         advance(text.length); // 解析完了之后，删掉文本。

         chars(text); // console.log(html)
       }
     } // 将字符串进行截取操作，再更新html内容。


     function advance(n) {
       html = html.substring(n);
     }

     function parseStartTag() {
       const start = html.match(startTagOpen);

       if (start) {
         // console.log(start)
         const match = {
           tagName: start[1],
           attrs: []
         };
         advance(start[0].length); // 删除开始标签。
         // 如果直接是闭合标签，说明没有属性。

         let end;
         let attr; // 不是结尾标签，能匹配到属性。

         while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
           advance(attr[0].length);
           match.attrs.push({
             name: attr[1],
             value: attr[3] || attr[4] || attr[5]
           });
         }

         if (end) {
           // > 把当前的结尾去掉
           advance(end[0].length);
           return match;
         }
       }
     }

     return root; // 最后返回树。
   }

   // <div id="app" style="color:red">hello {{name}} <span>hello</span></div>

   /*
    render() {
      return _c('div,{id:'app',style:{color:'red}},_v('hello'+_s(name,null,_v('hello'))))
    }
   */
   const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

   function genProps(attrs) {
     let str = '';

     for (let i = 0; i < attrs.length; i++) {
       let attr = attrs[i];

       if (attr.name === 'style') {
         let obj = {}; // 对样式进行键值对特殊化处理。

         attr.value.split(';').forEach(item => {
           let [key, value] = item.split(':');
           obj[key] = value;
         });
         attr.value = obj;
       }

       str += `${attr.name}:${JSON.stringify(attr.value)},`;
     }

     return `{${str.slice(0, -1)}}`;
   }

   function gen(node) {
     if (node.type === 1) {
       return generate(node); // 生成元素节点的字符串
     } else {
       let text = node.text; // 获取文本
       // 如果是普通文本， 不带{{}}  _v(hello) v('hello'+_s(name,null,_v('hello'))

       if (!defaultTagRE.test(text)) {
         // 看文本是否支持大括号
         return `_v(${JSON.stringify(text)})`;
       }

       let tokens = []; // 存放每一段的代码

       let lastIndex = defaultTagRE.lastIndex = 0; // 如果正则是全局模式，使用前需要先设置为0；

       let match, index; // 每次匹配到的结果

       while (match = defaultTagRE.exec(text)) {
         index = match.index; // 保存匹配到的索引

         if (index > lastIndex) {
           tokens.push(JSON.stringify(text.slice(lastIndex, index)));
         }

         tokens.push(`_s(${match[1].trim()})`);
         lastIndex = index + match[0].length;
       }

       if (lastIndex < text.length) {
         tokens.push(JSON.stringify(text.slice(lastIndex)));
       }

       return `_v(${tokens.join('+')})`;
     }
   }

   function getChildren(el) {
     const children = el.children;

     if (children) {
       // 将所有转化后的儿子用逗号拼接起来。
       return children.map(child => gen(child)).join(',');
     }
   }

   function generate(el) {
     let children = getChildren(el); // 儿子生成的

     let code = `_c('${el.tag}',${el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`;
     return code;
   }

   function compilerToFunction(template) {
     // console.log(template); 虚拟dom是用对象来描述节点，不同于ast。
     // html模板---》render函数。 ast语法树。
     // 1,将html代码转化成ast语法树，可以用ast树来描述语言本身。
     // 前端必须要掌握的数据结构--树
     let ast = parseHTML(template); // console.log(ast)
     // return function () {}
     // 2,通过这棵树重新生成代码。 ast用来描述代码的。
     // 2, 优化静态节点
     // 3,生成树---将ast树重新生成代码。

     let code = generate(ast); // 4,第四步骤，将字符串转化为函数。
     // console.log(code); 
     // 限制取值范围，通过with来进行取值 稍后调用render函数可以通过改变this 让这个函数内部取到结果

     let render = new Function(`with(this){return ${code}}`); // console.log(render)

     return render;
   } // with这里是包裹变量。

   function patch(oldVnode, vnode) {
     // 默认初始化的时候， 是直接用虚拟节点创建出真实的节点来，替换老节点。
     if (oldVnode.nodeType === 1) {
       let el = createElm(vnode); // 产生真实的dom

       let parentElm = oldVnode.parentNode; // 然后塞进去新的节点

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
       } // 2,有可能是标签一样 <div>1</div>   <div>2</div>
       // 文本节点的虚拟节点tag都是undefined


       if (!oldVnode.tag) {
         // 文本的比较
         if (oldVnode.text !== vnode.text) {
           return oldVnode.el.textContent = vnode.text;
         }
       } // 标签一样，并且需要开始比对标签的属性和儿子。
       // 标签一样，最好复用。


       let el = vnode.el = oldVnode.el; // 复用老节点。
       // 更新属性，用新的虚拟节点的属性

       updateProperties(vnode, oldVnode.data); // 儿子比较

       /*
       1, 老的有儿子 新的没有儿子
       2，老的没有儿子，新的有儿子
       3，老的有儿子，新的有儿子----真正的diff算法。
       */

       let oldChildren = oldVnode.children || [];
       let newChildren = vnode.children || []; // 老的有儿子，新的也有儿子 diff

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
     } // 儿子之间的比较。


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
       // hash 映射表结构

       function makeIndexByKey(children) {
         let map = {};
         children.forEach((item, index) => {
           if (item.key) {
             map[item.key] = index; //{A:0,B:1,C:2,D:3}
           }
         });
         return map;
       }

       let map = makeIndexByKey(oldChildren); // 当首尾指针碰头的时候过程结束。老的和新的一起循环 || 一个true就继续， && 两个都得是true

       while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
         if (!oldStartVnode) {
           // 头指针指向了null--跳过这次处理。
           oldStartVnode = oldChildren[++oldStartIndex];
         } else if (!oldEndVnode) {
           // 尾指针指向了null
           oldEndVnode = oldChildren[--oldEndIndex]; // 跳过向前移动。
         } // 比较谁先循环完。有一个不满足了就结束了while循环。
         else if (isSameVnode(oldStartVnode, newStartVnode)) {
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
             patch(oldStartVnode, newEndVnode); // 将老的开头加点插入到，老的结尾节点的下一个元素的前面。

             parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
             oldStartVnode = oldChildren[++oldStartIndex];
             newEndVnode = newChildren[--newEndIndex];
           } else if (isSameVnode(oldEndVnode, newStartVnode)) {
             patch(oldEndVnode, newStartVnode);
             parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
             oldEndVnode = oldChildren[--oldEndIndex];
             newStartVnode = newChildren[++newStartIndex];
           } else {
             // 都不相等的情况---暴力对比--儿子之间没有关系
             let moveIndex = map[newStartVnode.key]; // 拿到开头的虚拟节点的key去老的中找。

             if (moveIndex == undefined) {
               // 不需要移动说明没有key复用的。
               // 将新的节点查到老的开始节点前面。
               parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
             } else {
               let moveVNode = oldChildren[moveIndex]; // 老的虚拟节点需要移动。

               oldChildren[moveIndex] = null; // 先把当前设置为空
               // 将moveVnode节点移动到老的开始节点位置前面。

               parent.insertBefore(moveVNode.el, oldStartVnode.el); // 自己比完了还要去比儿子。

               patch(moveVNode, newStartVnode); // 比较属性和儿子
             }

             newStartVnode = newChildren[++newStartIndex]; // 用新的不断去老的里面去找
           }
         /*
           为什么要加key,循环的时候为什么不能用index作为key
           index ---就像没有key一样。
         */

       } // 当到达重合条件的时候


       if (newStartIndex <= newEndIndex) {
         // 将多余的数据插入到parent中
         for (let i = newStartIndex; i <= newEndIndex; i++) {
           // 可能是向前添加，也可能是向后添加node
           // parent.appendChild(createElm(newChildren[i]));
           // 尾指针的下一个存不存在的问题，存在就是在头部前面插入，不存在就追加到后面
           // 向后插入 ele = null
           // 向前插入 ele 就是当前向谁前面插入
           let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el; // insertBefore兼有appendChild的功能。

           parent.insertBefore(createElm(newChildren[i]), ele);
         }
       } // 老的节点还要没有处理，说明这些节点就不需要了,如果这里面有null说明这节点已经被处理过了，跳过即可。


       if (oldStartIndex <= oldEndIndex) {
         for (let i = oldStartIndex; i <= oldEndIndex; i++) {
           let child = oldChildren[i];

           if (child !== undefined) {
             parent.removeChild(child.el);
           }
         }
       } // vue中的diff算法做了很多优化

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
     } // 将虚拟节点转化为真实节点---递归创建元素的过程
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
   function createElm(vnode) {
     let {
       tag,
       children,
       key,
       data,
       text
     } = vnode;

     if (typeof tag == "string") {
       // 创建元素 放到vnode.el上面去
       vnode.el = document.createElement(tag); // 只有元素才有属性--

       updateProperties(vnode); // 渲染children。将children塞到vnode的el上面去。

       children.forEach(child => {
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
     let newProps = vnode.data || {}; // 老的有新的没有 需要删除属性

     for (let key in oldProps) {
       if (!newProps[key]) {
         el.removeAttribute(key); // 移除真实dom的属性。
       }
     } // 样式处理  老的 style={color:red} 新的style={background:red};


     let newStyle = newProps.style || {};
     let oldStyle = oldProps.style || {}; //新的有，那就直接用新的做耿勋覆盖

     for (let key in oldStyle) {
       if (!newStyle[key]) {
         el.style[key] = ""; // 移除真实dom的属性。
       }
     } // 老的样式中有 新的没有  删除老的样式


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

   function lifecycleMixin(Vue) {
     Vue.prototype._update = function (vnode) {
       const vm = this;
       const prevVnode = vm._vnode; // 如果第一次_vnode不存在
       // 这里需要区分一下 到底首次渲染还是更新---

       if (!prevVnode) {
         // 用新的创建的元素，替换掉老的vm.$el
         vm.$el = patch(vm.$el, vnode);
       } else {
         // 拿上一次的vnode和 本次的vnode做对比。
         vm.$el = patch(prevVnode, vnode);
       }

       vm._vnode = vnode; // 保存vnode;
     };
   }
   function mountComponent(vm, el) {
     // 调用render方法去渲染 el属性。
     // 先调用render方法创建虚拟节点，在将虚拟节渲染到页面中去。
     // !!! 核心逻辑---是先调用render方法转化为虚拟dom，然后再调用update方法转化为真实的dom
     vm.$el = el;
     callHook(vm, "beforeMount");

     let updateComponent = () => {
       vm._update(vm._render());
     }; // !!!!!初始化的时候就会创建watcher
     // watcher是用于渲染，自动调动了updateComponent


     let watcher = new Watcher(vm, updateComponent, () => {
       callHook(vm, "beforeUpdate");
     }, true);
     /*
     setTimeout(() => {
       watcher.get()
     },2000)
     */
     // 要把属性和watcher绑定起来。

     callHook(vm, "mounted");
   }
   function callHook(vm, hook) {
     const handlers = vm.$options[hook];

     if (handlers) {
       for (let i = 0; i < handlers.length; i++) {
         handlers[i].call(vm);
       }
     }
   }

   function initMixin(Vue) {
     // 初始化方法。---
     Vue.prototype._init = function (options) {
       // console.log(options);
       // 吧options放到实例上去
       const vm = this; // vm.$options = options;
       // vm.constructor 当前实例的构造函数。

       vm.$options = mergeOptions(vm.constructor.options, options);
       console.log('===', vm.$options); // vue里面的核心特性-- 响应式数据原理。
       // 初始化状态---将数据进行一个初始化的劫持。当我们改变数据的时候应该更新视图。
       // vue组件中有很多状态--data props watch computed
       // initState(vm);
       // 初始化状态

       callHook(vm, 'beforeCreate');
       initState(vm);
       callHook(vm, 'created'); // (如果当前有el属性说明要渲染模板

       if (vm.$options.el) {
         vm.$mount(vm.$options.el);
       }
     };

     Vue.prototype.$mount = function (el) {
       // 做挂载操作的
       const vm = this;
       el = document.querySelector(el);
       vm.$el = el; // console.log(el);

       const options = vm.$options;

       if (!options.render) {
         // 没有render方法，将template转化为render方法。
         let template = options.template;

         if (!template && el) {
           // 如果没有template，有el,此时就是拿到所有的html结构了。
           template = el.outerHTML;
         } // console.log(template);
         // 然后要做的事件是---把我们的模板编译成render


         const render = compilerToFunction(template);
         options.render = render; // 拿到render后给到options，到处都可以拿到次render方法了
       } // 渲染的时候用的都是这个render方法
       // 需要挂载这个组件。


       mountComponent(vm, el);
     };
   }

   function renderMixin(Vue) {
     Vue.prototype._c = function () {
       // 创建元素
       return createElement(...arguments); // 创建虚拟dom
     };

     Vue.prototype._s = function (val) {
       // stringify
       return val == null ? '' : typeof val == 'object' ? JSON.stringify(val) : val;
     };

     Vue.prototype._v = function (text) {
       // 创建文本元素。
       return createTextVnode(text);
     };

     Vue.prototype._render = function () {
       const vm = this; // 调用我们之前的render方法。

       const render = vm.$options.render;
       let vnode = render.call(vm); //   console.log('===', vnode);

       return vnode;
     };
   }

   function createElement(tag, data = {}, ...children) {
     //   console.log(arguments)
     return vnode(tag, data, data.key, children);
   }

   function createTextVnode(text) {
     //   console.log(text, '----text')
     return vnode(undefined, undefined, undefined, undefined, text);
   } // 用来产生虚拟dom的


   function vnode(tag, data, key, children, text) {
     return {
       tag,
       data,
       key,
       children,
       text
     };
   }

   function initGlobalApi(Vue) {
     Vue.options = {}; // Vue.components Vue.directive

     Vue.mixin = function (mixin) {
       // console.log(mixin);
       // 合并对象， 先考虑生命周期---先不考虑其他的合并 data computed watch
       this.options = mergeOptions(this.options, mixin);
       console.log(this.options, '00000');
       return this;
     }; // Vue.options, options
     // 用户new Vue({created(){}})

   }

   // export  const fn = () => {

   function Vue(options) {
     //   console.log(options)
     this._init(options); // 入口方法，做初始化操作

   } // 写成一个个的插件，对原型进行扩展。


   initMixin(Vue);
   lifecycleMixin(Vue); // 混合生命周期  渲染--扩展的update方法。

   renderMixin(Vue); // 扩展的render方法

   stateMixin(Vue); // 原型上扩展一个更新state的方法

   initGlobalApi(Vue); // 静态方法--Vue.component,Vue.extend, Vue.directive,Vue.mixin...
   let vm1 = new Vue({
     data: {
       name: "zf"
     }
   }); // let render1 = compilerToFunction('<div id="a" class="a" style="color:red">{{name}}</div>')

   let render1 = compilerToFunction(`
  <div>
  <li data="a" style="background:red" key="a">A</li>
  <li data="b" style="background:blue" key="b">B</li>
  <li data="c" style="background:gray" key="c">C</li>
  <li data="d" style="background:purple" key="d">D</li>
  <li data="d" style="background:purple" key="f">F</li>
  </div>`);
   let vnode1 = render1.call(vm1);
   document.body.appendChild(createElm(vnode1)); // 创建真实的节点。

   let vm2 = new Vue({
     data: {
       name: "jw"
     }
   }); // let render2 = compilerToFunction(
   //   '<div id="b" class="a" style="background:blue">{{name}}</div>'
   // )

   /*
   观测之后，如果加了key,后面2个老节点复用不变，
   不加key的情况下，前面E-C都变化了，只有D复用了。进行diff的时候，默认了E和原来的A进行依次对比。
   */

   let render2 = compilerToFunction(`
  <div>
  <li style="background:skyblue" key="m">M</li>
  <li data="a" style="background:red" key="b">B</li>
  <li data="b" style="background:blue" key="a">A</li>
  <li data="c" style="background:gray" key="q">Q</li>
  </div>`);
   let vnode2 = render2.call(vm2); // document.body.appendChild(createElm(vnode2))
   // 执行patch比较，用新的虚拟节点对比老的虚拟节点，找到差异，去更新老的虚拟节点
   // patch(vnode1,vnode2); // 传入一个新的虚拟节点和老的对比。

   setTimeout(() => {
     patch(vnode1, vnode2); // 传入一个新的虚拟节点和老的对比。
   }, 1000);

   return Vue;

})));
//# sourceMappingURL=vue.js.map
