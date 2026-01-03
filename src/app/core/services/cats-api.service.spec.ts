
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { CatsApiService } from './cats-api.service';
import { environment } from '@core/environments/environments';

describe('CatsApiService', () => {
  let service: CatsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CatsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch breeds with filters and pagination', () => {
    service.getBreeds({
      page: 1,
      limit: 9,
      q: 'sib',
      sort: 'az',
      breedIds: ['abys'],
    }).subscribe();

    const req = httpMock.expectOne(
      r =>
        r.url === `${environment.api.base}${environment.api.cats.breeds}` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '9' &&
        r.params.get('q') === 'sib' &&
        r.params.get('sort') === 'az' &&
        r.params.get('breedIds') === 'abys'
    );

    expect(req.request.method).toBe('GET');
    req.flush({ data: [], total: 0 });
  });

  it('should fetch breed by id', () => {
    service.getBreedById('abys').subscribe();

    const req = httpMock.expectOne(
      `${environment.api.base}${environment.api.cats.breedById('abys')}`
    );

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should fetch breeds table', () => {
    service.getBreedsTable().subscribe();

    const req = httpMock.expectOne(
      `${environment.api.base}${environment.api.cats.breedsTable}`
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
