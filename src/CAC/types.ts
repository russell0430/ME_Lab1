type CommandFunction = (...args: string[]) => void;
type CommandMap = {
  [key: string]: CommandFunction;
};
export { CommandFunction, CommandMap };
