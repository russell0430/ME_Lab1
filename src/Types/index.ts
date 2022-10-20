interface Node {
  depth: number;
  children: Node[] | null;
  parent: Node | null;
  title: string | null;
  link: string | null;
  // -1 => root
  // 0 => not leaf
  // 1 => leaf
  type: -1 | 0 | 1;
  // visited times
  visited?:Boolean
}
abstract class Parser {
  public abstract parseContent(): void;
  public abstract getContent(): NodeOrNull;
  public abstract writeContent(filePath:string):void;
}
// ts可以通过设置自动认为Node可以为null
// by ts.config.js
// 这里不想配置..
type NodeOrNull = Node | null;

type AcceptFunction = (
  node: Node,
  children: Node[] | null
) => [Node, Node[] | null];
export { Node, Parser, NodeOrNull, AcceptFunction };
