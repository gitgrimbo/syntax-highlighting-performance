import { addCss, addScript } from "../utils";

export default function(version) {
  version = version || "1.15.0";
  return {
    name() {
      return `Prism ${version}`;
    },

    async setup(brush) {
      // javascript and css included in core Prism
      await addCss(
        `//cdnjs.cloudflare.com/ajax/libs/prism/${version}/themes/prism-tomorrow.css`,
        `//cdnjs.cloudflare.com/ajax/libs/prism/${version}/plugins/line-numbers/prism-line-numbers.css`,
      );
      await addScript(`//cdnjs.cloudflare.com/ajax/libs/prism/${version}/prism.js`);
      await addScript(`//cdnjs.cloudflare.com/ajax/libs/prism/${version}/plugins/line-numbers/prism-line-numbers.js`);
    },

    async highlight(container, srcCode, brush, lineNumbers = false) {
      const start = Date.now();

      const $pre = $(`<pre class="language-${brush}" name="code"><code></code></pre>`);

      if (lineNumbers) {
        // https://prismjs.com/plugins/line-numbers/
        $pre.addClass("line-numbers");
      }

      container.empty().append($pre);

      const code = $pre.find("code")[0];

      const startSetText = Date.now();
      $(code).text(srcCode);
      const endSetText = Date.now();

      const startHighlight = Date.now();
      Prism.highlightElement(code);
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
