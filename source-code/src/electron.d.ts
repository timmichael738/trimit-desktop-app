export interface IElectronAPI {
  openInBrowser: (url: string) => void;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}