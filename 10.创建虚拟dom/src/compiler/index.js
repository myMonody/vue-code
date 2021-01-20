import { parseHTML } from './parse'
import { generate } from './generate'
export function compilerToFunction (template) {
  // console.log(template); 虚拟dom是用对象来描述节点，不同于ast。
  // html模板---》render函数。 ast语法树。
  // 1,将html代码转化成ast语法树，可以用ast树来描述语言本身。

  // 前端必须要掌握的数据结构--树
  let ast = parseHTML(template)
  console.log(ast)
  // return function () {}
  // 2,通过这棵树重新生成代码。 ast用来描述代码的。

  // 2, 优化静态节点

  // 3,生成树---将ast树重新生成代码。
  let code = generate(ast)

  // 4,第四步骤，将字符串转化为函数。
  // console.log(code); 
  // 限制取值范围，通过with来进行取值 稍后调用render函数可以通过改变this 让这个函数内部取到结果
  let render = new Function(`with(this){return ${code}}`)
  // console.log(render)
  return render
}
// with这里是包裹变量。
