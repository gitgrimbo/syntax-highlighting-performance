import axios from "axios";
import semver from "semver";
import currentVersions from "../highlighters.json";

async function getVersions_cdnjs(lib) {
  const { data } = await axios.get(`https://api.cdnjs.com/libraries/${lib}`);
  return data.assets.map(({ version }) => version);
}

async function getVersions_jsdelivr(lib) {
  const { data } = await axios.get(`https://data.jsdelivr.com/v1/package/npm/${lib}`);
  return data.versions;
}

async function getVersions() {
  return {
    prism: (await getVersions_cdnjs("prism")).filter((version) => version !== "9000.0.1"),
    rainbow: await getVersions_jsdelivr("rainbow-code"),
    syntaxhighlighter: await getVersions_cdnjs("SyntaxHighlighter"),
    highlightjs: await getVersions_cdnjs("highlight.js"),
  };
}

function getLatest(currentVersionStr, versionStrs) {
  const current = semver.coerce(currentVersionStr);
  if (!current) {
    throw new Error(`${currentVersionStr} is not a valid semver string`);
  }

  const latest = versionStrs.reduce((latest, versionStr) => {
    const version = semver.coerce(versionStr);
    if (!version) {
      throw new Error(`${versionStr} is not a valid semver string`);
    }
    if (!latest) {
      return version;
    }
    if (semver.gt(version, latest)) {
      return version;
    }
    return latest;
  }, null);

  return {
    current,
    latest,
    currentIsLatest: !semver.gt(latest, current),
  };
}

async function getUpdateStatus() {
  const allVersions = await getVersions();

  return Object.keys(allVersions).reduce((result, lib) => {
    const currentVersionStr = currentVersions[lib];
    console.log(`Checking for later versions of ${lib}-${currentVersionStr}`);
    console.log(`  all=${allVersions[lib].join(", ")}`);
    const { current, latest, currentIsLatest } = getLatest(currentVersionStr, allVersions[lib]);
    if (!currentIsLatest) {
      console.log(`  NEW VERSION=${latest}`);
      result[lib] = false;
    } else {
      console.log(`  ALREADY USING LATEST VERSION`);
      result[lib] = true;
    }
    return result;
  }, {});
}

async function main() {
  const updateStatus = await getUpdateStatus();
  const foundAFalse = Object.values(updateStatus).findIndex((v) => !v) > -1;
  return !foundAFalse;
}

(async () => {
  try {
    const result = await main();
    if (!result) {
      console.error("Exiting with a 'failure' code because later highlighter library versions are available");
      process.exit(1);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
