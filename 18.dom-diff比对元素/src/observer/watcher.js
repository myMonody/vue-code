import { pushTarget, popTarget } from "./dep";
import { nextTick } from "../util";
let id = 0;
class Watcher {
  // exprOrFn vm._update(vm._render())
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.user = options.user; // 这是一个用户watcher
    this.isWatcher = typeof options === 'boolean';
    this.id = id++;
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
    }
    // this.get(); // 默认会调用get
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

    popTarget(this);
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
let pending = false;

// 刷新当前调用的队列
function flushSchedulerQueue() {
  queue.forEach((watcher) => {
    watcher.run();
    if (watcher.isWatcher) {
      watcher.cb();
    }
  });
  queue = []; // 清空watcher队列，为了下一次使用
  has = {}; // 清空标识的id
  pending = false; // pending还原
}

function queueWatcher(watcher) {
  const id = watcher.id; // 对watcher进行去重
  if (has[id] == null) {
    queue.push(watcher); // 并且将watcher存到队列中，
    has[id] = true;
  }
  if (!pending) {
    // 如果还没清空队列，就不要再开定时器了---防抖处理，多次调用只执行一次
    // 等待所有同步代码执行完毕之后再执行
    //  setTimeout(() => {
    //     queue.forEach(watcher => watcher.run());
    //     queue = [];// 清空watcher队列，为了下一次使用
    //     has = {};// 清空标识的id
    //     pending = false;// pending还原
    //  }, 0);
    nextTick(flushSchedulerQueue);
    pending = true;
  }
}
export default Watcher;

// 在数据劫持的时候 定义defineProperty的时候 已经给每一个属性都增加了一个dep

// 1,是想把这个渲染watcher 放到了Dep.target属性上
// 2,开始渲染 取值会调用get方法，需要让这个属性dep存储当前的watcher
// 3,页面上所需要的属性都会将这个watcher存在自己的dep中
// 4,等会属性更新了 就会重新调用渲染逻辑 通知自己存储的watcher来更新
// 一个实例只有一个watcher.
