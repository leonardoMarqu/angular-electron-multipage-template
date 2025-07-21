"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('preload carregado');
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
    on: (channel, callback) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
        electron_1.ipcRenderer.on(channel, callback);
    },
    invoke: (channel, ...args) => electron_1.ipcRenderer.invoke(channel, ...args)
});
//# sourceMappingURL=preload.js.map