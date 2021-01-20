import { observe } from "./observer/index";
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
  data = typeof data === "function" ? data.call(vm) : data;

  // 数据的劫持方案---对象Object.defineProperty; 数组--单独处理
  observe(data);
}
function initComputed() {}
function initWatch() {}
