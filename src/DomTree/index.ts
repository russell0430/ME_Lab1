import { Node, Parser, AcceptFunction, NodeOrNull } from "../Types";
import { traverse } from "../Utils";
type Action = "add" | "del"

class DomTree {
  rootNode: NodeOrNull = null;
  isInit: Boolean = false;
  public parser: Parser | null = null;
  // 只有domtree才能记住操作的元素,
  historyAction: [parent: Node, child: Node, action: Action][] = []
  historyActionPointer = -1;
  /**
   * Init should called by yourself 
   * @params {Parser} parser
   * @public 
  */
  public setParser(parser: Parser): void {
    this.parser = parser;
  }

  /**
   * parse file and get DomTree
   * @public 
   */
  public init(filePath?: string): void {
    if (this.parser && filePath) {
      this.parser.parseContent(filePath);
      this.rootNode = this.parser.getContent();
    } else {
      this.rootNode = {
        type: -1,
        depth: 0,
        title: "rootNode",
        link: null,
        parent: null,
        children: [],
      };
    }
    this.isInit = true;
  }
  build(): this {
    return this;
  }

  // need to upgrade!
  /**
   * display tree from node
   * @param {Node?}node 
   * @returns 
   */
  public display(node?: Node): void {
    const disNode = node || this.rootNode;
    if (!disNode) {
      console.log("can not display a null tree");
      return;
    }
    const displayRootNodeDepth = disNode.depth
    if (disNode === this.rootNode) console.log("root")
    const dislplayFunc: AcceptFunction = (node, children) => {
      if (node !== this.rootNode) {
        const prefix = " ".repeat((node.depth - displayRootNodeDepth) * 4) + "|---";
        console.log(prefix);
        const content =
          node.type === 0 ? node.title : `${node.title}@${node.link}${node.visited ? '[*]' : ''}`;
        console.log(`${" ".repeat(prefix.length)}${content}`);
      }
      return [node, children];
    };
    traverse(disNode, dislplayFunc);
  }

  // get a function and apply it on all nodes
  /**
   * 
   * @param func 
   * @returns {void}
   */
  public accept(func: AcceptFunction): void {
    if (this.rootNode) {
      this.rootNode = traverse(this.rootNode, func);
    } else {
      throw new Error(`rootNode not found`);
    }
  }
  /**
   * 
   * @param param0 {
   *  type:node的类型,branch or leaf
   *  args :[title "at" location ] || [title] 
   * }
   * @returns 
   */
  public addNode({ type, args }: { type: 0 | 1; args: string[] }): Boolean {
    // 参数只有一个,认为是branch在根文件
    let parent: Node, child: Node
    if (args.length === 1) {
      if (type === 0 && this.rootNode?.children) {
        parent = this.rootNode
        this.rootNode.children.push(child = {
          type: 0,
          title: args[0],
          parent: this.rootNode,
          children: [],
          depth: 1,
          link: null,
        });
        this.refreshHistoryAction(parent, child, "add");
        return true;
      } else {
        console.log("can not add bookmark without location");
        return false;
      }
    }
    let searchAndAdd: AcceptFunction, res: Boolean = false;
    if (type === 0)
      searchAndAdd = (node, children) => {
        if (node.title === args[2] && node.children) {
          parent = node, res = true
          node.children.push(child = {
            type,
            title: args[0],
            parent: node,
            children: [],
            depth: node.depth + 1,
            link: null,
          });
          this.refreshHistoryAction(parent, child, 'add')
        }
        return [node, node.children];
      };
    else {
      searchAndAdd = (node, children) => {
        if (node.title === args[2]) {
          const [title, link] = args[0].split("@");
          if (node.children != null) {
            parent = node, res = true
            node.children.push(child = {
              type,
              title,
              parent: node,
              children: null,
              depth: node.depth + 1,
              link,
            });
            this.refreshHistoryAction(parent, child, "add")
          }
        }
        return [node, node.children];
      };
    }
    this.accept(searchAndAdd);
    return res;
  }


  /**
   * @params {{
   *  type:0|1 , // 删除 书签|分级标题
   *  args:string[]}} // 参数
   */
  public deleteNode({ type, args }: { type: 0 | 1; args: string[] }): Boolean {
    if (!args || args.length === 0) {
      console.log("no params for delete ");
      return false;
    }
    let res = false, parent: Node, child: Node;
    // looks a little ugly :)
    const searchAndDel: AcceptFunction = (node, children) => {
      if (node.title === args[0] && type === node.type) {
        //
        parent = node.parent as Node, child = node
        this.refreshHistoryAction(parent, child, "del")
        // you need to do two actions below to tell
        // the traverse you want to delete node

        // 1.
        node.parent?.children?.splice(node.parent?.children?.indexOf(node), 1);
        // 2.
        node.parent = null;
        // tell the traverse
        // no need to traverse node`s children
        res = true;
        // 这里有两种处理,但都有一定问题
        // 1. return [node,null]
        //    可以减少计算量,但是有严重bug
        //    会使undo的时候children消失
        // 2. return [node,children]
        //    计算量变大,孩子应该被删除,但是还是会继续遍历
        return [node, children];
      }
      return [node, node.children];
    };
    // const nnode = this.rootNode;
    this.accept(searchAndDel);
    return res
  }

  /**
   * 
   * @param param0 
   * @returns 
   */
  searchNode({ type, title }: { type: number, title: string }): NodeOrNull {
    let resNode: NodeOrNull = null;
    const acceptFunc: AcceptFunction = (node, children) => {
      if (node.title === title && type === node.type) {
        resNode = node;
      }
      return [node, children];
    }
    this.accept(acceptFunc);
    return resNode;
  }

  undo() {
    if (this.historyActionPointer >= this.historyAction.length) {
      return
    }
    const [parent, child, action] = this.historyAction[this.historyActionPointer];
    this.historyActionPointer--
    if (action === "add") {
      parent.children = parent.children?.filter(node => node !== child) || []
    } else {
      parent.children = [...parent.children || [], child]
    }
  }

  redo() {
    if (this.historyActionPointer >= this.historyAction.length) {
      return
    }
    const [parent, child, action] = this.historyAction[this.historyActionPointer + 1];
    this.historyActionPointer--
    if (action === "add") {
      parent.children = [...parent.children || [], child]
    } else {
      parent.children = parent.children?.filter(node => node !== child) || []
    }

  }
  /**
  * @private
  */
  refreshHistoryAction(parent: Node, child: Node, action: Action) {
    this.historyAction = this.historyAction.slice(0, this.historyActionPointer + 1)
    this.historyAction.push([parent, child, action])
    this.historyActionPointer = this.historyAction.length - 1
  }
}

export { DomTree };
