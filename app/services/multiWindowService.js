"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Singleton service to manage multiple windows and groups
class MultiWindowBrowserService {
    // Private constructor to ensure Singleton pattern
    constructor() {
        this.windowGroups = {}; // All window groups
    }
    // Method to get the unique service instance
    static getInstance() {
        if (!MultiWindowBrowserService.instance)
            MultiWindowBrowserService.instance = new MultiWindowBrowserService();
        return MultiWindowBrowserService.instance;
    }
    // Searches for a window by name globally (across all groups)
    findWindow(windowName) {
        for (const groupName in this.windowGroups) {
            const group = this.windowGroups[groupName];
            if (windowName in group.windows) {
                return group.windows[windowName];
            }
        }
        return undefined;
    }
    // Creates a new window group
    createGroup(name, maxWindows, forcefirstClose, windows) {
        // Group name validation
        if (!name || name.trim() === '') {
            throw new Error('invalid name');
        }
        // Initial window count validation, if provided
        if (maxWindows &&
            windows &&
            !forcefirstClose &&
            windows.length > maxWindows) {
            throw new Error('number of windows in list greater than maxWindows number');
        }
        // Creates the group if it doesn't exist yet
        if (!this.windowGroups[name]) {
            this.windowGroups[name] = {
                name: name,
                maxWindows: maxWindows !== null && maxWindows !== void 0 ? maxWindows : 1,
                forcefirstClose: forcefirstClose !== null && forcefirstClose !== void 0 ? forcefirstClose : false,
                windows: {},
                windowsOrder: []
            };
        }
        // Reserved space for existing window migration logic (future implementation)
        if (windows && windows.length > 0) {
            // Future implementation
        }
    }
    // Creates a new window in a specific group
    createWindow(groupName, windowName, options) {
        var _a;
        console.log((_a = options.webPreferences) === null || _a === void 0 ? void 0 : _a.preload);
        // Validates if the group exists
        if (!this.windowGroups[groupName]) {
            throw new Error('group not exist');
        }
        // Validates if the window name already exists globally
        if (this.findWindow(windowName)) {
            throw new Error('window (' + windowName + ') already exist');
        }
        const group = this.windowGroups[groupName];
        // Checks if the group has reached the window limit
        if (Object.keys(group.windows).length >= group.maxWindows) {
            if (group.forcefirstClose) {
                // Closes the first window (FIFO)
                const firstWindowName = group.windowsOrder[0];
                if (firstWindowName) {
                    group.windows[firstWindowName].close(); // The 'closed' listener removes from structure
                }
            }
            else {
                throw new Error('Max windows reached for this group');
            }
        }
        // Creates the new Electron window
        const window = new electron_1.BrowserWindow(options);
        // Listener to remove the window from the group when closed
        window.on('closed', () => {
            delete this.windowGroups[groupName].windows[windowName];
            const index = this.windowGroups[groupName].windowsOrder.indexOf(windowName);
            if (index > -1) {
                this.windowGroups[groupName].windowsOrder.splice(index, 1);
            }
        });
        // Loads content according to the specified type
        if (options.type === 'html' && options.html) {
            window.loadURL('data:text/html,' + encodeURIComponent(options.html));
        }
        else if (options.type === 'url' && options.url) {
            window.loadURL(options.url);
        }
        else if (options.type === 'file' && options.file) {
            window.loadFile(options.file);
        }
        // Opens DevTools if requested
        if (options.openDevTools) {
            window.webContents.openDevTools();
        }
        // Automatically closes the window after the specified time, if provided
        if (options.timeoutMs) {
            setTimeout(() => window.close(), options.timeoutMs);
        }
        // Configures the window menu according to options
        if (options.disableMenu) {
            window.setMenu(null);
        }
        else if (options.customMenu) {
            window.setMenu(options.customMenu);
        }
        // Adds the window to the group and records the insertion order
        this.windowGroups[groupName].windows[windowName] = window;
        this.windowGroups[groupName].windowsOrder.push(windowName);
        // Returns the created window instance
        return window;
    }
    // Searches for a window by name globally
    getWindowByName(windowName) {
        return this.findWindow(windowName);
    }
    // Searches for a window by insertion index within a group
    getWindowByIndex(groupName, index) {
        if (!this.windowGroups[groupName] || this.windowGroups[groupName].windowsOrder.length <= 0) {
            return undefined;
        }
        const windowKey = this.windowGroups[groupName].windowsOrder[index];
        return this.windowGroups[groupName].windows[windowKey];
    }
}
// Exports the service for use in other files
exports.default = MultiWindowBrowserService;
//# sourceMappingURL=multiWindowService.js.map