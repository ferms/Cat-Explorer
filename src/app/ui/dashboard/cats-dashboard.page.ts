import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';

import { CatsCardComponent } from '@shared/components/cards/cats-card';
import { CatsFiltersComponent } from '@shared/components/filters/cats-filters';
import { CatsStore } from '@core/services/cats-store.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  standalone: true,
  imports: [CatsCardComponent, CatsFiltersComponent, PaginatorModule, SkeletonModule],
   templateUrl: './cats-dashboard.page.html',
})
export class CatsDashboardPage implements OnInit {
  readonly store = inject(CatsStore);
  private readonly router = inject(Router);

  ngOnInit() {
    this.store.loadBreeds();
  }

  onPage(e: any) {
    this.store.setPageSize(e.rows);
    this.store.setPage(e.page + 1);
  }

  goToDetail(id: string) {
    console.log('%c⧭', 'color: #1eff00', id);
    this.router.navigate(['/cats', id]);
  }
}
