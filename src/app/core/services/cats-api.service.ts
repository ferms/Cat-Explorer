import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@core/environments/environments';
import { CatBreed, CatBreedTableRow, CatImage } from '@core/models/cat';


@Injectable({ providedIn: 'root' })
export class CatsApiService {
  private readonly http = inject(HttpClient);

  private url(path: string) {
    return `${environment.api.base}${path}`;
  }

  getBreeds() {
    return this.http.get<CatBreed[]>(this.url(environment.api.cats.breeds));
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
}
