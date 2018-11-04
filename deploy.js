const shell = require("shelljs");
const package = require("./package.json");

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



function deployToGhPages(repo) {
  execOrExit("npx webpack --verbose -p");

  // Start from a clean gh-pages folder.
  shell.rm("-rf", "gh-pages");

  execOrExit("git clone -b gh-pages --depth 1 --single-branch " + repo + " gh-pages");

  // Set context to gh-pages folder.

  shell.pushd("gh-pages");

  // Prepare the gh-pages branch

  // Remove existing files from gh-pages branch
  shell.rm("-r", "*");

  // Copy web into root of gh-pages folder
  shell.cp("-R", "../web/*", ".");

  // Add new files.  Amend commit.
  execOrExit("git add .");
  execOrExit("git commit --amend --date=now --no-edit > commit.log");

  // Overwrite the old site

  execOrExit("git push -f origin gh-pages");

  shell.popd();
}


const opts = getDeploymentOptions();
deployToGhPages(opts.repo);

shell.echo(`Deployed to ${opts.repo}`);
shell.echo("END");
