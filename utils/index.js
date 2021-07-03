const { GRAY_DARK, RED, URLRegex, WHITE } = require('./const');
const chalk = require("chalk");

const utils = {
  log: ({ COLOR, TEXT }) => console.log(chalk.hex(COLOR)(TEXT)),
  showVideoInfo: ({ title, duration, description, ownerChannelName }) => {
    utils.log({ COLOR: WHITE, TEXT: `${title} - ${ownerChannelName}` });
    utils.log({ COLOR: GRAY_DARK, TEXT: description.split("\n").join("").slice(0,150).concat('...') });
  },
  abortConversion: (msg = "OH NO! Lo sentimos, algo salio mal.") => {
    process.once("exit", (_) => utils.log({ COLOR: RED, TEXT: msg }));
    process.exit(0);
  },
  validacionDeURL: (url) => URLRegex.test(url),
  filterData: (info) =>
    info.reduce((acc, { qualityLabel, bitrate, itag, quality, url, container }) => {
      return [...acc, { bitrate, itag, quality, url, container, qualityLabel }];
    }, []),
};

module.exports = utils;
