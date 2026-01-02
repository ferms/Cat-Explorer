import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'cats-card',
  template: `
<article
  class="group cursor-pointer rounded-3xl bg-slate-50 overflow-hidden
         shadow-sm hover:shadow-xl transition-all duration-300"
>
  <div class="relative h-56 overflow-hidden">
    <img
      [src]="image"
      [alt]="title"
      loading="lazy"
      class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
  </div>

  <div class="p-6 space-y-2">
    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      Cat Breed
    </span>

    <h3 class="text-xl font-bold text-slate-900 leading-tight">
      {{ title }}
    </h3>

    <p class="text-slate-600">
      {{ subtitle }}
    </p>
  </div>
</article>

  `,
})
export class CatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input() image = '';
}
