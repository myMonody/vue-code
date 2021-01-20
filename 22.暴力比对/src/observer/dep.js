let id = 0;
class Dep {
  constructor() {
    this.subs = [];
    this.id = id++;
  }
  depend() {
    // 我们希望watcher可以存放dep
    // !! 实现双向watcher,让watcher记住dep,同时让dep也记住watcher
    Dep.target.addDep(this);
    // this.subs.push(Dep.target);
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach((watcher) => {
      watcher.update();
    });
  }
}

// Dep.target是一个全局变量，挂载在window， 静态属性。
Dep.target = null;
export function pushTarget(watcher) {
  Dep.target = watcher; // 保留watcher
}

export function popTarget() {
  Dep.target = null; // 将变量删除。
}

export default Dep;

// 多对多的关系-- 一个属性有一个dep是用来收集watcher的，
// dep 可以存多个watcher vm.$watch('name');
// 一个watcher可以对应多个dep
