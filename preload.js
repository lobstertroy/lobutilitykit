const { contextBridge, ipcRenderer } = require("electron");

//define what API functions do in preload.js for use elsewhere
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },
  hash: (data) => {
    let hash = 0;
    if (data.length === 0) return hash;
    for (let i = 0; i < data.length; i++) {
      hash = (hash * 31) + data.charCodeAt(i);
    }
    return hash;
  }
});
