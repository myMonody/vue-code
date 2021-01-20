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
       // 
       console.log('数组方法调用了'); // this就是observe中的value;

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

   class Observer {
     constructor(value) {
       // 使用defineProperty重新定义
       // console.log(value)
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
     observe(value);
     Object.defineProperty(data, key, {
       get() {
         return value;
       },

       set(newVal) {
         if (newVal == value) return;
         observe(newVal); // 如果用户将值改成对象，递归设置。

         value = newVal;
       }

     });
   }

   function observe(data) {
     // console.log(data);
     if (data == null || typeof data !== "object") {
       return data;
     }

     if (data.__ob__) return data;
     return new Observer(data);
   }

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

     if (options.watch) ;
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

   const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

   const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

   function start(tagName, attrs) {}

   function parseHTML(html) {
     while (html) {
       // 只要不为空就一直执行。
       let textEnd = html.indexOf('<');

       if (textEnd === 0) {
         // 肯定是标签了。
         // console.log('开始标签')
         const startTagMatch = parseStartTag(); // 开始标签匹配的结果。

         if (startTagMatch) {
           start(startTagMatch.tagName, startTagMatch.attrs);
         }

         console.log(html);
         break;
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
           match.attrs.push({
             name: attr[1],
             value: attr[3] || attr[4] || attr[5]
           }); // console.log(match)
           // 去掉当前属性

           advance(attr[0].length); //   break
         }

         if (end) {
           // > 把当前的结尾去掉
           advance(end[0].length);
           return match;
         }
       }
     }
   }

   function compilerToFunction(template) {
     // console.log(template); 虚拟dom是用对象来描述节点，不同于ast。
     // html模板---》render函数。 ast语法树。
     // 1,将html代码转化成ast语法树，可以用ast树来描述语言本身。
     // 前端必须要掌握的数据结构--树
     let ast = parseHTML(template); // 2,通过这棵树重新生成代码。 ast用来描述代码的。
   }

   function initMixin(Vue) {
     // 初始化方法。---
     Vue.prototype._init = function (options) {
       // console.log(options);
       // 吧options放到实例上去
       const vm = this;
       vm.$options = options; // vue里面的核心特性-- 响应式数据原理。
       // 初始化状态---将数据进行一个初始化的劫持。当我们改变数据的时候应该更新视图。
       // vue组件中有很多状态--data props watch computed

       initState(vm); // (如果当前有el属性说明要渲染模板

       if (vm.$options.el) {
         vm.$mount(vm.$options.el);
       }
     };

     Vue.prototype.$mount = function (el) {
       // 做挂载操作的
       const vm = this;
       el = document.querySelector(el); // console.log(el);

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
       }
     };
   }

   // export  const fn = () => {

   function Vue(options) {
     //   console.log(options)
     this._init(options); // 入口方法，做初始化操作

   } // 写成一个个的插件，对原型进行扩展。


   initMixin(Vue);

   return Vue;

})));
//# sourceMappingURL=vue.js.map
