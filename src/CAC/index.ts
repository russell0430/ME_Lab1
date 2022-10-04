import { CommandFunction, CommandMap } from "./types";
class CAC {
  public options;
  private commandMap: CommandMap = {};
  constructor(options = {}) {
    this.options = options;
  }
  registerCommand(command: string, callbackFunction: CommandFunction): void {
    this.commandMap[command] = callbackFunction;
  }
  run(): void {
    const stdin = process.openStdin();
    function processInput(data) {
      const [command, ...args]: [string, string[]] = data.toString().split(" ");
      if (!(command in this.commandMap)) {
        console.log(`no such command !\n read ${command}`);
        return;
      } else {
        try {
          this.commandMap[command](...args);
          // pluginApi for undo&redo
        } catch (error) {
          console.log("oops ! something went wrong!");
          console.log(error);
        }
      }
    }
    stdin.addListener("data", processInput);

  }
  undo(): void {}
  redo(): void {}
}

export { CAC };
