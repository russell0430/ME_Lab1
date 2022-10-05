import { Node, acceptFunction } from "../Types";
import fs from "fs";
import path from "path";
// 函数调用者自行决定是否处理children,以及如何处理children,
// 之后使用函数调用者的children进行修改
function traverse(node: Node, func: acceptFunction): Node {
  const [newNode, children] = func(node, node.children);
  newNode.children =
    children
      ?.map((child) => traverse(child, func))
      // told to delete the node which parent is null
      // get tortured for several hours
      // fix the bug delete not work
      // a little ugly :(
      .filter((node) => node.parent != null) || null;
  return newNode;
}

function getTitleAndLink(sentence: string): [string, string] {
  const test = /\[(.*)\]\((.*)\)/g;
  const res = test.exec(sentence);
  if (!res || !res[1] || !res[2]) {
    throw new Error(`${sentence} not compatiable file format [title](link)`);
  }
  return [res[1], res[2]];
}

function writeFile(filePath: string, ...fileContent: string[]): void {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
  }
  fs.writeFileSync(filePath, fileContent.join("\r\n"), "utf-8");
}
// for writeFile
// forgive me i just ignore types for compose :)
function compose<T>(func: Function) {
  let argsArray: T[] = [];
  function gongjuren(...args: T[]) {
    if (args.length > 0) {
      argsArray.push(...args);
      return gongjuren;
    } else {
      return func(...argsArray);
    }
  }
  return gongjuren;
}
export { traverse, getTitleAndLink, writeFile, compose };
