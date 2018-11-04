import PrismHighlighter from "./highlighters/Prism";
import SyntaxhHighlighterHighlighter from "./highlighters/SyntaxHighlighter";
import HighlightJSHighlighter from "./highlighters/highlightjs";
import RainbowHighlighter from "./highlighters/Rainbow";

const highlighters = [
  new PrismHighlighter("1.15.0"),
  new SyntaxhHighlighterHighlighter("3.0.83"),
  new HighlightJSHighlighter("9.13.1"),
  new RainbowHighlighter("2.1.4"),
];

export default highlighters;
