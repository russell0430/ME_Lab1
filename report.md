ME_LAB1

编程语言:typescript

## 模型

### Node

```typescript
interface Node {
  depth: number;
  children: Node[] | null;
  parent: Node | null;
  title: string | null;
  link: string | null;
  // -1 => root
  // 0 => not leaf
  // 1 => leaf
  type: -1 | 0 | 1;
  // visited times
  visited?:Boolean
}
```

使用`Node`作为节点,标签和链接通过`type`区分

书签栏使用`Node`格式作为树进行存储,这样只需要`rootNode`就可以获得书签栏所有的`Node`

### Tree

tree是管理书签栏的模型,拥有一个树的根节点以及`Parser`实例,tree模型可以调用实例中的`parseContent`,以及`getContent`,获取到解析后的树的根节点

以下是类的变量

- `parser`是一个抽象类,其中需要实现`parseContent`,`getContent`,`writeContent`方法.可以读取不同类型的文件

tree可以对书签栏的树进行一些操作,以下是函数

- `setParser`,设置Parser,之后可以使用`this.parser.parserContent()`,`this.parser.getContent()`获取解析后的树的根节点
- `init`,在获得解析器后,解析获得rootNode或者初始化一个空的rootNode
- `accept`,获得一个参数,从rootNode上所有的node上使用
- `display`,通过`accept`函数,展示相关的树结构
- `addNode`,通过`accept`函数按照要求增加一个节点
- `deleteNode`,通过`accept`函数按照要求删除一个节点
- `searchNode`,通过`accept`函数找到相关节点

### MarkdownParser

`MarkdownParsers`是`Parser`抽象类的一个实现,用于解析Markdown文件,实现了`parseContent`,`getContent`,`writeContent`

### CAC

与命令行交互的类,可以通过创建的实例来监听输入,注册命令,获得执行的命令栈为`undo`,`redo`提供便利

以下是类中的变量

- `commandMap`,记录注册的命令和实现的函数的映射
- `commandStack`,记录执行命令的历史

以下是方法

- `registerCommand`,接受一个命令和一个函数,接受到相关命令后执行对应的函数
- `run`,开始监听,获得命令以及参数并且执行
- `getLastCommand`,获得上次的命令
- `undo`,执行`undo`,修改`commandStack`状态
- `redo`,执行`redo`,修改`commandStack`状态

## 模式

### visitor模式

对于树结构的遍历,使用`visitor`模式,树结构可以接受一个特定的函数,并且能够在树结构上遍历所有节点执行,

`accept`方法是`DomTree`上的公共方法

```typescript
  public accept(func: AcceptFunction): void {
    if (this.rootNode) {
      this.rootNode = traverse(this.rootNode, func);
    } else {
      throw new Error(`rootNode not found`);
    }
  }
 
```

`traverse`函数是一种先序遍历,首先处理当前节点,并且遍历所有的子节点递归

```typescript
type AcceptFunction = (
  node: Node,
  children: Node[] | null
) => [Node, Node[] | null];

function traverse(node: Node, func: AcceptFunction): Node {
  const [newNode, children] = func(node, node.children);
  newNode.children =
    children
      ?.map((child) => traverse(child, func))
      // told to delete the node which parent is null
      // get tortured for several hours
      // fix the bug delete not work
      // a little ugly :(
      .filter((node) => node.parent != null) || null;
  return newNode;
}
```

使用`accept`函数时,需要定义一个新的函数,这个函数将在所有节点上运行,下面的代码是找寻相关符合条件的节点的函数

```typescript
let resNode: NodeOrNull = null;
const acceptFunc: AcceptFunction = (node, children) => {
  if (node.title === title && type === node.type) {
    resNode = node;
  }
  return [node, children];
}
this.accept(acceptFunc);
```

这样我们就可以将重点放在`node`的相关逻辑上,遍历等操作由Domtree实现

### Observer模式

在`DomTree`类中,有一个抽象类变量parser.

Parser抽象类有三个虚函数

- parseContent
- getContnet
- writeContent

这样在`Domtree`中可以直接通过`this.parser.parseContent()||this.parser.getContent()`获得`rootNode`,可以通过`writeContent`写回文件.

一个类只需要实现上面三个方法就可以作为`Parser`,可以解析不同类型的文件,代码中只实现了Markdown文件的解析与写回

```typescript
class MarkdownParser extends Parser {
  rootNode: NodeOrNull = null;

  constructor(private filePath: string) {
    super();
  }

  public parseContent(): void {
    if (!fs.existsSync(this.filePath))
      throw new Error(`${this.filePath} does not exist!`);
    const sentences = fs
      .readFileSync(this.filePath, "utf-8")
      // 这里似乎是 '\r\n'
      .split("\r\n")
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence !== "");
    this.process(sentences);
  }

  public getContent(): Node {
    if(!this.rootNode){
      throw new Error('no content find');
    }
    return this.rootNode;
  }

  // 将文件写回markdown

  public writeContent(filePath: string): void {
    if (!this.rootNode) {
      throw new Error("no rootNode detected");
    }
    let writePath = compose<String>(writeFile);
    const write = writePath(filePath);
    function writeFunc(
      node: Node,
      children: Node[] | null
    ): [Node, Node[] | null] {
      if (node.type === 0) {
        write(`${"#".repeat(node.depth)} ${node.title}`);
        // write 自动换行
      } else if (node.type === 1) {
        write(`[${node.title}](${node.link})`);
      }
      return [node, children];
    }
    traverse(this.rootNode, writeFunc);
    write();
  }
  
  private process(sentences: string[]): void {
    /// ....
  }
}
```

### 命令模式

将命令的管理和具体的操作分开,命令类只关心命令的管理,与实际执行的操作无关,使用一个Map映射

```typescript
import { CommandFunction, CommandMap } from "./types";


class CAC {
  public options;
  commandMap: CommandMap = Object.create(null);
  commandStack: [string, string[]][] = [];

  constructor(options = {}) {
    this.options = options;
  }

  public registerCommand(
    command: string,
    callbackFunction: CommandFunction
  ): void {
    this.commandMap[command] = callbackFunction;
  }

  run(): void {
    const stdin = process.openStdin();
    const processInput = (data: { toString: () => string }) => {
      const [command, ...args] = data.toString().trim().split(" ");
      console.log(command);
      if (!this.commandMap[command]) {
        console.log(`no such command !\n read ${command}`);
        return;
      } else {
        try {
          this.commandMap[command](...args);
          this.commandStack.push([command, args]);
          // pluginApi for undo&redo
        } catch (error) {
          console.log("oops ! something went wrong!");
          console.log(error);
        }
      }
    };
    stdin.addListener("data", processInput);
  }

  getLastCommand(): { command: string; args: string[] } {
    const lastCommand = this.commandStack[this.commandStack.length - 1];
    if (!lastCommand) {
      console.log("no command execute before!");
      return {
        command: "",
        args: [],
      };
    } else {
      return {
        command: lastCommand[0],
        args: lastCommand[1],
      };
    }
  }

  undo(): Boolean {
    if (this.commandStack.length > 0) {
      this.commandStack.pop();
      return true;
    } else return false;
  }

  redo(command: string, args: string[]): Boolean {
    this.commandStack.push([command, args]);
    return true;
  }
}

export { CAC };

```

可以使用`CAC.register`注册函数

```typescript
function registerCommand(cac: CAC, tree: DomTree): void {
  cac.registerCommand("test", () => {
    console.log("i am testing command");
  });
  cac.registerCommand("add-title", (...args: string[]) => {
    tree.addNode({ type: 0, args });
  });
  cac.registerCommand("add-bookmark", (...args: string[]) => {
    tree.addNode({ type: 1, args });
  });

  cac.registerCommand("delete-title", (...args: string[]) => {
    tree.deleteNode({ type: 0, args });
  });

  cac.registerCommand("delete-bookmark", (...args: string[]) => {
    tree.deleteNode({ type: 1, args });
  });
  // ...
}
```

