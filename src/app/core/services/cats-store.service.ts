// cats-store.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { CatsApiService } from './cats-api.service';
import { CatBreed } from '@core/models/cat';
import { firstValueFrom } from 'rxjs';

type Status = 'idle' | 'loading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class CatsStore {
  private readonly api = inject(CatsApiService);

  private readonly _status = signal<Status>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _breeds = signal<CatBreed[]>([]);

  // filtros
  readonly q = signal('');
  readonly sort = signal<'az' | 'za' | 'pop'>('az');
  readonly breedIds = signal<string[]>([]);

  // paginación
  readonly page = signal(1); 
  readonly pageIndex = signal(0);
  readonly pageSize = signal(9);
  readonly total = signal(0);

  // exposed
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly breeds = this._breeds.asReadonly();

  readonly viewBreeds = computed(() => this._breeds());

async loadBreeds() {
  this._status.set('loading');
  this._error.set(null);

  try {
    const res = await firstValueFrom(
      this.api.getBreeds({
         page: this.pageIndex() + 1,
        limit: this.pageSize(),
        q: this.q(),
        sort: this.sort(),
        breedIds: this.breedIds(),
      })
    );

    this._breeds.set(res.data);
    this.total.set(res.total);
    this._status.set('success');
  } catch (e: any) {
    this._status.set('error');
    this._error.set(e?.error?.message ?? e?.message ?? 'Error cargando razas');
  }
}

  setSearch(q: string) {
    this.q.set(q);
    this.pageIndex.set(0);
    void this.loadBreeds();
  }

  setSort(v: 'az' | 'za' | 'pop') {
    this.sort.set(v);
    this.pageIndex.set(0);
    void this.loadBreeds();
  }

setBreedIds(ids: string[]) {
  this.breedIds.set(ids);
  this.pageIndex.set(0);
  void this.loadBreeds();
}

  setPage(pageIndex: number) {
    this.pageIndex.set(pageIndex);
    void this.loadBreeds();
  }

  setPageSize(size: number) {
    this.pageSize.set(size);
    this.pageIndex.set(0);
    void this.loadBreeds();
  }
}
