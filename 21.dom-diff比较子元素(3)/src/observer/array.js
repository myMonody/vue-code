// 拿到数组原型上的方法---原来的方法
let oldArrayProtoMethods = Array.prototype;

// 继承一下 arrayMethods.__proto__ = oldArrayProtoMethods;
export let arrayMethods = Object.create(oldArrayProtoMethods);


let methods = [
   'push',
   'pop',
   'shift',
   'unshift',
   'sort',
   'reverse',
   'splice'
]
// 在它上面进行方法的扩展
methods.forEach(method => {
   arrayMethods[method] = function (...args) {
     
      // 15.当调用数组我们劫持后的这7个方法。页面应该更新
      // 15.我要知道数组对应的哪个dep;



      // 
      // console.log('数组方法调用了');
      // this就是observe中的value;
      let result = oldArrayProtoMethods[method].apply(this, args);
      let inserted;
      let ob = this.__ob__;
      switch (method) {
         case 'push': 
         case 'unshift': // 这两种方法都是追加，追加的内容可能是对象，应该再次被劫持。
            inserted = args;
            break;
         case 'splice': // vue.$set原理。
            // 就是在第二个index位置进行新增一个，就是splice有3个参数模式
            inserted = args.slice(2); // arr.splice(0,1,{a:1});
         default:
            break;   
      }
      if (inserted) ob.observeArray(inserted);
      ob.dep.notify(); // 通知数组更新。
      return result;
   }
})
