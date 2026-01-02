import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AppToolbarComponent } from "@shared/toolbar/app-toolbar";

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, AppToolbarComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent {}
