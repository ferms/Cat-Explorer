import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@core/environments/environments';
import { CatBreed, CatBreedTableRow, CatImage, CatsBreedsResponse } from '@core/models/cat';

type BreedOption = { label: string; value: string };

@Injectable({ providedIn: 'root' })
export class CatsApiService {
  private readonly http = inject(HttpClient);

  private url(path: string) {
    return `${environment.api.base}${path}`;
  }

  getBreeds(opts: {
    page: number;
    limit: number;
    q?: string;
    sort?: 'az' | 'za' | 'pop';
    breedIds?: string[];
  }) {
    let params = new HttpParams().set('page', opts.page).set('limit', opts.limit);

    if (opts.q?.trim()) params = params.set('q', opts.q.trim());
    if (opts.sort) params = params.set('sort', opts.sort);

    if (opts.breedIds?.length) {
      params = params.set('breedIds', opts.breedIds.join(','));
    }

    return this.http.get<CatsBreedsResponse>(this.url(environment.api.cats.breeds), { params });
  }

  searchBreeds(q: string) {
    const params = new HttpParams().set('q', q);
    return this.http.get<CatBreed[]>(this.url(environment.api.cats.breedsSearch), { params });
  }

  getBreedById(id: string) {
    return this.http.get<CatBreed>(this.url(environment.api.cats.breedById(id)));
  }

  getBreedImages(id: string, limit = 10) {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<CatImage[]>(this.url(environment.api.cats.breedImages(id)), { params });
  }

  getBreedsTable() {
    return this.http.get<CatBreedTableRow[]>(this.url(environment.api.cats.breedsTable));
  }

  getBreedOptions() {
    return this.http.get<BreedOption[]>(
      this.url(environment.api.cats.breedsOptions)
    );
  }
}
