// <div>hello{{name}}<span>world</span></div>

// {
//    tag: 'div',
//       parent: null,
//       type: 1,
//       attrs: [],
//       children: [{
//          tag: null,
//          parent: '父div',
//          attrs: [],
//          text:hello{{name}}
//       }]
// }
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // ?:是找位置匹配
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function start (tagName, attrs) {}
function end (tagName) {}
// 文本
function chars (text) {}
function parseHTML (html) {
  while (html) {
    // 只要不为空就一直执行。
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      // 肯定是标签了。
      // console.log('开始标签')
       const startTagMatch = parseStartTag() // 开始标签匹配的结果。
       
       if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
       }
       console.log(html)
      // break
    }
  }
  // 将字符串进行截取操作，再更新html内容。
  function advance (n) {
    html = html.substring(n)
  }
  function parseStartTag () {
    const start = html.match(startTagOpen)
    if (start) {
      // console.log(start)
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length); // 删除开始标签。
      // 如果直接是闭合标签，说明没有属性。
      let end
      let attr
      // 不是结尾标签，能匹配到属性。
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
        // console.log(match)
        // 去掉当前属性
        advance(attr[0].length)
      //   break
      }
      if (end) { // > 把当前的结尾去掉
        advance(end[0].length)
        return match
      }
    }
  }
}

export function compilerToFunction (template) {
  // console.log(template); 虚拟dom是用对象来描述节点，不同于ast。
  // html模板---》render函数。 ast语法树。
  // 1,将html代码转化成ast语法树，可以用ast树来描述语言本身。

  // 前端必须要掌握的数据结构--树
  let ast = parseHTML(template)

// 2,通过这棵树重新生成代码。 ast用来描述代码的。
}
