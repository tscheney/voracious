const {
    ipcRenderer,
    contextBridge,
} = require("electron");

contextBridge.exposeInMainWorld('api', {
            send: (channel, data) => {
                // whitelist channels
                //let validChannels = ["toMain"];
                //if (validChannels.includes(channel)) {
                    ipcRenderer.send(channel, data);
                //}
            },
            receive: (channel, func) => {
                //if (Object.values(CONTENT_EVENTS.E2C).includes(channel)) {
                  // Deliberately strip event as it includes `sender` 
                  const subscription = (event, ...args) => func(...args);
                  ipcRenderer.on(channel, subscription);
                  return () => {
                    ipcRenderer.removeListener(channel, subscription);
                  }
                //}
            },
            // From render to main and back again.
            invoke: (channel, ...args) => {
                //let validChannels = ipc.render.sendReceive;
                //if (validChannels.includes(channel)) {
                    return ipcRenderer.invoke(channel, ...args);
                //}
            },
            openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config)
        }
    );
