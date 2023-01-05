const Pulse = require("./pulse");
const op = require("object-path");
const config = require("./config");
const { spawn } = require("child_process");

const git = require("simple-git").default(config.watch);

class useStatus {
  constructor(initialStatus) {
    this.__status = initialStatus;
    this.__cached = null;
  }

  get status() {
    return this.__status;
  }

  isStatus(status) {
    return (
      String(this.status).toLowerCase() === String(status).toLocaleLowerCase()
    );
  }

  setStatus(status) {
    this.__status = status;

    if (this.__status === "ready") {
      this.__cached = null;
    }
  }

  get cached() {
    return this.__cached;
  }

  set cached(value) {
    this.__cached = value;
  }
}

const runCommand = (cmd, args = [], opt = {}) =>
  new Promise((resolve, reject) => {
    const options = { shell: true, stdio: "inherit", ...opt };
    const ps = spawn(cmd, args, options);

    ps.on("error", reject);
    ps.on("close", (code) => (code !== 0 ? reject() : resolve(ps)));
  });

const s = new useStatus();

const pull = () => {
  if (s.isStatus("busy") && s.cached) return s.cached;

  s.setStatus("busy");

  s.cached = new Promise(async (resolve) => {
    await git.stash(); 
    await git.stash('clear');

    let results;
    try {
      results = await git.pull(config.branch);
    } catch (err) {
      console.log(err);
      s.setStatus("ready");
    }

    const files = op.get(results, "files", []);

    if (Array.isArray(files) && files.includes("package.json")) {
      console.log("");
      await runCommand("arcli", ["install", "-s"]);
      await new Promise((resolve) => {
        setTimeout(() => resolve(), 5000);
      });
      console.log("");
    }

    s.setStatus("ready");
    resolve(results);
  });

  return s.cached;
};

Pulse.define("pull", "*/1 * * * *", pull);

pull();

return Pulse.init();
