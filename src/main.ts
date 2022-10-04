// import { CAC } from "./CAC"

// const cac=new CAC()
// cac.run()
import { DomTree } from "./DomTree"
import { MarkDownParser } from "./MarkdownParser"
import path from "path"
const resolve = (pathName: string): string =>
  path.resolve(__dirname, pathName)
const filePath = resolve("../test.md")
const tree = new DomTree()

tree.setParser(new MarkDownParser(filePath))
tree.process()
if (tree.parser) tree.parser.writeContent(resolve("../output.md"))
