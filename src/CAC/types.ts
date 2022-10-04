type CommandFunction = (...args) => void;
type CommandMap = {
  [key: string]: CommandFunction;
};
export { CommandFunction, CommandMap };
