import { addCss, addScript } from "../utils";

export default function(version) {
  version = version || "3.0.83";
  return {
    name() {
      return `SyntaxHighlighter ${version}`;
    },

    async setup(brush) {
      await addCss(
        `//cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/${version}/styles/shCore.min.css`,
        `//cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/${version}/styles/shThemeRDark.min.css`,
      );
      // brush is dependent on core, so add sequentially
      await addScript(`//cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/${version}/scripts/shCore.min.js`);
      const brushes = {
        "javascript": "shBrushJScript",
        "css": "shBrushCss",
      };
      await addScript(`//cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/${version}/scripts/${brushes[brush]}.min.js`);
    },

    async highlight(container, srcCode, brush, lineNumbers = false) {
      const start = Date.now();

      const $pre = $(`<pre class="toolbar: false; brush: ${brush}" name="code"><code></code></pre>`);

      // http://alexgorbatchev.com/SyntaxHighlighter/manual/demo/gutter.html
      $pre[0].className += `; gutter: ${lineNumbers}`;

      container.empty().append($pre);

      const startSetText = Date.now();
      $pre.text(srcCode);
      const endSetText = Date.now();

      const startHighlight = Date.now();
      SyntaxHighlighter.highlight($pre[0]);
      const endHighlight = Date.now();

      const end = Date.now();

      return {
        all: [start, end],
        setText: [startSetText, endSetText],
        highlight: [startHighlight, endHighlight],
      };
    },
  };
}
