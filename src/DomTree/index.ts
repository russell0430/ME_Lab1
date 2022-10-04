import { Node, Parser, acceptFunction, NodeOrNull } from "../Types";
import { traverse } from "../Utils";
class DomTree {
  rootNode: Node | null = null;
  public parser: Parser | null = null;

  public setParser(parser: Parser): void {
    this.parser = parser;
  }
  // parse file and get DomTree
  public process(): void {
    if (this.parser) {
      this.parser.parseContent();
      this.rootNode = this.parser.getContent();
    } else {
      console.log(`no parser provided!`);
    }
  }

  build(): this {
    return this;
  }

  public addTitle(param: string): this {
    let args: string[];
    if (param.includes("at")) {
      args = param.split("at").map((arg) => arg.trim());
    } else {
      args = [param];
    }
    let flag = false;
    if (args.length === 1) {
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
      return this;
    }
    const searchAndAdd: acceptFunction = (node, children) => {
      if (node.title === args[0]) {
        node.children &&
          node.children.push({
            type: 1,
            title: args[0],
            parent: node,
            children: null,
            depth: node.depth + 1,
            link: args[1],
          });
      }
      return [node, null];
    };
    this.accept(searchAndAdd);
    return this;
  }

  // need to fix!
  public display(): void {
    const __num = 2;
    const printArray: string[] = [];
    let lengthArray: number[] = [0];
    let lastIndexArray: number[] = [0];
    const dislplayfunc: acceptFunction = (node, children) => {
      switch (node.type) {
        case -1:
          break;
        case 0:
          // blank space
          const prefix1 = " ".repeat(lengthArray[node.type - 1]);
          console.log(`${prefix1}|`);
          // '    --'
          const prefix2 = `${prefix1}${"-".repeat(__num)}`;
          // '    --title'
          console.log(`${prefix2}${node.title}`);
          lengthArray[node.type] = prefix2.length;
          break;
        case 1:
          console.log();
          // blank
          break;
      }
      return [node, children];
    };
    // this.accept(dislplayfunc);
  }
  // get a function and apply it on all nodes
  public accept(func: acceptFunction): void {
    if (this.rootNode) {
      this.rootNode = traverse(this.rootNode, func);
    } else {
      throw new Error(`rootNode not found`);
    }
  }
}

export { DomTree };
