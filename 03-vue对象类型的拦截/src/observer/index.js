class Observer{
   constructor(value) {
      // 使用defineProperty重新定义
      // console.log(value)
      this.walk(value);
   }
   walk(data) {
      let keys = Object.keys(data);// 获取对象的key
      keys.forEach(key => {
         defineReactive(data, key, data[key]);
      })
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
         observe(newVal);// 如果用户将值改成对象，递归设置。
         value = newVal;
      }
   })
}
export function observe(data) {
   // console.log(data);
   if (data == null || typeof data !== 'object') {
      return;
   }
   return new Observer(data);
}