import { contextBridge, ipcRenderer } from "electron";

console.log('preload carregado')
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeAllListeners(channel);
    ipcRenderer.on(channel, callback);
  },
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
});