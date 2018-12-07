const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const package = require("../../package.json");

// Set verbose shell
shell.set("+v");



function execOrExit(cmd, errorMessage) {
  const shellStr = shell.exec(cmd);
  if (shellStr.code !== 0) {
    shell.echo(errorMessage || ("Error: " + cmd));
    shell.exit(1);
  }
  return shellStr;
}



function getDeploymentOptions() {
  return {
    repo: package.repository.url,
    version: package.version,
  };
}



function buildGHPages(opts = {}) {
  const {
    repo,
    outputFolder = "gh-pages",
  } = opts;

  execOrExit("npx webpack --verbose -p");

  const githash = execOrExit("git rev-parse HEAD").stdout.substring(0, 8);

  // Start from a clean gh-pages folder.
  shell.rm("-rf", outputFolder);

  execOrExit("git clone -b gh-pages --depth 1 --single-branch " + repo + " " + outputFolder);

  // Set context to gh-pages folder.

  shell.pushd(outputFolder);

  // Prepare the gh-pages branch

  // Remove existing files from gh-pages branch
  shell.rm("-r", "*");

  // Copy web into root of gh-pages folder
  shell.cp("-R", "../web/*", ".");

  const indexHtml = fs.readFileSync("index.html", "utf8")
    .replace("{{package.name}}", package.name)
    .replace("{{package.version}}", package.version)
    .replace("{{githash}}", githash);
  fs.writeFileSync("index.html", indexHtml);

  // Add new files.  Amend commit.
  execOrExit("git add .");
  execOrExit("git commit --amend --date=now --no-edit > commit.log");

  shell.popd();

  shell.echo(`Built version ${opts.version} to ${outputFolder}`);
}



function deployGHPages(opts) {
  // Set context to gh-pages folder.

  shell.pushd("gh-pages");

  // Overwrite the old site

  execOrExit("git push -f origin gh-pages");

  shell.popd();

  shell.echo(`Deployed version ${opts.version} to ${opts.repo}`);
}



function buildAndDeployGHPages(opts) {
  buildGHPages(opts);
  deployGHPages(opts);
}



function main(args) {
  const [command] = args;
  const opts = getDeploymentOptions();
  console.log(opts);
  switch (command) {
    case "deploy-only": return deployGHPages(opts);
    case "build-only": return buildGHPages(opts);
    case "build-and-deploy": return buildAndDeployGHPages(opts);
    default: return console.error(`Unknown argument: ${args[0]}`);
  }
}



const args = process.argv.slice(2);
main(args);
shell.echo("END");
