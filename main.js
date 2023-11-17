const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  safeStorage,
  MenuItem,
} = require("electron");
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
}

function createHelpWindow() {
  let helpWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
    },
  });

  helpWindow.loadFile("dist/documentation/help.html");
}

app.whenReady().then(() => {
  const existingMenu = Menu.getApplicationMenu();
  let menuTemplate = existingMenu.items.map((menuItem) => menuItem);
  let helpMenuIndex = menuTemplate.findIndex((item) => item.role === "help");
  if (helpMenuIndex !== -1) {
    menuTemplate[helpMenuIndex].submenu.append(
      new MenuItem({
        label: "Open Help Document",
        click: () => {
          createHelpWindow();
        },
      })
    );
  } else {
    menuTemplate.push({
      label: "Help",
      submenu: [
        {
          label: "Open Help Document",
          click: () => {
            createHelpWindow();
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
