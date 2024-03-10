const {app, protocol, ipcMain, dialog, BrowserWindow, Menu} = require('electron');

const path = require('path');
const fs = require('fs-extra');
const url = require('url');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const assert = require('assert');
const shell = require('electron').shell;
const { execFile, spawn } = require('child_process');
const tmp = require('tmp-promise');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//ipcMain.on("close-me", (evt, arg) => {
//  app.quit();
//});

let db = null

// We register our own local: protocol, which behaves like file:, to allow
//  the renderer window to play videos directly from the filesystem.
//  The given path must be absolute, and not escaped after the prefix.
function registerLocalProtocol() {
  protocol.registerFileProtocol('local', (request, callback) => {
    const path = request.url.substr(8); // strip off local:// prefix
    const decodedPath = decodeURI(path); // this makes utf-8 filenames work, I'm not sure it's correct
    callback(decodedPath);
  }, (error) => {
    if (error) console.error('Failed to register protocol');
  })
}

function addIpcHandlers() {
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

  ipcMain.on('choose-directory', (event, prompt) => {
    dialog.showOpenDialog({
      title: prompt,
      buttonLabel: 'Choose',
      properties: ['openDirectory'],
    }, files => {
      if (files && files.length) {
        const fn = files[0];
        mainWindow.send('chose-directory', fn)
      }
    });
  });

  ipcMain.on('open-devtools', () => {
    mainWindow.webContents.openDevTools();
  });
}

function resolveHtmlPath(htmlFileName) {
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 4545;
      const url = new URL(`http://localhost:${port}`);
      url.pathname = htmlFileName;
      return url.href;
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      //nodeIntegration: true,
      //enableRemoteModule: true,
      //nodeIntegrationInWorker: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
      //allowRunningInsecureContent: (serve) ? true : false
    }
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Open the DevTools in dev, or if flag is passed
  if ((process.env.NODE_ENV === 'development') || process.argv.includes('--devtools')) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

const menuTemplate = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' },
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' },
    ]
  },
];

if (process.platform === 'darwin') {
  menuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ]
  })

  menuTemplate[2].submenu = [
    { role: 'minimize' },
    { role: 'zoom' },
  ];
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  registerLocalProtocol();
  addIpcHandlers();

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(null); // for win/linux, but should be ignored on mac

  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

async function dbInitialize(dbFilename)
{
  db = await sqlite.open({
  filename: dbFilename,
  driver: sqlite3.Database
})

  // Table for most of the application data.
  await db.run('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');

  // Table for tracking seen/known/etc. words.
  await db.run('CREATE TABLE IF NOT EXISTS words (word TEXT PRIMARY KEY, data TEXT)');
}

ipcMain.handle('openDevTools', () =>
  mainWindow.webContents.openDevTools()
)

ipcMain.handle('appGetAppPath', () => {
  return path.join(app.getAppPath(), "app") 
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

ipcMain.handle('dbInitialize', async (event, dbFilename) => {
    return await dbInitialize(dbFilename)
})

ipcMain.handle('dbRun', async (event, ...args) => {
    return await db.run(...args)
})

ipcMain.handle('dbGet', async (event, ...args) => {
    return await db.get(...args)
})

ipcMain.handle('dbAll', async (event, ...args) => {
    return await db.all(...args)
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
    return await path.basename(...args)
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
    return execFile(...args);
})

ipcMain.handle('childProcessSpawn', (event, ...args) => {
    return spawn(...args);
})

ipcMain.handle('tmpFile', async (event, ...args) => {
    return await tmp.file(...args)
})

ipcMain.handle('getSubData', (event, filename) => {
    const rawData = fs.readFileSync(filename);
    const encodingGuess = jschardet.detect(rawData.toString('binary'));
    console.log('loadSubtitleTrackFromFile guessed encoding', encodingGuess);
    return iconv.decode(rawData, encodingGuess.encoding);
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
