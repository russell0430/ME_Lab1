import App from "../App"
import path from "path"
import fs from "fs"

const resolve = (filePath: string) =>
  path.resolve(__dirname, "../../", filePath)


function getCac() {
  const cac = App()
  // 不想引入..
  type CacType = typeof cac
  function initCac(cac: CacType) {
    cac.callCommand("add-title", ["company"])
    cac.callCommand("add-title", ["mhy", "at", "company"])
    cac.callCommand("add-title", ["tencent", "at", "company"])
    cac.callCommand("add-title", ["alibaba", "at", "company"])
    cac.callCommand("add-title", ["eleme", "at", "company"])
    cac.callCommand("add-bookmark", ["genshin@https://ys.mihoyo.com/", "at", "mhy"])
    cac.callCommand("add-bookmark", ["LOL@https://lol.qq.com/main.shtml", "at", "tencent"])
    cac.callCommand("add-bookmark", ["bh3@https://www.bh3.com/", "at", "mhy"])
    cac.callCommand("add-bookmark", ["WZRY@https://pvp.qq.com/", "at", "tencent"])
    cac.callCommand("add-bookmark", ["antd@https://ant.design/", "at", "alibaba"])
    cac.callCommand("add-bookmark", ["element-plus@https://element-plus.gitee.io/zh-CN/", "at", "eleme"])
  }
  initCac(cac)
  return cac;
}

function getMarkdownContent(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8")
}
describe("add/delete node", () => {
  // 1.1 
  test("add node", () => {
    const cac = getCac()
    const filePath = "./src/test/TEMP/1.1.output.md"
    const answerPath = "./src/test/markdownFile/1.1.output.md"
    cac.callCommand("add-title", ["facebook", "at", "company"])
    cac.callCommand("add-bookmark", ["react@https://reactjs.org/", "at", "facebook"])
    cac.callCommand("save", [filePath])
    expect(getMarkdownContent(resolve(filePath))).toBe(getMarkdownContent(resolve(answerPath)))
  })

  // 1.2 delete title/bookmark
  test("delete node", () => {
    const cac = getCac()
    const filePath = "./src/test/TEMP/1.2.output.md"
    const answerPath = "./src/test/markdownFile/1.2.output.md"
    cac.callCommand("delte-title", ["eleme"])
    cac.callCommand("delete-bookmark", ["WZRY"])
    cac.callCommand("save", [filePath])
    expect(getMarkdownContent(resolve(filePath))).toBe(getMarkdownContent(resolve(answerPath)))
  })

  // 2.1 redo/undo
  test("undo node", () => {
    const cac = getCac()
    const filePath = "./src/test/TEMP/2.1.output.md"
    const answerPath = "./src/test/markdownFile/2.1.output.md"
    cac.callCommand("delete-title", ["eleme"])
    cac.callCommand("delete-bookmark", ["WZRY"])
    cac.callCommand("undo", [])
    cac.callCommand("save", [filePath])
    expect(getMarkdownContent(resolve(filePath))).toBe(getMarkdownContent(resolve(answerPath)))
  })

  test("redo node", () => {
    const cac = getCac()
    const filePath = "./src/test/TEMP/2.2.output.md"
    const answerPath = "./src/test/markdownFile/2.2.output.md"
    cac.callCommand("delete-title", ["eleme"])
    cac.callCommand("delete-bookmark", ["WZRY"])
    cac.callCommand("undo", [])
    cac.callCommand("redo", [])
    cac.callCommand("save", [filePath])
    expect(getMarkdownContent(resolve(filePath))).toBe(getMarkdownContent(resolve(answerPath)))
  })
  // 2.3
  test("undo node in a row", () => {
    const cac = getCac()
    const filePath = "./src/test/TEMP/2.3.output.md"
    const answerPath = "./src/test/markdownFile/2.3.output.md"
    cac.callCommand("delete-title", ["eleme"])
    cac.callCommand("delete-bookmark", ["WZRY"])
    cac.callCommand("undo", [])
    cac.callCommand("undo", [])
    cac.callCommand("save", [filePath])
    expect(getMarkdownContent(resolve(filePath))).toBe(getMarkdownContent(resolve(answerPath)))
  })
  // 2.4
  test("redo node in a row", () => {
    const cac = getCac()
    const filePath = "./src/test/TEMP/2.4.output.md"
    const answerPath = "./src/test/markdownFile/2.4.output.md"
    cac.callCommand("delete-title", ["eleme"])
    cac.callCommand("delete-bookmark", ["WZRY"])
    cac.callCommand("undo", [])
    cac.callCommand("undo", [])
    cac.callCommand("redo", [])
    cac.callCommand("redo", [])
    cac.callCommand("save", [filePath])
    expect(getMarkdownContent(resolve(filePath))).toBe(getMarkdownContent(resolve(answerPath)))
  })
  
})