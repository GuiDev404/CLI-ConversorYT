const path = require("path");
const os = require("os");
const figlet = require("figlet");

module.exports = {
  RED: '#e64937',
  OK: '#69ff2e',
  WHITE: '#fff',
  GRAY:  '#ecf0f1',
  GRAY_DARK: "#636e72",
  URLRegex: /^(http[s]?:\/\/)?(w{3}.)?youtu(be|\.be)?(\.com)?\/.+/gm,
  PATH_DOWNLOAD: (filename = '')=> path.join(os.homedir(), "Downloads", filename),
  MAIN_TITLE: figlet.textSync("CLI Conversor", {
    font: "Swamp Land",
    horizontalLayout: "default",
    verticalLayout: "default",
  }),
}