import { CAC } from "./CAC";
import path from "path";
import registerCommand from "./registerCommand";
import createDomTree from "./createDom";
const resolve = (pathName: string): string => path.resolve(__dirname, pathName);
const filePath = resolve("../test_English.md");
// const tree = new DomTree();

// tree.setParser(new MarkDownParser(filePath));
// tree.init();
// tree.display();
// if (tree.parser) tree.parser.writeContent(resolve("../output.md"))

function App():CAC {
  const cac=new CAC();
  const tree=createDomTree();
  registerCommand(cac,tree);
  // console.log("command test",cac.commandMap['test']);
  return cac;
}
// main();
export default App

