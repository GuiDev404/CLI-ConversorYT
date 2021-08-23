#!/usr/bin/env NODE_OPTIONS=--no-warnings node

const fs = require("fs");
const exec = require("child_process").exec;
const cliProgress = require('cli-progress');

const inquirer = require("inquirer");
const youtubedl = require("ytdl-core");
const chalk = require("chalk");
const separator =  new inquirer.Separator();
const downloadProgress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const { log, showVideoInfo, abortConversion, filterData } = require('./utils');
const { GRAY, GRAY_DARK, RED, PATH_DOWNLOAD, MAIN_TITLE, OK } = require('./utils/const');

async function getInfo(URL) {
  const info = await youtubedl.getInfo(URL);
  const { title, lengthSeconds: duration, description, ownerChannelName, thumbnails } = info.videoDetails;

  const videosWithAudio = youtubedl.filterFormats(info.formats, 'audioandvideo');
  const videosLsData = filterData(videosWithAudio);

  const onlyAudio = youtubedl.filterFormats(info.formats, 'audioonly');
  const audioLsData = filterData(onlyAudio);

  return { 
    title, duration, description, ownerChannelName, thumbnails,
    videosLsData,
    audioLsData,
  }
}

function saveFile ({ url, title, ext, itag }) {
  const outputFile = fs.createWriteStream(PATH_DOWNLOAD(`${title}${ext}`))
  
  const video = youtubedl(url, { filter: (format) => format.itag == itag });
  video.pipe(outputFile)
  
  log({ COLOR: OK, TEXT: "Descargando: \n" })
  downloadProgress.start(100, 0);

  video.on('progress', (chunkLength, downloaded, total) => {
    const progress = Number(((downloaded * 100) / total).toFixed(2));
    downloadProgress.update(progress, 0);
  })

  video.once('finish', async ()=> {
    downloadProgress.stop();
    abrirAlTerminar();
  })
}

const abrirAlTerminar = async () => {
  const response = await inquirer.prompt({
    type: "confirm",
    name: "Abrir descargas: ",
    message: log({ COLOR: GRAY, TEXT: "¿Quiere abrir la carpeta de descargas?" }),
  });

  if (response["Abrir descargas: "]) {
    try {

      exec("start Downloads", { cwd: process.env.HOME }, (error, stdout, stderr)=> {
        if (error) {
          return;
        }

      })
    } catch (error) {
      console.error(error);
      abortConversion()
    }

    log({ COLOR: OK, TEXT: "\nGracias por usar CLI-Conversor. Adios!" })
  }

};

const iniciarConversion = async () => {
  log({COLOR: RED, TEXT: MAIN_TITLE});

  try {
    const { URL } = await inquirer.prompt({
      type: 'input',
      message: chalk.hex(GRAY)('Ingrese una URL: '),
      name: 'URL',
      validate: (respuesta)=> {
        if(!youtubedl.validateURL(respuesta.trim())){
          return chalk.hex(RED)('Ingrese una URL Valida')
        }

        return true;
      }
    });
    
    log({ COLOR: GRAY_DARK, TEXT: separator  });

    const { title, duration, description, ownerChannelName, videosLsData, audioLsData } = await getInfo(URL); 
    showVideoInfo({ title, duration, description, ownerChannelName });

    log({ COLOR: GRAY_DARK, TEXT: separator  });

    const { type } = await inquirer.prompt({
      type: 'checkbox',
      name: "type",
      message: chalk.hex(GRAY)("¿Seleccione que desea dercargar?"),
      choices: [{name: "Video"}, {name: "Audio"}],
      validate: (types)=> {
        if((!types.length || types.length >= 2)){
          return chalk.hex(RED)('Debe seleccionar una opcion');
        }
        return true;
      }
    });
  
    let formatChooise = [];
    if(type[0] === 'Video'){
      formatChooise = videosLsData.map((video,idx)=> {
        return { 
          name: `${idx+1}. ${video.qualityLabel} (.${video.container}) | ${video.quality}`, 
          itag: video.itag, 
          ext: '.mp4'
        }
      })
    } else {
      formatChooise = audioLsData.map((audio, idx)=> {
        return { name: `${idx+1}. ${Math.round(audio.bitrate / 1024)} kbps`, itag: audio.itag, ext: '.webm' }
      })
    }

    log({ COLOR: GRAY_DARK, TEXT: separator  });

    const { select } = await inquirer.prompt({
      type: 'list',
      name: "select",
      message: chalk.hex(GRAY)("¿Seleccione una de las opciones?"),
      choices: formatChooise,
    });

    const res = formatChooise.find(a=> a.name.includes(select));

    const timestamp =  Date.now();
    const name = title.toLowerCase().split(' ').join('_').slice(0,15).replace(/(\.|\||\\|\/|)/g, '');

    saveFile({ url: URL, ext: res.ext, itag: res.itag, title: `${timestamp}_${name}` })
    // await abrirAlTerminar();
    
  } catch (error) {
    console.log(error);
    abortConversion()
  }
};

iniciarConversion();

process.removeAllListeners('warning')
