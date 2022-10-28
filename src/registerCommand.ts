import { CAC } from "./CAC";
import { DomTree } from "./DomTree";
import { MarkdownParser } from "./MarkdownParser";
import fs from "fs";
import path from "path";
const resolve = (dir: string): string => path.resolve(__dirname, "../", dir);

function registerCommand(cac: CAC, tree: DomTree): void {
  cac.registerCommand("test", () => {
    console.log("i am testing command");
    return {}
  });
  cac.registerCommand("add-title", (...args: string[]) => {
    tree.addNode({ type: 0, args });
    return {}
  });
  cac.registerCommand("add-bookmark", (...args: string[]) => {
    tree.addNode({ type: 1, args });
    return {}
  });

  cac.registerCommand("delete-title", (...args: string[]) => {
    tree.deleteNode({ type: 0, args });
    return {}
  });

  cac.registerCommand("delete-bookmark", (...args: string[]) => {
    tree.deleteNode({ type: 1, args });
    return {}
  });

  cac.registerCommand("open", (...args: string[]) => {
    if (args[0] && fs.existsSync(resolve(args[0]))) {
      const filePath = resolve(args[0]);
      tree.setParser(new MarkdownParser());
      tree.init(filePath)
      console.log(`open file ${filePath}`);
    } else {
      console.log("init a new tree");
    }
    tree.init();
    return {}
  });

  cac.registerCommand("save", (...args) => {
    const outputPath = args[0] || "./output.md";
    console.log(outputPath)
    // 通过扩展名决定输出的文件类型,这里直接指定为md了
    tree.setParser(new MarkdownParser())
    if (tree.rootNode && tree.parser) {
      tree.parser?.writeContent(tree.rootNode, resolve(outputPath));
    }
    return {}
  });

  cac.registerCommand("undo", () => {
    // const func = (command: string, args: string[]) => {
    //   console.log(command, args)
    //   if (command.startsWith("add-")) {
    //     const arg = command.slice(4);
    //     const type = arg === "title" ? 0 : 1;
    //     const res = tree.deleteNode({ type, args: [args[0].split("@")[0]] });
    //     console.log("delete result", res);
    //     return true;
    //   } else if (command.startsWith("delete-")) {
    //     const arg = command.slice(7);
    //     tree.addNode({ type: arg === "title" ? 0 : 1, args: [args[0].split("@")[0]] });
    //     return true;
    //   } else {
    //     console.log("illegal command");
    //     return false;
    //   }
    // }
    // const res = cac.undo(func);
    tree.undo()
    return {}
  });

  cac.registerCommand("redo", () => {
    // const func = (command: string, args: string[]) => {
    //   if (command.startsWith("add-")) {
    //     tree.addNode({ type: command.slice(4) === "title" ? 0 : 1, args });
    //     return true
    //   } else if (command.startsWith("delete-")) {
    //     const arg = command.slice(7);
    //     tree.addNode({ type: arg === "title" ? 0 : 1, args });
    //     return true
    //   } else {
    //     console.log("illegal command");
    //     return false;
    //   }
    // }
    // cac.redo(func);
    tree.redo()
    return {}
  });

  cac.registerCommand("read-bookmark", (...args) => {
    if (args.length === 0) {
      console.log("need at least one param which is the bookmark")
    }
    const node = tree.searchNode({ type: 1, title: args[0] })
    if (!node) {
      console.log(`no bookmark called ${args[0]} found!`);
      return {};
    }
    node.visited = true;
    console.log(`read bookmark ${node.title}`);
    return {}
  })
  cac.registerCommand("show-tree", () => {
    tree.display();
    return {}
  });

  cac.registerCommand("ls-tree", (...args) => {
    if (args.length === 0) {
      console.log("default show the whole tree");
      tree.display();
      return {};
    }
    const node = tree.searchNode({ type: 0, title: args[0] });
    if (!node) {
      console.log(`no node called ${args[0]}`);
      return {};
    }
    tree.display(node)
    return {}
  })
}
export default registerCommand;
