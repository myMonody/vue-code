import {arrayMethods} from './array'
class Observer {
  constructor(value) {
    // 使用defineProperty重新定义
    // console.log(value)
     
   // 判断一个对象是否被观测过，看他是否有__ob__这个属性。
     Object.defineProperty(value, '__ob__', {
        enumerable: false,// 不能被枚举，不能被循环。就是不能进行再次递归。
        configurable: false,
        value: this
   })
     
     
     
     if (Array.isArray(value)) {
       // 使用AOP切片进行方法重写。
        value.__proto__ = arrayMethods

        // 观测数组中的对象变化
        this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
   
   observeArray(value) {
      value.forEach(item => {
         observe(item);// 观测数组的对象。
      })
   }
   
   
  walk(data) {
    let keys = Object.keys(data); // 获取对象的key
    keys.forEach((key) => {
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
    },
  });
}
export function observe(data) {
  // console.log(data);
  if (data == null || typeof data !== "object") {
    return data;
  }
   if (data.__ob__) return data;
  return new Observer(data);
}
