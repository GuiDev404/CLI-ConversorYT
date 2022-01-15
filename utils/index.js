const { GRAY_DARK, RED, URLRegex, WHITE } = require("./const");
const chalk = require("chalk");

const utils = {
  log: ({ COLOR, TEXT }) => console.log(chalk.hex(COLOR)(TEXT)),
  showVideoInfo: ({ title, duration, description, ownerChannelName }) => {
    utils.log({ COLOR: WHITE, TEXT: `${title} - ${ownerChannelName} | ${utils.toHHMMSS(duration)}` });
    utils.log({
      COLOR: GRAY_DARK,
      TEXT: description
        ? description.split("\n").join("").slice(0, 150).concat("...")
        : "",
    });
  },
  abortConversion: (msg = "OH NO! Lo sentimos, algo salio mal.") => {
    process.once("exit", (_) => utils.log({ COLOR: RED, TEXT: msg }));
    process.exit(0);
  },
  validacionDeURL: (url) => URLRegex.test(url),
  filterData: (info) =>
    info.reduce( (acc, { qualityLabel, bitrate, itag, quality, url, container }) => {
      return [
        ...acc,
        { bitrate, itag, quality, url, container, qualityLabel },
      ];
    }, []),
  toHHMMSS: function (duration) {
      let sec_num = parseInt(duration, 10); // don't forget the second param
      let hours   = Math.floor(sec_num / 3600);
      let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      let seconds = sec_num - (hours * 3600) - (minutes * 60);
  
      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}      
    
      return hours+':'+minutes+':'+seconds;
  }
       
};

module.exports = utils;
