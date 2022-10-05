import { CommandFunction, CommandMap } from "./types";
class CAC {
  public options;
  commandMap: CommandMap = {};
  commandStack: [string, string[]][] = [];
  constructor(options = {}) {
    this.options = options;
  }
  public registerCommand(
    command: string,
    callbackFunction: CommandFunction
  ): void {
    this.commandMap[command] = callbackFunction;
  }
  run(): void {
    const stdin = process.openStdin();
    const processInput = (data: { toString: () => string }) => {
      const [command, ...args] = data.toString().trim().split(" ");
      console.log(command);
      if (!this.commandMap[command]) {
        console.log(`no such command !\n read ${command}`);
        return;
      } else {
        try {
          this.commandMap[command](...args);
          this.commandStack.push([command, args]);
          // pluginApi for undo&redo
        } catch (error) {
          console.log("oops ! something went wrong!");
          console.log(error);
        }
      }
    };
    stdin.addListener("data", processInput);
  }
  // undo,redo应该不是与命令行交互的命令管理的事,返回最近一条指令,让别人干活
  // 毕竟CAC不知道与之相反的操作是什么以及如何处理
  getLastCommand(): { command: string; args: string[] } {
    const lastCommand = this.commandStack[this.commandStack.length - 1];
    if (!lastCommand) {
      console.log("no command execute before!");
      return {
        command: "",
        args: [],
      };
    } else {
      return {
        command: lastCommand[0],
        args: lastCommand[1],
      };
    }
  }
  undo(): Boolean {
    if (this.commandStack.length > 0) {
      this.commandStack.pop();
      return true;
    } else return false;
  }
  redo(command: string, args: string[]): Boolean {
    this.commandStack.push([command, args]);
    return true;
  }
}

export { CAC };
