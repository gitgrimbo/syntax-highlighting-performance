import * as filesize from "filesize";
import * as ClipboardJS from "clipboard";

import highlighters from "./highlighters";

const results = [];

function toNDP(value, n) {
  const [whole, fraction] = String(value).split(".");
  return whole + "." + (fraction || "0").substring(0, n);
};

function timePerThousandBytes(ms, size) {
  return toNDP(ms / (size / 1000), 3)
}

function appendResult(container, lib, resource, requestSentTime, responseReceivedTime, timings) {
  const timingsCells = Object.keys(timings).reduce((cells, key) => {
    const [start, end] = timings[key];
    const cell = $(`<td>${end - start}</td>`);
    cells[key] = cell;
    return cells;
  }, {});
  const newTable = () => $(`<table cellspacing=0 cellpadding=2 border=1><tbody></tbody></table>`)
    .append($(`
    <tr>
      <th>lib</th>
      <th>postMessage<br/>time</th>
      <th>setup<br/>time</th>
      <th>setText<br/>time</th>
      <th>highlight<br/>time</th>
      <th>URL</th>
      <th>resource size</th>
      <th>highlighting<br/>ms/1000 byte</th>
    </tr>
    `));
  const table = $(container).find("table")[0] || newTable().appendTo(container)[0];
  const tr = $(`<tr></tr>`);
  tr.append(`<td>${lib}</td>`);
  tr.append(`<td>${responseReceivedTime - requestSentTime}</td>`);
  tr.append(timingsCells.setup);
  tr.append(timingsCells.setText);
  tr.append(timingsCells.highlight);
  tr.append(`<td>${resource.url}</td>`);
  tr.append(`<td>${resource.text.length}</td>`);
  tr.append(`<td>${timePerThousandBytes(timings.highlight[1] - timings.highlight[0], resource.text.length)}</td>`);
  $(table).find("tbody").append(tr);
}

function guidGenerator() {
  const s4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
}

async function reloadFrame(iframe) {
  return new Promise((resolve, reject) => {
    const onLoadedMessage = (e) => {
      window.removeEventListener("message", onLoadedMessage);
      resolve();
    };
    window.addEventListener("message", onLoadedMessage);
    iframe.contentWindow.location.reload();
  });
}

async function highlight(highlighterIdx, resource, brush) {
  const iframe = $("iframe")[0];
  await reloadFrame(iframe);

  return new Promise((resolve, reject) => {
    const id = guidGenerator();

    const onMessage = (e) => {
      const { id: incomingId, type } = e.data;
      if (id === incomingId && type === "timings") {
        window.removeEventListener("message", onMessage);
        resolve(e.data.value);
      }
    };

    window.addEventListener("message", onMessage);

    // targetOrigin needed for Firefox (at least)
    iframe.contentWindow.postMessage({
      id,
      type: "highlight",
      value: {
        requestSentTime: Date.now(),
        highlighterIdx,
        resource,
        brush,
      },
    }, window.location.origin);
  });
}

async function loadResources(urls) {
  return await Promise.all(urls.map(async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return {
      url,
      text,
    };
  }));
}

function getBrush(resource) {
  const mappings = {
    ".js": "javascript",
    ".css": "css",
  };
  const { url } = resource;
  const extension = Object.keys(mappings).find((extension) => url.endsWith(extension))
  return mappings[extension];
}

async function main() {
  const resources = await loadResources([
    "https://cdnjs.cloudflare.com/ajax/libs/babel-core/6.1.19/browser.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.6.0/cjs/react-dom.development.js",
    "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.6.0/cjs/react-dom.production.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/vue.js",
    "https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/vue.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/js/bootstrap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/js/bootstrap.js",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.css",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css",
    "https://unpkg.com/reset-css@4.0.1/reset.css",
  ]);
  resources.sort((a, b) => a.text.length - b.text.length);

  resources.forEach((resource, i) => {
    const opt = $(`<option value="${i}">${filesize(resource.text.length)} - ${resource.url}</option>`);
    $("#resources").append(opt);
  });

  highlighters.forEach((highlighter, i) => {
    if (i > 0) {
      $("#highlighters").append(" ");
    }
    const name = highlighter.name();
    const child = $(`<label class="checkbox-highlighter">${name} <input type="checkbox" checked data-type="highlight" value="${i}"></label>`);
    $("#highlighters").append(child);
  });

  async function singleResourceTest(resourceIdx) {
    let maxResourceSize = parseInt($("#max-resource-size").val());
    if (isNaN(maxResourceSize)) {
      maxResourceSize = 0;
    }
    const resource = resources[resourceIdx];
    console.log(resourceIdx, resource);
    if (maxResourceSize > 0 && resource.text.length > maxResourceSize) {
      console.log(`${resource.url} of length ${resource.text.length} skipped because maxResourceSize=${maxResourceSize}`);
      return;
    }
    const checkboxes = $("input[data-type=highlight]");
    for (let highlighterIdx = 0; highlighterIdx < highlighters.length; highlighterIdx++) {
      const highlighter = highlighters[highlighterIdx];
      console.log(checkboxes, highlighterIdx, checkboxes[highlighterIdx], checkboxes[highlighterIdx].checked);
      if (!checkboxes[highlighterIdx].checked) {
        continue;
      }
      const brush = getBrush(resource);
      const response = await highlight(highlighterIdx, resource, brush);
      const { requestSentTime, timings } = response;
      results.push({
        resource: {
          url: resource.url,
          size: resource.text.length,
        },
        highlighter: highlighter.name(),
        brush,
        requestSentTime,
        timings,
      });
      const responseReceivedTime = Date.now();
      const resultsContainer = $("#results");
      appendResult(resultsContainer, highlighter.name(), resource, requestSentTime, responseReceivedTime, timings);
    }
  }

  $("button[data-type=run-test]").on("click", async function(e) {
    await singleResourceTest($("#resources")[0].selectedIndex);
  });

  $("button[data-type=run-all-tests]").on("click", async function(e) {
    for (let i = 0; i < resources.length; i++) {
      await singleResourceTest(i);
    }
  });

  const exporters = {
    json(results) {
      return JSON.stringify({
        userAgent: navigator.userAgent,
        results,
      });
    },
    markdown(results) {
      const headers = [
        "lib",
        "total time",
        "HL time",
        "res. size",
        "HL time/1000B",
        "resource url",
      ];
      return []
        .concat(navigator.userAgent)
        .concat("")
        .concat(headers.join("|"))
        .concat(headers.map(() => "---").join("|"))
        .concat(results
          .map((result) => {
            return []
              .concat([
                result.highlighter,
                result.timings.all[1] - result.timings.all[0],
                result.timings.highlight[1] - result.timings.highlight[0],
                result.resource.size,
                timePerThousandBytes(result.timings.highlight[1] - result.timings.highlight[0], result.resource.size),
                result.resource.url,
              ])
              .join("|");
          }))
        .join("\n");
    },
  };

  new ClipboardJS("button[data-type=export]", {
    text: function(trigger) {
      const exportAs = $("select[data-type=export]").val();
      const exporter = exporters[exportAs];
      console.log(results);
      return exporter ? exporter(results) : "";
    }
  });
}

main();
