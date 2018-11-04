import highlighters from "./highlighters";

async function highlight(highlighterIdx, resource, brush) {
  console.log(highlighters, highlighterIdx);
  const highlighter = highlighters[highlighterIdx];

  console.log(`start setup for current highlighter, ${highlighter.name()}`);
  const startSetup = Date.now();
  await highlighter.setup(brush);
  const endSetup = Date.now();
  console.log(`finished setup for current highlighter, ${highlighter.name()}`);

  console.log(`start highlighting for current highlighter, ${highlighter.name()}`);
  const container = $("#highlightContainer");
  const timings = await highlighter.highlight(container, resource.text, brush);
  console.log(`finished highlighting for current highlighter, ${highlighter.name()}`);

  return {
    ...timings,
    setup: [startSetup, endSetup],
  };
}

window.addEventListener("message", async (e) => {
  const { id, type } = e.data;
  if (type === "highlight") {
    const { requestSentTime, highlighterIdx, resource, brush } = e.data.value;
    const timings = await highlight(highlighterIdx, resource, brush);
    // targetOrigin needed for Firefox (at least)
    e.source.postMessage({
      id,
      type: "timings",
      value: {
        requestSentTime,
        highlighterIdx,
        resource,
        brush,
        timings,
      },
    }, window.location.origin);
  }
});

// targetOrigin needed for Firefox (at least)
window.parent.postMessage({ type: "loaded" }, window.location.origin);
