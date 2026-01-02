import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  template: `<router-outlet /> <p-toast />`,
})
export class App {
  protected readonly title = signal('cat-breeds-explorer');
}
