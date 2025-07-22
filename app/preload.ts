import { contextBridge, ipcRenderer } from "electron";

// Exposes the secure API in the renderer's global context (window.electronAPI)
contextBridge.exposeInMainWorld('electronAPI', {
  // Sends a message to the main process (fire-and-forget)
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),

  // Listens to events from the main process (listener)
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeAllListeners(channel); // Removes old listeners to avoid multiple executions
    ipcRenderer.on(channel, callback);
  },

  // Sends a message and waits for a response (Promise)
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
});