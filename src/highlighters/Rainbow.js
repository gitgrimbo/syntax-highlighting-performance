import { addCss, addScript } from "../utils";

export default function(version) {
  version = version || "2.1.4";
  return {
    name() {
      return `Rainbow ${version}`;
    },

    async setup(brush) {
      // javascript and css included in core Rainbow
      await addCss(
        `//cdn.jsdelivr.net/npm/rainbow-code@${version}/themes/css/zenburnesque.css`,
      );
      await addScript(`//cdn.jsdelivr.net/npm/rainbow-code@${version}/dist/rainbow.min.js`);
    },

    color(el) {
      return new Promise((resolve) => {
        Rainbow.color(el, resolve);
      });
    },

    async highlight(container, srcCode, brush, lineNumbers = false) {
      const start = Date.now();

      const $div = $(`<div><pre><code data-language="${brush}"></code></pre></div>`);

      // Possibilities for line numbers, not implemented here
      // https://github.com/Sjeiti/rainbow.linenumbers
      // https://github.com/Blender3D/rainbow.linenumbers.js

      container.empty().append($div);

      const startSetText = Date.now();
      $div.find("code").text(srcCode);
      const endSetText = Date.now();

      const startHighlight = Date.now();
      await this.color($div[0]);
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
