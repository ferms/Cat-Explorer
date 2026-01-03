import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AppToolbarComponent } from "@shared/toolbar/app-toolbar";
import { AppFooter } from "@shared/footer/app-footer";

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, AppToolbarComponent, AppFooter],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent {}
