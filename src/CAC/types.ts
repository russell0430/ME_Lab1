type CommandFunction = (...args: string[]) => { [key: string]: string[] };
type CommandMap = {
  [key: string]: CommandFunction;
};
export { CommandFunction, CommandMap };
