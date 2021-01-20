export function proxy(vm, data, key) {
  Object.defineProperty(vm, key, { // vm.a
    get() {
      return vm[data][key]; // vm._data.a;
    },
    set(newVal) { // vm.a = 100;
      vm[data][key] = newVal; // vm._data.a = 100;
    }
  })
}
export function defineProperty(target,key,value) {
   // 判断一个对象是否被观测过，看他是否有__ob__这个属性。
     Object.defineProperty(target, key, {
        enumerable: false,// 不能被枚举，不能被循环。就是不能进行再次递归。
        configurable: false,
        value
   })
}
