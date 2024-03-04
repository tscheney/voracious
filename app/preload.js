//const channel = require("node:diagnostics_channel");
const tmpPromise = require("tmp-promise");
const { spawn, execFile } = require('node:child_process'); // const { execFile } = window.require('child_process');
const fs = require('fs'); // window.require('fs-extra');
const path = require('path');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const shell = require('electron').shell;

const {
    app,
    ipcRenderer,
    contextBridge,
    process,
    BrowserWindow,
} = require("electron");



// Expose protected methods off of window (ie.
// window.api.sendToA) in order to use ipcRenderer
// without exposing the entire object
// contextBridge.exposeInMainWorld("api", {
//     sendToA: function(){
//         ipcRenderer.send("A");
//     },
//     receiveFromD: function(func){{
//         ipcRenderer.on("D", (event, ...args) => func(event, ...args));       
//     },
//     receivePlatform: function
// });

contextBridge.exposeInMainWorld('api', {
    // openDevTools: () => ipcRenderer.invoke('openDevTools'),
    // // app
    // fromAppGetAppPath: () => ipcRenderer.invoke('appGetAppPath'),
    // fromAppGetPath: async (name) => ipcRenderer.invoke('fromAppGetPath', name ),
    // dbInitialize: async (dbFilename) => ipcRenderer.invoke('dbInitialize', (dbFilename)),
    // dbRun: async (command, value, key) => ipcRenderer.invoke('dbRun', (command, value, key) ),
    // dbGet: async (command, key) => ipcRenderer.invoke('dbGet', (event, ...args) ),
    // dbAll: async (command, keys) => ipcRenderer.invoke('dbAll', (command, keys) ),
            send: (channel, data) => {
                // whitelist channels
                //let validChannels = ["toMain"];
                //if (validChannels.includes(channel)) {
                    ipcRenderer.send(channel, data);
                //}
            },
            receive: (channel, func) => {
                //let validChannels = ["fromMain"];
                //if (validChannels.includes(channel)) {
                    // Deliberately strip event as it includes `sender` 
                    ipcRenderer.on(channel, (event, ...args) => func(...args));
                //}
            },
            // From render to main and back again.
            invoke: (channel, ...args) => {
                //let validChannels = ipc.render.sendReceive;
                //if (validChannels.includes(channel)) {
                    return ipcRenderer.invoke(channel, ...args);
                //}
            }
        }
    );


contextBridge.exposeInMainWorld('app', {
    getAppPath: () => app.getAppPath(),
    getPath: (name) => app.getPath(name),
    getVersion: () => app.getVersion(),
    //electron: () => process.versions.electron
    // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args)
    
});

contextBridge.exposeInMainWorld('process', {
    platform: () => process.platform,
    argv: () => process.argv,
});

contextBridge.exposeInMainWorld('tmpPromise', {
    file: (options) => tmpPromise.file(options),
});

contextBridge.exposeInMainWorld('childProcess', {
    spawn: (command, args, options) => spawn(command, args, options),
    execFile: (file) => execFile(file),
});

contextBridge.exposeInMainWorld('fs', {
    readFile: (path) => fs.readFile(path),
    readdir: (path) => fs.readdir(path),
    stat: (path) => fs.stat(path),
    existsSync: (path) => fs.existsSync(path),
    ensureDir: (path) => fs.ensureDir(path),
    unlink: (path) => fs.unlink(path),
});

contextBridge.exposeInMainWorld('path', {
    parse: (path) => path.parse(path),
    join: (paths) => path.join(paths),
});


contextBridge.exposeInMainWorld('sqlite', {
    open: (config) => sqlite.open(config),
});

contextBridge.exposeInMainWorld('sqlite3', {
    Database: () => sqlite3.Database,
});

contextBridge.exposeInMainWorld('shell', {
    openExternal: (url) => shell.openExternal(url),
});


// contextBridge.exposeInMainWorld('webContents', {
//     openDevTools: () => mainWindow.webContents.openDevTools(),
// });