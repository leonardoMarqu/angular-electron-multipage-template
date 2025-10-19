import { app, globalShortcut } from 'electron';
import MultiWindowBrowserService from './services/multiWindowService';
import * as path from 'path';

// Singleton instance of the window management service
const windowService = MultiWindowBrowserService.getInstance();

// Checks if running in development mode (--serve)
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

if (serve) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    console.log('teste hot reload');
    require('electron-reloader')(module);
  } catch (err) {
    console.error('Falha ao iniciar o electron-reloader', err);
  }
}

// When Electron is ready, creates the main window
app.on('ready', () => {
  // Creates a window group called 'main' with a limit of 1 window
  windowService.createGroup('main', 1, true);

  if (serve) {
    // Development mode: loads from Angular server (localhost:4200)
    windowService.createWindow('main', 'main1', {
      width: 800,
      height: 600,
      type: 'url',
      url: 'http://localhost:4200',
      openDevTools: true, // Opens DevTools automatically in dev
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // Preload script for IPC
        contextIsolation: true, // Security: isolates preload context
        nodeIntegration: false, // Security: disables Node.js in renderer
      },
    });
  } else {
    // Production mode: loads from built HTML file
    const path = require('path');
    const indexPath = path.join(__dirname, '../../index.html'); // Path to the built index.html

    windowService.createWindow('main', 'main1', {
      width: 800,
      height: 600,
      type: 'file',
      file: indexPath,
      openDevTools: true, // Can remove in production if desired
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
  }

  const window = windowService.getWindowByIndex('main', 0);

  if (serve) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (window && window.webContents) {
        if (window.webContents.isDevToolsOpened()) {
          window.webContents.closeDevTools();
        } else {
          window.webContents.openDevTools({ mode: 'undocked' }); // Abre em janela separada
        }
      }
    });
  }
});

// When all windows are closed
app.on('window-all-closed', () => {
  // On macOS, apps usually stay active even without windows
  if (process.platform !== 'darwin') {
    console.log('App quit');
    app.quit();
  }
});

app.on('activate', () => {
  // If no windows are open, recreates the main window (default macOS behavior)
  if (windowService.getWindowByName('main1') === undefined) {
    // Creates a window group called 'main' with a limit of 1 window
    windowService.createGroup('main', 1, true);

    if (serve) {
      // Development mode: loads from Angular server (localhost:4200)
      windowService.createWindow('main', 'main1', {
        width: 800,
        height: 600,
        type: 'url',
        url: 'http://localhost:4200',
        openDevTools: true, // Opens DevTools automatically in dev
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'), // Preload script for IPC
          contextIsolation: true, // Security: isolates preload context
          nodeIntegration: false, // Security: disables Node.js in renderer
        },
      });
    } else {
      // Production mode: loads from built HTML file
      const path = require('path');
      const indexPath = path.join(__dirname, '../../index.html'); // Path to the built index.html

      windowService.createWindow('main', 'main1', {
        width: 800,
        height: 600,
        type: 'file',
        file: indexPath,
        openDevTools: true, // Can remove in production if desired
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
        },
      });
    }
  }
});
