import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { CatsApiService } from '@core/services/cats-api.service';
import { CatBreedTableRow } from '@core/models/cat';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './cats-table.page.html',
})
export class CatsTablePage implements OnInit {
  private readonly api = inject(CatsApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal<string | null>(null);

  rows = signal<CatBreedTableRow[]>([]);

  termDraft = signal('');
  appliedTerm = signal('');

  fromId = signal<string | null>(null);

  filtered = computed(() => {
    const t = this.appliedTerm().trim().toLowerCase();
    const data = this.rows();

    if (!t) return data;

    return data.filter(r =>
      `${r.name} ${r.origin ?? ''} ${r.life_span ?? ''} ${r.weight_metric ?? ''}`
        .toLowerCase()
        .includes(t)
    );
  });

  ngOnInit() {
    this.fromId.set(this.route.snapshot.queryParamMap.get('from'));

    this.api.getBreedsTable().subscribe({
      next: (data) => {
        this.rows.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Could not load table.');
        this.loading.set(false);
      },
    });
  }

  search() {
    this.appliedTerm.set(this.termDraft());
  }

  clear() {
    this.termDraft.set('');
    this.appliedTerm.set('');
  }

  goBack() {
    const from = this.fromId();
    this.router.navigate(from ? ['/app/cats', from] : ['/app/cats']);
  }

  isFrom(row: CatBreedTableRow) {
    return !!this.fromId() && row.id === this.fromId();
  }
}
