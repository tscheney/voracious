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
