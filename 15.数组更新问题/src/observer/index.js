import { arrayMethods } from "./array";
import { defineProperty } from "../util";
import Dep from './dep'
class Observer {
  constructor(value) {
    // 使用defineProperty重新定义
    // console.log(value)
    this.dep = new Dep(); // 15. value={}, value=[];一进来就增加一个dep
    // 抽取出去
    defineProperty(value, "__ob__", this);
    //  // 判断一个对象是否被观测过，看他是否有__ob__这个属性。
    //    Object.defineProperty(value, '__ob__', {
    //       enumerable: false,// 不能被枚举，不能被循环。就是不能进行再次递归。
    //       configurable: false,
    //       value: this
    //  })

    if (Array.isArray(value)) {
      // 使用AOP切片进行方法重写。
      value.__proto__ = arrayMethods;

      // 观测数组中的对象变化
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  observeArray(value) {
    value.forEach((item) => {
      observe(item); // 观测数组的对象。
    });
  }

  walk(data) {
    let keys = Object.keys(data); // 获取对象的key
    keys.forEach((key) => {
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
      if(Dep.target) { // 说明在渲染，让这个属性记住这个watcher
        dep.depend();
        if ( childDep) { // 15.
          // 默认给数组增加了一个dep属性，当对数组这个对象取值的时候
          childDep.dep.depend();// 数组存起来了这个渲染watcher
        }
      }
      console.log(dep.subs);
      return value;
    },
    set(newVal) { // 依赖更新
      if (newVal == value) return;
      observe(newVal); // 如果用户将值改成对象，递归设置。
      value = newVal;
      dep.notify(); // 异步更新动作，防止频繁操作
    },
  });
}
export function observe(data) {
  // console.log(data);
  if (data == null || typeof data !== "object") {
    return; // 15.
  }
  if (data.__ob__) return data;
  return new Observer(data);
}