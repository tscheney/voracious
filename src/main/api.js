const {app, ipcMain, dialog} = require('electron');

const assert = require('assert');
const { execFile, spawn } = require('child_process');
const fs = require('fs-extra');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const path = require('path');
const shell = require('electron').shell;
const tmp = require('tmp-promise');

export default function registerIpcApi(mainWindow){
  ipcMain.on('openDevTools', () =>
    mainWindow.webContents.openDevTools()
  )
  
  ipcMain.handle('appGetAppPath', () => {
    let appPath = app.getAppPath();
    if (process.env.NODE_ENV === 'development') {
      appPath = path.join(appPath, "release", "app")
    }
    return appPath;
  })
  
  ipcMain.handle('appGetPath', (event, name) => {
    return app.getPath(name)
  })
  
  ipcMain.handle('appGetVersion', () => {
      return app.getVersion();
  })
  
  ipcMain.handle('processPlatform', () => {
      return process.platform;
  })
  
  ipcMain.handle('fsReadDirSync', (event, ...args) => {
      return fs.readdirSync(...args)
  })
  
  ipcMain.handle('fsStatIsDirectory', (event, path) => {
      return fs.statSync(path).isDirectory();
  })
  
  ipcMain.handle('fsExistsSync', (event, path) => {
      return fs.existsSync(path);
  })
  
  ipcMain.handle('fsReadFileSync', (event, ...args) => {
      return fs.readFileSync(...args);
  })
  
  ipcMain.handle('fsUnlinkSync', (event, ...args) => {
      return fs.unlinkSync(...args);
  })
  
  ipcMain.handle('fsEnsureDirSync', (event, ...args) => {
      return fs.ensureDirSync(...args);
  })
  
  ipcMain.handle('processArgvIncludes', (event, ...args) => {
      return process.argv.includes(...args);
  })
  
  ipcMain.on('toggleFullscreen', () => {
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
  })
  
  ipcMain.on('windowExit', async () => {
      if (mainWindow.isFullScreen()) {
          await mainWindow.setFullScreen(false);
      }
  })
  
  ipcMain.handle('pathBasename', async (event, ...args) => {
      const pee = args[0];
      const poo = path.basename(...args);
      return await path.basename(...args);
  })
  
  ipcMain.handle('pathJoin', async (event, ...args) => {
      return await path.join(...args)
  })
  
  ipcMain.handle('pathExtname', async (event, dir) => {
      return await path.extname(dir)
  })
  
  ipcMain.handle('pathParse', async (event, dir) => {
      return await path.parse(dir)
  })
  
  ipcMain.handle('assert', async (event, ...args) => {
      return await assert(...args)
  })
  
  ipcMain.handle('shellOpenExternal', (event, ...args) => {
      return shell.openExternal(...args);
  })
  
  ipcMain.handle('childProcessExecFile', (event, ...args) => {
      const destFn = args[1][1];
      return new Promise((resolve, reject) => {
          execFile(...args, (execError, stdout, stderr) => {
              if (execError) {
                reject(execError);
              }
              resolve(true);
            });
          });
  })
  
  ipcMain.handle('createMedia', async (event, ...args) => {
    let ext;
    const type = args[0];
    if(type == "audio") {
      ext = '.mp3';
    }
    else {
      ext = '.jpg';
    }
    const binaryFilename = args[1];
    const vidfn = args[2];
      
    const tmpfile = await tmp.file({keep: true, postfix: ext});
  
    await new Promise((resolve, reject) => {
      let subp;
      if (type == "audio") {
        const startTime = args[3];
        const endTime = args[4];
        subp = spawn(binaryFilename, ['-ss', startTime.toString(), '-i', vidfn, '-t', (endTime-startTime).toString(), '-map', '0:a:0', '-ab', '192k', '-f', 'mp3', '-y', tmpfile.path], {windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
      }
      else{
        const time = args[3];
        subp = spawn(binaryFilename, ['-ss', time.toString(), '-i', vidfn, '-frames:v', '1', "-q:v", "6", '-y', tmpfile.path], {windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});   
      }
  
      subp.on('error', (error) => {
        reject(error);
      });
  
      subp.stderr.on('data', (data) => {
        console.log(`ffmpeg extract ${args[0]} stderr: ${data}`);
      });
  
      subp.on('exit', (code) => {
        if (code) {
          reject(new Error('ffmpeg exit code ' + code));
        }
        resolve();
      });
    });
  
    const data = await fs.readFile(tmpfile.path);
    const dataBase64 = Buffer.from(data, 'binary').toString('base64');
  
    tmpfile.cleanup();
  
    return dataBase64;
  })
  
  ipcMain.handle('tmpFile', async (event, ...args) => {
      tmpFile = await tmp.file(...args);
      return  tmpFile.path;
  })
  
  ipcMain.on('tmpFileCleanup', async () => {
      if (tmpFile)
      {
          await tmpFile.cleanup();
      }
  })
  
  ipcMain.handle('getSubData', (event, filename) => {
      const rawData = fs.readFileSync(filename);
      const encodingGuess = jschardet.detect(rawData.toString('binary'));
      console.log('loadSubtitleTrackFromFile guessed encoding', encodingGuess);
      return iconv.decode(rawData, encodingGuess.encoding);
  })
  
  ipcMain.on('choose-video-file', () => {
      dialog.showOpenDialog({
        title: 'Choose a video file',
        buttonLabel: 'Choose',
        filters: [{name: 'Videos', extensions: ['mp4', 'webm']}],
        properties: ['openFile'],
      }, files => {
        if (files && files.length) {
          const fn = files[0];
          mainWindow.send('chose-video-file', fn)
        }
      });
    });
  
  ipcMain.handle('dialog', (event, method, params) => {       
    return dialog[method](params);
  });
}

