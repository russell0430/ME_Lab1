import { DomTree } from "./DomTree";
import { MarkdownParser } from "./MarkdownParser";
function createDomTree(filePath?: string): DomTree {
  const tree = new DomTree();
  if (filePath) {
    tree.setParser(new MarkdownParser(filePath));
    console.log(`reading file ${filePath}`);
  }
  tree.init();
  return tree;
}

export default createDomTree;
