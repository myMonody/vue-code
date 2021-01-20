import { observe } from "./observer/index";
import Watcher from "./observer/watcher";
import { nextTick, proxy } from "./util";
export function initState(vm) {
  // vm.$options
  // console.log(vm)
  const options = vm.$options;

  // 初始化数据的过程。
  if (options.props) {
    initProps(vm);
  }
  if (options.methods) {
    initMethods(vm);
  }
  if (options.data) {
    initData(vm);
  }
  if (options.computed) {
    initComputed(vm);
  }
  if (options.watch) {
    initWatch(vm);
  }
}
function initProps() {}
function initMethods() {}

function initData(vm) {
  // 数据的初始化---这里的数据可能是函数，也可能是属性。
  let data = vm.$options.data;
  //  console.log('---', data);
  // 如果是函数，this指向 vm
  /*
   data() {
      this  ---这里指向的就是vm当前实例。
      return {
      
      }
   }
   */
  // 将数据防止当vm上面，让vm可以拿到data

  vm._data = data = typeof data === "function" ? data.call(vm) : data;

  // 当我们去vm上取属性的时候，帮我将属性的取值代理到vm._data上去。
  for (let key in data) {
    proxy(vm, "_data", key);
  }

  // 数据的劫持方案---对象Object.defineProperty; 数组--单独处理
  observe(data);
}
function initComputed() {}
function initWatch(vm) {
  // console.log('---',vm.watch);
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; //handler可能是数组，字符串，对象，函数
    if (Array.isArray(handler)) {
      // 数组
      handler.forEach((handle) => {
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
  }

  // key ,handler, option用户传递的选项。
  return vm.$watch(exprOrFn, handler, options); // immediate，async这些都是用户作为options传递的选项。
}

export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  };
  Vue.prototype.$watch = function(exprOrFn, cb, options) {
    // 数据应该依赖这个watcher,数据变化后让watcher重新执行，
     let watcher = new Watcher(this,exprOrFn, cb, {...options,user:true});
     if (options.immediate) {
       cb(); // 如果是immediate的时候立即执行。
     }
  }
}
