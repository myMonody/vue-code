(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

   function observe(data) {
     console.log(data);
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
     let data = vm.$options.data;
     console.log('---', data); // 如果是函数，this指向 vm

     /*
      data() {
         this  ---这里指向的就是vm当前实例。
         return {
         
         }
      }
      */

     data = typeof data === "function" ? data.call(vm) : data; // 数据的劫持方案---对象Object.defineProperty; 数组--单独处理

     observe(data);
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

       initState(vm);
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
