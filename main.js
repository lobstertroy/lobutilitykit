const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const path = require("path");
const Store = require("electron-store");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableremoteModule: false,
    },
  });

  win.loadFile("dist/index.html");
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  const store = new Store();

  ipcMain.handle("store-test-key", (event, apiKey) => {
    const encryptedKeyBuffer = safeStorage.encryptString(apiKey);
    store.set("myTestKey", encryptedKeyBuffer.toString("hex"));
    return true;
  });

  ipcMain.handle("retrieve-test-key", () => {
    const encryptedKeyHex = store.get("myTestKey");
    if (encryptedKeyHex) {
      const encryptedKeyBuffer = Buffer.from(encryptedKeyHex, "hex");
      return safeStorage.decryptString(encryptedKeyBuffer);
    }
    return null;
  });

  ipcMain.handle("store-live-key", (event, apiKey) => {
    const encryptedKeyBuffer = safeStorage.encryptString(apiKey);
    store.set("myLiveKey", encryptedKeyBuffer.toString("hex"));
    return true;
  });

  ipcMain.handle("retrieve-live-key", () => {
    const encryptedKeyHex = store.get("myLiveKey");
    if (encryptedKeyHex) {
      const encryptedKeyBuffer = Buffer.from(encryptedKeyHex, "hex");
      return safeStorage.decryptString(encryptedKeyBuffer);
    }
    return null;
  });

  console.log(window.api);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
