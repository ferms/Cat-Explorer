// src/app/core/services/cats-store.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CatsStore } from './cats-store.service';
import { CatsApiService } from './cats-api.service';
import { CatBreed } from '@core/models/cat';

describe('CatsStore', () => {
  let store: CatsStore;
  let api: { getBreeds: ReturnType<typeof vi.fn> };

  const mockBreeds: CatBreed[] = [
    { id: 'abys', name: 'Abyssinian' } as CatBreed,
  ];

  beforeEach(() => {
    api = {
      getBreeds: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CatsStore,
        { provide: CatsApiService, useValue: api },
      ],
    });

    store = TestBed.inject(CatsStore);
  });

  it('should load breeds successfully', async () => {
    api.getBreeds.mockReturnValue(
      of({ data: mockBreeds, total: 1 })
    );

    await store.loadBreeds();

    expect(store.isLoading()).toBe(false);
    expect(store.breeds()).toEqual(mockBreeds);
    expect(store.total()).toBe(1);
    expect(store.status()).toBe('success');
  });

  it('should handle error when loading breeds', async () => {
    api.getBreeds.mockReturnValue(
      throwError(() => ({ message: 'API error' }))
    );

    await store.loadBreeds();

    expect(store.status()).toBe('error');
    expect(store.error()).toBe('API error');
  });

  it('setSearch should reset page and reload breeds', async () => {
    api.getBreeds.mockReturnValue(
      of({ data: [], total: 0 })
    );

    store.pageIndex.set(3);

    await store.setSearch('sib');

    expect(store.q()).toBe('sib');
    expect(store.pageIndex()).toBe(0);
    expect(api.getBreeds).toHaveBeenCalled();
  });

  it('setPage should update pageIndex and reload', async () => {
    api.getBreeds.mockReturnValue(
      of({ data: [], total: 0 })
    );

    await store.setPage(2);

    expect(store.pageIndex()).toBe(2);
    expect(api.getBreeds).toHaveBeenCalled();
  });
});
