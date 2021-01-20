export function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    // vm.a
    get() {
      return vm[data][key]; // vm._data.a;
    },
    set(newVal) {
      // vm.a = 100;
      vm[data][key] = newVal; // vm._data.a = 100;
    },
  });
}
export function defineProperty(target, key, value) {
  // 判断一个对象是否被观测过，看他是否有__ob__这个属性。
  Object.defineProperty(target, key, {
    enumerable: false, // 不能被枚举，不能被循环。就是不能进行再次递归。
    configurable: false,
    value,
  });
}

export const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
]
const strats = {};
function mergeHook(parentVal, childValue) {
    if (childValue) {
        if (parentVal) {
            return parentVal.concat(childValue);
        } else {
            return [childValue]
        }
    } else {
        return parentVal;
    }
}
strats.data = function (parentVal, childValue) {
  return childValue;// 这里应该有合并data的操作
};
strats.computed = function () {};
strats.watch = function () {};
LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook
})
export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key)
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
            if (typeof parent[key] == 'object' && typeof child[key] == 'object') {
                options[key] = {
                    ...parent[key],
                    ...child[key]
                }
            }else{
                options[key] = child[key];
            }
        }
    }
  console.log('---222222',options)
    return options
}



// export const LIFECYCLE_HOOKS = [
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
