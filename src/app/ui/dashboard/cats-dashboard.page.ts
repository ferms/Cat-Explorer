import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatorModule, type PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';

import { CatsCardComponent } from '@shared/components/cards/cats-card';
import { CatsFiltersComponent } from '@shared/components/filters/cats-filters';
import { CatsStore } from '@core/services/cats-store.service';

@Component({
  standalone: true,
  imports: [CatsCardComponent, CatsFiltersComponent, PaginatorModule, SkeletonModule],
  templateUrl: './cats-dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatsDashboardPage {
  readonly store = inject(CatsStore);
  private readonly router = inject(Router);

  readonly skeletonItems = Array.from({ length: 9 }, (_, i) => i);
  readonly rowsPerPageOptions: number[] = [9, 18, 27];

  constructor() {
    effect(() => {
      this.store.loadBreeds();
    });
  }

  onPage({ rows, page }: PaginatorState): void {
    const nextPage = (page ?? 0) + 1;

    if (rows != null) this.store.setPageSize(rows);
    this.store.setPage(nextPage);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/app/cats', id]);
  }

  clearAll(): void {
    this.store.setSearch('');
    this.store.setBreedIds([]);
    this.store.setSort('az');
    this.store.setPage(1);
  }
}
