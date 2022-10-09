import { DomTree } from "../DomTree";
import { Node, acceptFunction } from "../Types";
import { MarkdownParser } from "../MarkdownParser";
import { traverse } from "../Utils";
import path from "path";
import fs from "fs";
const resolve = (filePath: string) =>
  path.resolve(__dirname, "../../", filePath);

const markdownFilePath = resolve("./jest.English.input.md");
console.log(markdownFilePath);

describe("markdown parser test", () => {
  const markdownParser = new MarkdownParser(markdownFilePath);
  markdownParser.parseContent();
  const rootNode = markdownParser.getContent();
  test("test leaf node", () => {
    const acceptFunc: acceptFunction = (node, children) => {
      if (node.type === 1) {
        expect(node.children).toBe(null);
        expect(node.link).not.toBe(null);
        let link: string = "";
        switch (node.title) {
          case "elearning":
            link = "https://elearning.fudan.edu.cn/courses";
            break;
          case "Markdown Guide":
            link = "https://www.markdownguide.org";
            break;
          case "JFP":
            link =
              "https://www.cambridge.org/core/journals/journal-of-functional-programming";
            break;

          case "Category Theory":
            link =
              "http://www.appliedcategorytheory.org/what-is-applied-category-theory/";
            break;
          default:
            console.log("oops something wrong with your code or my code");
        }
        expect(node.link).toBe(link);
      }
      return [node, children];
    };
    traverse(rootNode, acceptFunc);
  });
  // this really work
  // i find a bug below for parser
  // node`s title can not contain blank
  test("test branch node", () => {
    const acceptFunc: acceptFunction = (node, children) => {
      if (node.type === 0) {
        let childrenLength: number = 0;
        let firstChild: string = "";
        switch (node.title) {
          case "my collection":
            childrenLength = 3;
            break;
          case "course":
            childrenLength = 1;
            break;
          case "reference":
            childrenLength = 3;
            break;
          case "FP":
            childrenLength = 1;
            break;
          case "OOP":
            childrenLength = 0;
            console.log(node.children);
            break;
          case "need to read":
            childrenLength = 1;
            break;

          default:
            // debugger
            console.log(
              "oops something wrong with your code or my code",
              node.title
            );
        }
        expect(node.children?.length).toBe(childrenLength);
      }
      return [node, children];
    };
    traverse(rootNode, acceptFunc);
  });
});

describe("domTree test", () => {
  test("add node", () => {
    const tree = new DomTree();
    tree.setParser(new MarkdownParser(markdownFilePath));
    tree.init();

    tree.addNode({
      type: 0,
      args: ["Games", "at", "reference"],
    });
    tree.addNode({
      type: 1,
      args: ["Genshin@https://ys.mihoyo.com/", "at", "Games"],
    });
    const acceptFunc: acceptFunction = (node, children) => {
      if (node.title === "Games") {
        expect(node.parent?.title).toBe("reference");
      }
      if (node.title === "Genshin") {
        expect(node.parent?.title).toBe("Games");
      }
      return [node, children];
    };
    tree.accept(acceptFunc);
  });
  test("delete node", () => {
    const tree = new DomTree();
    tree.setParser(new MarkdownParser(markdownFilePath));
    tree.init();

    tree.deleteNode({
      type: 1,
      args: ["JFP"],
    });
    const acceptFunc: acceptFunction = (node, children) => {
      if (node.title === "FP") {
        expect(node.children?.length).toBe(0);
      }
      return [node, children];
    };
    tree.accept(acceptFunc);
  });
  const outputFilePath = resolve("jest.English.md");
  test("write domTree file", () => {
    const tree = new DomTree();
    tree.setParser(new MarkdownParser(markdownFilePath));
    tree.init();

    tree.addNode({
      type: 0,
      args: ["Games", "at", "reference"],
    });
    tree.addNode({
      type: 1,
      args: ["Genshin@https://ys.mihoyo.com/", "at", "Games"],
    });
    if (tree.parser) {
      tree.parser.writeContent(outputFilePath);
      const outputFileContent = fs.readFileSync(outputFilePath, "utf-8");
      const answerFileContent = fs.readFileSync(
        resolve("jest.English.standard.md"),
        "utf-8"
      );
      expect(outputFileContent).toBe(answerFileContent);
    }
  });
});
