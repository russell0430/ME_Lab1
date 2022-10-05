import { Node, Parser, acceptFunction, NodeOrNull } from "../Types";
import { traverse } from "../Utils";
class DomTree {
  rootNode: Node | null = null;
  isInit: Boolean = false;
  public parser: Parser | null = null;

  public setParser(parser: Parser): void {
    this.parser = parser;
  }
  // parse file and get DomTree
  public init(): void {
    if (this.parser) {
      this.parser.parseContent();
      this.rootNode = this.parser.getContent();
    } else {
      this.rootNode = {
        type: 0,
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
  public display(node?: Node): void {
    const disNode = node || this.rootNode;
    if (!disNode) {
      console.log("can not display a null tree");
      return;
    }
    console.log("|");
    const dislplayFunc: acceptFunction = (node, children) => {
      if (node !== this.rootNode) {
        const prefix = " ".repeat((node.depth - 1) * 4) + "|---";
        console.log(prefix);
        const content =
          node.type === 0 ? node.title : `${node.title}@${node.link}`;
        console.log(`${" ".repeat(prefix.length)}${content}`);
      }
      return [node, children];
    };
    traverse(disNode, dislplayFunc);
  }
  // get a function and apply it on all nodes
  public accept(func: acceptFunction): void {
    if (this.rootNode) {
      this.rootNode = traverse(this.rootNode, func);
    } else {
      throw new Error(`rootNode not found`);
    }
  }

  public addNode({ type, args }: { type: 0 | 1; args: string[] }): void {
    // console.log(args);
    if (args.length === 1) {
      if (type === 0) {
        this.rootNode &&
          this.rootNode.children &&
          this.rootNode.children.push({
            type: 0,
            title: args[0],
            parent: this.rootNode,
            children: [],
            depth: 1,
            link: null,
          });
      } else {
        console.log("can not add bookmark without location");
      }
      return;
    }
    let searchAndAdd: acceptFunction;
    if (type === 0)
      searchAndAdd = (node, children) => {
        if (node.title === args[2]) {
          node.children != null &&
            node.children.push({
              type,
              title: args[0],
              parent: node,
              children: [],
              depth: node.depth + 1,
              link: null,
            });
        }
        return [node, node.children];
      };
    else {
      searchAndAdd = (node, children) => {
        if (node.title === args[2]) {
          const [title, link] = args[0].split("@");
          node.children != null &&
            node.children.push({
              type,
              title,
              parent: node,
              children: null,
              depth: node.depth + 1,
              link,
            });
        }
        return [node, node.children];
      };
    }
    this.accept(searchAndAdd);
  }
  public deleteNode({ type, args }: { type: 0 | 1; args: string[] }): void {
    if (!args || args.length === 0) {
      console.log("no params for delete ");
      return;
    }
    const searchAndDel: acceptFunction = (node, children) => {
      if (node.title === args[0] && type === node.type) {

        node.parent?.children?.splice(node.parent?.children?.indexOf(node), 1);
        // console.log(node.parent?.children);
        const nnode=this.rootNode;
        debugger;
        // console.log(this.rootNode);
        // debugger
        return [node, null];
      }
      return [node, node.children];
    };
    const nnode=this.rootNode;
    debugger;
    this.accept(searchAndDel);
  }
}

export { DomTree };
