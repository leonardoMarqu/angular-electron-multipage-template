import { contextBridge, ipcRenderer } from "electron";


contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: (...args: any[]) => void) => {
    // Remover listeners duplicados para evitar vazamento de memória
    ipcRenderer.removeAllListeners(channel); // <-- Adicione esta linha
    ipcRenderer.on(channel, callback);
  },
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
});