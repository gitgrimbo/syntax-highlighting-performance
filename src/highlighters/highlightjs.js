import { addCss, addScript } from "../utils";

export default function(version) {
  version = version || "9.13.1";
  return {
    name() {
      return `highlight.js ${version}`;
    },

    async setup(brush) {
      // javascript and css included in core highlight.js
      await addCss(`//cdnjs.cloudflare.com/ajax/libs/highlight.js/${version}/styles/atom-one-dark.min.css`);
      await addScript(`//cdnjs.cloudflare.com/ajax/libs/highlight.js/${version}/highlight.min.js`);
    },

    async highlight(container, srcCode, brush, lineNumbers = false) {
      const start = Date.now();

      const $pre = $(`<pre><code class="${brush}" name="code"></code></pre>`);

      // line numbers not supported
      // https://highlightjs.readthedocs.io/en/latest/line-numbers.html

      container.empty().append($pre);

      const code = $pre.find("code")[0];

      const startSetText = Date.now();
      $(code).text(srcCode);
      const endSetText = Date.now();

      const startHighlight = Date.now();
      hljs.highlightBlock(code);
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
