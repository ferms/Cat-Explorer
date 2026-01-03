import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CatDetailPage } from './cats-detail.page';
import { CatsApiService } from '@core/services/cats-api.service';
import { CatBreed, CatImage } from '@core/models/cat';

describe('CatDetailPage', () => {
  let api: {
    getBreedById: ReturnType<typeof vi.fn>;
    getBreedImages: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = {
      getBreedById: vi.fn(),
      getBreedImages: vi.fn(),
    };

    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CatDetailPage],
      providers: [
        { provide: CatsApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'abys' : null),
              },
            },
          },
        },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('should load breed and images on init', () => {
    const mockBreed = { id: 'abys', name: 'Abyssinian' } as CatBreed;
    const mockImages = [{ id: '1', url: 'img.jpg' }] as CatImage[];

    api.getBreedById.mockReturnValue(of(mockBreed));
    api.getBreedImages.mockReturnValue(of(mockImages));

    const fixture = TestBed.createComponent(CatDetailPage);
    fixture.detectChanges(); // ngOnInit → load()

    const comp = fixture.componentInstance;

    expect(api.getBreedById).toHaveBeenCalledWith('abys');
    expect(api.getBreedImages).toHaveBeenCalledWith('abys', 10);

    expect(comp.breed()).toEqual(mockBreed);
    expect(comp.images()).toEqual(mockImages);
    expect(comp.loading()).toBe(false);
    expect(comp.error()).toBeNull();
  });

  it('should set error when id is missing', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      imports: [CatDetailPage],
      providers: [
        { provide: CatsApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
          },
        },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CatDetailPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    expect(comp.error()).toBe('Missing breed id.');
    expect(comp.loading()).toBe(false);
  });

  it('should handle API error gracefully', () => {
    api.getBreedById.mockReturnValue(
      throwError(() => ({ error: { message: 'API error' } }))
    );
    api.getBreedImages.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(CatDetailPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    expect(comp.error()).toBe('API error');
    expect(comp.loading()).toBe(false);
    expect(comp.breed()).toBeNull();
  });

  it('goBack should navigate to cats list', () => {
    const fixture = TestBed.createComponent(CatDetailPage);
    const comp = fixture.componentInstance;

    comp.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/app/cats']);
  });

  it('goTable should navigate to table with query param', () => {
    const fixture = TestBed.createComponent(CatDetailPage);
    const comp = fixture.componentInstance;

    comp.breed.set({ id: 'abys' } as CatBreed);

    comp.goTable();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/app/cats/table'],
      { queryParams: { from: 'abys' } }
    );
  });
});
