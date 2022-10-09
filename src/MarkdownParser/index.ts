import { Node, NodeOrNull, Parser } from "../Types";
import { getTitleAndLink, traverse, writeFile, compose } from "../Utils";
import fs from "fs";
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
  // need to fix!
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
    if (sentences.length === 0) return;
    let depth: number = 0;
    // preserve the latest parents
    let parentArray: NodeOrNull[] = [null];
    for (let sentence of sentences) {
      if (sentence.startsWith("#")) {
        let [hashTag,...title] = sentence.split(" ");
        let titleDepth = hashTag.length;
        const parent = parentArray[titleDepth - 1];
        // 对于hashtag,认为他的最近的上一级hashtag为他的父级
        let node: Node = {
          depth: titleDepth,
          children: [],
          parent,
          link: null,
          title:title.join(" "),
          type: 0,
        };
        if (titleDepth === 1 && !this.rootNode) {
          this.rootNode = node;
        }
        parent?.children?.push(node);
        // update depth and parentArray
        depth = titleDepth;
        parentArray[depth] = node;
      } else {
        const [title, link] = getTitleAndLink(sentence);
        const parent = parentArray[depth];
        let node: Node = {
          depth: depth + 1,
          children: null,
          parent,
          title,
          link,
          type: 1,
        };
        parent?.children?.push(node);
      }
    }
  }
}

export { MarkdownParser };
