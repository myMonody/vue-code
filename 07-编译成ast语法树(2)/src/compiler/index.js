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
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function parseHTML(html) {
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName, // 标签名
      type: 1, // 元素类型
      children: [], // 孩子列表
      attrs, // 属性集合
      parent: null, // 父元素
    };
  }
  let root;
  let currentParent;
  let stack = [];
  // 标签是否是符合预期的，<div><spn></div> [] 使用栈结构来处理。[div,span]
  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentParent = element; // 保存当前解析的标签。
    stack.push(element);// 存入元素。
    console.log(tagName, attrs, "----开始标签----");
  }
  // <div><p></p>hello</div> [div] currentParent = p;
  function end(tagName) { // 在结尾标签树创建父子关系。
    // 结束的时候取出栈中的最后一个
    let element = stack.pop(); 
    currentParent = stack[stack.length - 1];// 依次类推，取出一个，然后倒数一个来补位。
    if (currentParent) { // 在闭合的时候可以知道这个标签的父亲是谁。
      element.parent = currentParent;
      currentParent.children.push(element);
    }
    console.log(tagName, "----结束标签---");
  }
  // 文本
  function chars(text) {
    text = text.replace(/\s/g, '');
    if (text) {
      currentParent.children.push({
        type: 3,
        text
      })
    }
    console.log(text, "----文本标签----");
  }
  while (html) {
    // 只要不为空就一直执行。
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      // v-bind
      // v-on
      // <!DOCTYPE
      // <!--->
      // <br/> 以上这些的处理，方式类似。
      // 肯定是标签了。
      // console.log('开始标签')
      const startTagMatch = parseStartTag(); // 开始标签匹配的结果。
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      // 匹配结束标签
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length); // 结束标签删掉
        end(endTagMatch[1]); // 将结束标签传人。
        continue;
      }
      // console.log(html)
      // break
    }
    // 再往下走，可讷讷个是文本的。
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length); // 解析完了之后，删掉文本。
      chars(text);
      // console.log(html);
    }
  }
  // 将字符串进行截取操作，再更新html内容。
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      // console.log(start)
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length); // 删除开始标签。
      // 如果直接是闭合标签，说明没有属性。
      let end;
      let attr;
      // 不是结尾标签，能匹配到属性。
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
      }
      if (end) {
        // > 把当前的结尾去掉
        advance(end[0].length);
        return match;
      }
    }
  }
  return root; // 最后返回树。
}

export function compilerToFunction(template) {
  // console.log(template); 虚拟dom是用对象来描述节点，不同于ast。
  // html模板---》render函数。 ast语法树。
  // 1,将html代码转化成ast语法树，可以用ast树来描述语言本身。

  // 前端必须要掌握的数据结构--树
  let ast = parseHTML(template);
  console.log(ast);
  // return function () {};
  // 2,通过这棵树重新生成代码。 ast用来描述代码的。
}
