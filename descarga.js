const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const inquirer = require('inquirer');
const youtubedl = require('youtube-dl');
const chalk = require('chalk');
const figlet = require('figlet');

const mensajePorDefecto = (infoVideo) =>{
    console.log(chalk.hex('#ecf0f1')(`\nTITULO DEL VIDEO: ${chalk.white.bgBlue(infoVideo.titulo)}.`))
    console.log(chalk.hex('#ecf0f1')(`ARCHIVO: ${chalk.white.bgBlue(infoVideo.nombreArchivo)}.`))
    console.log(chalk.hex('#ecf0f1')(`SUBIDO POR: ${chalk.white.bgBlue(infoVideo.subidoPor)}.\n`))
    console.log(chalk.hex('#f1c40f').bgBlack('Descarga finalizada.\n'))
}

const abortConversion = (msg = 'OH NO, lo sentimos, algo salio mal.') => {
    process.once('exit', _ => console.log( chalk.hex('#e17055')(msg) ));
    process.exit(0);
}

const validacionDeURL = (url) =>{
    let esValido = /^(http[s]?:\/\/)?(w{3}.)?youtu(be|\.be)?(\.com)?\/.+/gm.test(url);  // global y multilinea (/regex/gm)

    (!esValido) ? abortConversion('URL ingresada no valida. Ingrese una valida.') : true;
}

const infoVideo = async (url,ext) => {
    let getInfo = promisify(youtubedl.getInfo);
    let result = await getInfo(url);

    return {
        titulo: result.title,
        subidoPor: result.uploader,
        calidad: result.format_note,
        nombreArchivo: ext === 'mp4' ? result._filename : `${result._filename.slice(0,-1)}3` ,
    }
}

const opcionesDeVideo = async (optionSelected,URL)=>{
    const PATH_DOWNLOAD = path.join( os.homedir(), 'Downloads')

    if(optionSelected === 'Audio'){ 
        const informacionDelVideo = await infoVideo(URL,'mp3');

        downloadAudio( {URL, informacionDelVideo, PATH_DOWNLOAD} );
    }else {
        console.log('    ' + new inquirer.Separator() + new inquirer.Separator())

        const informacionDelVideo = await infoVideo(URL,'mp4');
        
        let select = await inquirer.prompt({
            type: 'rawlist',
            name: 'quality',
            message: chalk.hex('#dfe6e9').bgHex('#636e72')('¿que calidad de video quiere?'),
            choices: ['La mejor','Normal']                    
        })
             
        let calidad = select.quality;

        downloadVideo( { URL, calidad , informacionDelVideo, PATH_DOWNLOAD } );
    }

    console.log('\nEspere...\n');

    setTimeout(()=> console.log(chalk.hex('#f1c40f').bgBlack('Comenzando la descarga...')) , 300)
}

const downloadAudio =  ( {URL, informacionDelVideo , PATH_DOWNLOAD} ) =>{
    youtubedl.exec(URL, ['-x', '--audio-format', 'mp3'], { cwd: PATH_DOWNLOAD }, (err, output ) => {
        if (err) abortConversion();
      
        mensajePorDefecto(informacionDelVideo);
        abrirAlTerminar();
    })
}

const downloadVideo = ({URL, calidad, informacionDelVideo, PATH_DOWNLOAD}) => {
    calidad === 'La mejor' ? downloadVideoBestQuality(URL,informacionDelVideo,PATH_DOWNLOAD) : 
                             downloadNormalVideo(URL,informacionDelVideo,PATH_DOWNLOAD);
}

const downloadVideoBestQuality = (  URL, informacionDelVideo, PATH_DOWNLOAD  ) => {
    youtubedl.exec( URL, ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]'], { cwd: PATH_DOWNLOAD  }, (err, output) => {
        if (err) abortConversion();
     
        mensajePorDefecto(informacionDelVideo);
        abrirAlTerminar();
    })
}

const downloadNormalVideo = (URL, informacionDelVideo, PATH_DOWNLOAD )=>{
    const video = youtubedl( URL , ['--format=18'] , { start: 0, cwd: PATH_DOWNLOAD })

    video.pipe(fs.createWriteStream( informacionDelVideo.nombreArchivo) )
         .on('error', _ => abortConversion() )
    
    video.on('info', _ =>  mensajePorDefecto(informacionDelVideo) )
         .on('error', _ => abortConversion() )

    process.once('beforeExit', _ => '\n' + abrirAlTerminar() );
}

const inicio = async ()=>{
    let [ _ ,__ ,URL ] = process.argv;

    validacionDeURL(URL);

    console.log(
        chalk.hex('#e17055')(
            figlet.textSync('ConversorMA!', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            }
        )
    ))

    let options = await inquirer.prompt({
        type: 'list',
        name: 'select',
        message: chalk.hex('#dfe6e9').bgHex('#636e72')('¿seleccione que desea dercargar?'),
        choices: [ 'Video',  'Audio' ]
    });

    opcionesDeVideo(options.select,URL)
}

inicio();

const abrirAlTerminar = async ()=>{
    const response = await inquirer.prompt({
        type:'confirm',
        name:'openDownloadFolder',
        message: '¿ quiere abrir la carpeta de descargas ?',
    })

    if(response.openDownloadFolder){
        try {
            await exec('start Downloads', { cwd: 'C:/Users/guido' });
        }catch {
            console.log(chalk.red('OH NO, lo sentimos, algo salio mal.'));
        }
    }

    process.on('exit', _ => console.log(chalk.whiteBright.bgGreen('\nGracias por usar CoversorMA. Adios!') ) )
}