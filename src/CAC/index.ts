import { CommandFunction, CommandMap } from "./types";
// CAC可以记录命令,并且进行undo,redo管理,但是在本例中
// 因为delete可以直接使用不完全的命令 
// 如 delete-title a,这样在undo时,命令行不知道在哪里进行了delete
// 所以也不知道如何redo,尝试使用命令的元数据 return {},但没有成功
// 所以需要将undo,redo复杂度返还给DomTree

class CAC {
  public options;
  commandMap: CommandMap = Object.create(null);
  // 命令执行栈
  commandStack: [string, string[], { [key: string]: string[] }][] = [];
  // 指向执行过的或退回的命令
  commandStackPointer: number = -1;
  trackCommand: Boolean = true;
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
        this.callCommand(command, args);
      }
    };
    stdin.addListener("data", processInput);
  }

  // undo,redo应该不是与命令行交互的命令管理的事,返回最近一条指令,让别人干活
  // 毕竟CAC不知道与之相反的操作是什么以及如何处理
  // !deprecated 
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
  // 给你相关参数,自己去写undo的执行
  /**
   * 
   * @param command command is a function ,you can get (command:string,args:string[])
   *                and return a boolean ,which mean if you want do continue 
   *                exectue the command 
   * @returns 
   */
  undo(command: (command: string, args: string[]) => Boolean): Boolean {
    this.trackCommand = false;
    try {
      const [com, args] = this.commandStack[this.commandStackPointer]
      if (command(com, args)) {
        this.commandStackPointer -= 1
        return true
      }
      // don not want to execute the command
      else return false
    } catch (e) {
      // error
      console.log(e)
      return false
    }
  }
  // 同上,只不过函数里给的参数不同
  redo(command: (command: string, args: string[]) => Boolean): Boolean {
    this.trackCommand = false;
    try {
      if (this.commandStackPointer + 1 >= this.commandStack.length) {
        throw new Error("no history command");
      }
      const [com, args] = this.commandStack[this.commandStackPointer + 1]
      if (command(com, args)) {
        this.commandStackPointer -= 1
        return true
      }
      // don not want to execute the command
      else return false
    } catch (e) {
      // error
      console.log(e)
      return false
    }
  }
  /**
   * 测试时可以直接调用
   * @param {string} command 
   * @param {string[]} args 
   * @private
   */
  callCommand(command: string, args: string[]) {
    try {
      const meta = this.commandMap[command](...args);
      if (this.trackCommand) {
        // 执行过新命令就只能把之后的历史删除
        this.commandStack = this.commandStack.slice(0, this.commandStackPointer + 1)
        this.commandStack.push([command, args, meta]);
        this.commandStackPointer = this.commandStack.length - 1;
        // pluginApi for undo&redo
      }
    } catch (error) {
      console.log("oops ! something went wrong!");
      console.log(error);
    }
    finally {
      this.trackCommand = true;
    }
  }
}

export { CAC };
