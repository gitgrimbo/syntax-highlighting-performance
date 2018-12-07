import PrismHighlighter from "./highlighters/Prism";
import SyntaxHighlighterHighlighter from "./highlighters/SyntaxHighlighter";
import HighlightJSHighlighter from "./highlighters/highlightjs";
import RainbowHighlighter from "./highlighters/Rainbow";
import versions from "./highlighters.json";

const highlighters = [
  new PrismHighlighter(versions.prism),
  new SyntaxHighlighterHighlighter(versions.syntaxhighlighter),
  new HighlightJSHighlighter(versions.highlightjs),
  new RainbowHighlighter(versions.rainbow),
];

export default highlighters;
