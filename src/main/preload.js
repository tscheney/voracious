const {
    ipcRenderer,
    contextBridge,
} = require("electron");

contextBridge.exposeInMainWorld('api', {
            send: (channel, data) => {
                // whitelist channels
              let validChannels = [
                'openDevTools', 'toggleFullscreen', 'windowExit', 'tmpFileCleanup',
                'choose-video-file'
              ];
              if (validChannels.includes(channel)) {
                  ipcRenderer.send(channel, data);
              }
            },
            receive: (channel, func) => {
              let validChannels = [];
              if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                const subscription = (event, ...args) => func(...args);
                ipcRenderer.on(channel, subscription);
                return () => {
                  ipcRenderer.removeListener(channel, subscription);
                }
              }
            },
            // From render to main and back again.
            invoke: (channel, ...args) => {
              let validChannels = [
                'appGetAppPath', 'appGetPath', 'appGetVersion', 'processPlatform',
                'fsReadDirSync', 'fsStatIsDirectory', 'fsExistsSync', 'fsReadFileSync',
                'fsUnlinkSync', 'fsEnsureDirSync', 'processArgvIncludes', 'pathBasename',
                'pathJoin', 'pathExtname', 'pathParse', 'assert', 'shellOpenExternal',
                'childProcessExecFile', 'createMedia', 'tmpFile', 'getSubData', 'dialog',
                'dbInitialize', 'dbRun', 'dbGet', 'dbAll'
              ];
              if (validChannels.includes(channel)) {
                  return ipcRenderer.invoke(channel, ...args);
              }
            }
        }
    );
