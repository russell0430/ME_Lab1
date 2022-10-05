import { DomTree } from "./DomTree";
import { MarkDownParser } from "./MarkdownParser";
function createDomTree(filePath?: string): DomTree {
  const tree = new DomTree();
  if (filePath) {
    tree.setParser(new MarkDownParser(filePath));
    console.log(`reading file ${filePath}`);
  }
  tree.init();
  return tree;
}

export default createDomTree;
