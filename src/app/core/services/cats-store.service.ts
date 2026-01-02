import { Injectable, computed, inject, signal } from '@angular/core';
import { CatsApiService } from './cats-api.service';
import { CatBreed, CatBreedTableRow, CatImage } from '@core/models/cat';
import { firstValueFrom } from 'rxjs';

type Status = 'idle' | 'loading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class CatsStore {
  private readonly api = inject(CatsApiService);

  // list
  private readonly _status = signal<Status>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _breeds = signal<CatBreed[]>([]);

  // detail
  private readonly _selectedBreed = signal<CatBreed | null>(null);
  private readonly _images = signal<CatImage[]>([]);
  private readonly _detailStatus = signal<Status>('idle');

  // table
  private readonly _table = signal<CatBreedTableRow[]>([]);
  private readonly _tableStatus = signal<Status>('idle');

  // filters (vista principal)
  readonly q = signal('');
  readonly sort = signal<'az' | 'za' | 'pop'>('az');
  readonly topics = signal<string[]>([]); // opcional, si luego filtras por ratings/temperament

  // exposed
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly breeds = this._breeds.asReadonly();

  readonly selectedBreed = this._selectedBreed.asReadonly();
  readonly images = this._images.asReadonly();
  readonly detailStatus = this._detailStatus.asReadonly();

  readonly table = this._table.asReadonly();
  readonly tableStatus = this._tableStatus.asReadonly();

  // computed: lista filtrada/ordenada para cards
  readonly filteredBreeds = computed(() => {
    const list = this._breeds();
    const q = this.q().trim().toLowerCase();
    const sort = this.sort();

    let out = q
      ? list.filter(b =>
          `${b.name} ${b.origin ?? ''} ${b.temperament ?? ''}`.toLowerCase().includes(q)
        )
      : list;

    out = [...out].sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name);
      if (sort === 'za') return b.name.localeCompare(a.name);

      const pa = (a.intelligence ?? 0) + (a.affection_level ?? 0);
      const pb = (b.intelligence ?? 0) + (b.affection_level ?? 0);
      return pb - pa;
    });

    return out;
  });

  // actions
  async loadBreeds() {
    this._status.set('loading');
    this._error.set(null);

    try {
      const breeds = await firstValueFrom(this.api.getBreeds());
      this._breeds.set(breeds);
      this._status.set('success');
    } catch (e: any) {
      this._status.set('error');
      this._error.set(e?.error?.message ?? e?.message ?? 'Error cargando razas');
    }
  }

  async loadBreedDetail(id: string) {
    this._detailStatus.set('loading');
    this._error.set(null);

    try {
      const [breed, images] = await Promise.all([
        firstValueFrom(this.api.getBreedById(id)),
        firstValueFrom(this.api.getBreedImages(id, 10)),
      ]);

      this._selectedBreed.set(breed);
      this._images.set(images);
      this._detailStatus.set('success');
    } catch (e: any) {
      this._detailStatus.set('error');
      this._error.set(e?.error?.message ?? e?.message ?? 'Error cargando detalle');
    }
  }

  async loadTable() {
    this._tableStatus.set('loading');
    this._error.set(null);

    try {
      const rows = await firstValueFrom(this.api.getBreedsTable());
      this._table.set(rows);
      this._tableStatus.set('success');
    } catch (e: any) {
      this._tableStatus.set('error');
      this._error.set(e?.error?.message ?? e?.message ?? 'Error cargando tabla');
    }
  }

  setSearch(q: string) {
    this.q.set(q);
  }

  setSort(v: 'az' | 'za' | 'pop') {
    this.sort.set(v);
  }

  setTopics(v: string[]) {
    this.topics.set(v);
  }

  clearDetail() {
    this._selectedBreed.set(null);
    this._images.set([]);
    this._detailStatus.set('idle');
  }
}
