import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

// Interface representing a window group
export interface windowGroup {
    name: string, // Group name
    maxWindows: number, // Maximum number of windows allowed in the group
    windows: Record<string, BrowserWindow> // Dictionary of group windows, indexed by name
    windowsOrder: string[] // Insertion order of window names (for FIFO)
    forcefirstClose: boolean // If true, closes the first window when trying to create beyond the limit
}

// Interface for window creation options, extending Electron's default options
interface CreateWindowOptions extends BrowserWindowConstructorOptions {
    type?: 'url' | 'file' | 'html'; // Type of content to be loaded
    url?: string; // URL to be loaded, if type is 'url'
    file?: string; // File path to be loaded, if type is 'file'
    html?: string; // Direct HTML to be loaded, if type is 'html'
    openDevTools?: boolean; // If true, opens DevTools automatically
    timeoutMs?: number; // Time in ms to automatically close the window
    disableMenu?: boolean; // If true, removes the window menu
    customMenu?: Electron.Menu; // Custom menu for the windo
}

// Helper type for content
export type contentType = 'url' | 'file'

// Singleton service to manage multiple windows and groups
class MultiWindowBrowserService {
    private static instance: MultiWindowBrowserService // Singleton unique instance
    private windowGroups: Record<string, windowGroup> = {} // All window groups

    // Private constructor to ensure Singleton pattern
    private constructor() { }

    // Method to get the unique service instance
    public static getInstance(): MultiWindowBrowserService {
        if (!MultiWindowBrowserService.instance) MultiWindowBrowserService.instance = new MultiWindowBrowserService();
        return MultiWindowBrowserService.instance
    }

    // Searches for a window by name globally (across all groups)
    private findWindow(windowName: string): BrowserWindow | undefined {
        for (const groupName in this.windowGroups) {
            const group = this.windowGroups[groupName]
            if (windowName in group.windows) {
                return group.windows[windowName]
            }
        }
        return undefined
    }

    // Creates a new window group
    createGroup(
        name: string,
        maxWindows?: number,
        forcefirstClose?: boolean,
        windows?: { windowname: string, window: BrowserWindow }[]
    ) {
        // Group name validation
        if (!name || name.trim() === '') {
            throw new Error('invalid name')
        }

        // Initial window count validation, if provided
        if (maxWindows &&
            windows &&
            !forcefirstClose &&
            windows.length > maxWindows) {
            throw new Error('number of windows in list greater than maxWindows number')
        }

        // Creates the group if it doesn't exist yet
        if (!this.windowGroups[name]) {
            this.windowGroups[name] = {
                name: name,
                maxWindows: maxWindows ?? 1,
                forcefirstClose: forcefirstClose ?? false,
                windows: {},
                windowsOrder: []
            }
        }

        // Reserved space for existing window migration logic (future implementation)
        if (windows && windows.length > 0) {
            // Future implementation
        }
    }

    // Creates a new window in a specific group
    public createWindow(
        groupName: string,
        windowName: string,
        options: CreateWindowOptions
    ): BrowserWindow {
        console.log(options.webPreferences?.preload)
        // Validates if the group exists
        if (!this.windowGroups[groupName]) {
            throw new Error('group not exist')
        }

        // Validates if the window name already exists globally
        if (this.findWindow(windowName)) {
            throw new Error('window (' + windowName + ') already exist')
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
            } else {
                throw new Error('Max windows reached for this group');
            }
        }

        // Creates the new Electron window
        const window = new BrowserWindow(options);

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
            window.setMenu(options.customMenu)
        }

        // Adds the window to the group and records the insertion order
        this.windowGroups[groupName].windows[windowName] = window
        this.windowGroups[groupName].windowsOrder.push(windowName)

        // Returns the created window instance
        return window
    }

    // Searches for a window by name globally
    public getWindowByName(windowName: string): BrowserWindow | undefined {
        return this.findWindow(windowName)
    }

    // Searches for a window by insertion index within a group
    public getWindowByIndex(groupName: string, index: number): BrowserWindow | undefined {
        if (!this.windowGroups[groupName] || this.windowGroups[groupName].windowsOrder.length <= 0) {
            return undefined
        }
        const windowKey = this.windowGroups[groupName].windowsOrder[index]
        return this.windowGroups[groupName].windows[windowKey]
    }
}

// Exports the service for use in other files
export default MultiWindowBrowserService