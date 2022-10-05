import { CAC } from "./CAC";
import { DomTree } from "./DomTree";
import { MarkDownParser } from "./MarkdownParser";
import fs from "fs";
import path from "path";
const resolve = (dir: string): string => path.resolve(__dirname, "../", dir);

function registerCommand(cac: CAC, tree: DomTree): void {
  cac.registerCommand("test", () => {
    console.log("i am testing command");
  });
  cac.registerCommand("add-title", (...args: string[]) => {
    tree.addNode(...args);
  });
  cac.registerCommand("add-bookmark", (...args: string[]) => {
    tree.addNode(...args);
  });

  cac.registerCommand("delete-title", (...args: string[]) => {
    tree.deleteNode(0, args[0]);
  });

  cac.registerCommand("delete-bookmark", (...args: string[]) => {
    tree.deleteNode(1, args[0]);
  });

  cac.registerCommand("open", (...args: string[]) => {
    console.log(resolve(args[0]));
    if (args[0] && fs.existsSync(resolve(args[0]))) {
      const filePath = resolve(args[0]);
      tree.setParser(new MarkDownParser(filePath));
    } else {
      console.log("init a new tree");
    }
    tree.init();
  });

  cac.registerCommand("save", (...args) => {
    const outputPath = args[0] || "./output.md";
    if (tree.isInit) {
      tree.parser?.writeContent(resolve(outputPath));
    }
  });

  cac.registerCommand("undo", () => {
    const { command, args } = cac.getLastCommand();
    if (!command) {
      console.log("fail to execute undo");
      return;
    }
    if (command.startsWith("add-")) {
      const arg = command.slice(4);
      const type = arg === "title" ? 0 : 1;
      tree.deleteNode(type, args[0]);
    } else if (command.startsWith("delete-")) {
      const arg = command.slice(7);
      tree.addNode(...args);
    } else {
      console.log("illegal command");
      return;
    }
    cac.undo();
  });

  cac.registerCommand("redo", () => {
    const { command, args } = cac.getLastCommand();
    if (!command) {
      console.log("fail to execute undo");
      return;
    }
    if (command.startsWith("add-")) {
      tree.addNode(...args);
    } else if (command.startsWith("delete-")) {
      // logical error
      // can not delete the same node twice
    } else {
      console.log("illegal command");
      return;
    }
    cac.redo(command, args);
  });

  cac.registerCommand("show-tree", () => {
    tree.display();
  });

  cac.registerCommand("ls-tree", () => {});
}
export default registerCommand;
