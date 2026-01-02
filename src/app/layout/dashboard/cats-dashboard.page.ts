import { Component, inject } from '@angular/core';
import { CatsCardComponent } from '@shared/components/cards/cats-card';
import { CatsFiltersComponent } from '@shared/components/filters/cats-filters';
import { Router } from '@angular/router';
import { CatsStore } from '@core/services/cats-store.service';

@Component({
  standalone: true,
  imports: [CatsCardComponent, CatsFiltersComponent],
  template: `
    <section class="px-8 py-10 space-y-10 max-w-7xl mx-auto">
      <header class="space-y-4 max-w-3xl">
        <h1 class="text-5xl font-extrabold tracking-tight">Discover cat breeds</h1>
        <p class="text-lg text-gray-600">
          Explore detailed information about different cat breeds and find your perfect companion.
        </p>
      </header>

      <cats-filters
        (qChange)="store.setSearch($event)"
        (sortChange)="store.setSort($event)"
        (topicsChange)="store.setTopics($event)"
      />

      <section class="pt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        @for (cat of store.filteredBreeds(); track cat.id) {
          <cats-card
            [title]="cat.name"
            [subtitle]="cat.subtitle"
            [image]="cat.image || '/assets/img/cats/placeholder.jpg'"
            (click)="goToDetail(cat.id)"
          />
        }
      </section>
    </section>
  `,
})
export class CatsDashboardPage  {
  readonly store = inject(CatsStore);
  private readonly router = inject(Router);

  ngOnInit() {
    this.store.loadBreeds();
  }

  goToDetail(id: string) {
    this.router.navigate(['/cats', id]);
  }
}
