import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data: any) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>; // <-- Adicione esta linha
    };
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'angular-electron-multipage-template';

  ngOnInit() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      console.log(window.electronAPI)
    }
  }
}
