/**
 * Adds hrefs as <link> tags and returns a Promise that resolves to a function that can be used to
 * teardown the <link>s.
 */
export async function addCss(...hrefs) {
  const links = [];
  const promises = hrefs.map((href) => new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.onload = (e) => {
      console.log("onload", href);
      resolve();
    };
    link.onerror = (e) => {
      console.log("onerror", href);
      reject();
    };
    link.rel = "stylesheet";
    link.href = href;
    link.type = "text/css";
    links.push(link);
  }));
  links.forEach((link) => document.head.appendChild(link));
  await Promise.all(promises);
  return () => links.forEach((link) => document.head.removeChild(link));
}

/**
 * Adds srcs as <script> tags and returns a Promise that resolves to a function that can be used to
 * teardown the <scripts>s.
 */
export async function addScript(...srcs) {
  const scripts = [];
  const promises = srcs.map((src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onload = (e) => {
      console.log("onload", src);
      resolve();
    };
    script.onerror = (e) => {
      console.log("onerror", src);
      reject();
    };
    script.type = "text/javascript";
    script.src = src;
    scripts.push(script);
  }));
  scripts.forEach((script) => document.head.appendChild(script));
  await Promise.all(promises);
  return () => scripts.forEach((script) => document.head.removeChild(script));
}
