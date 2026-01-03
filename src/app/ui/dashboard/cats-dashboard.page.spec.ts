import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { CatsDashboardPage } from './cats-dashboard.page';
import { CatsStore } from '@core/services/cats-store.service';

describe('CatsDashboardPage', () => {
  let store: any;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    store = {
  
      loadBreeds: vi.fn(),
      setPageSize: vi.fn(),
      setPage: vi.fn(),
      setSearch: vi.fn(),
      setBreedIds: vi.fn(),
      setSort: vi.fn(),

  
      isLoading: signal(false),
      viewBreeds: signal([]),
      breeds: signal([]),
      total: signal(0),
      pageIndex: signal(0),
      pageSize: signal(9),
    };

    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CatsDashboardPage],
      providers: [
        { provide: CatsStore, useValue: store },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('should call store.loadBreeds on init', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    fixture.detectChanges(); 

    expect(store.loadBreeds).toHaveBeenCalledTimes(1);
  });

  it('onPage should set page size and page correctly', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    const comp = fixture.componentInstance;

    comp.onPage({ rows: 20, page: 0 });

    expect(store.setPageSize).toHaveBeenCalledWith(20);
    expect(store.setPage).toHaveBeenCalledWith(1);
  });

  it('goToDetail should navigate to breed detail', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    fixture.componentInstance.goToDetail('abys');

    expect(router.navigate).toHaveBeenCalledWith(['/app/cats', 'abys']);
  });

  it('clearAll should reset filters and page', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    fixture.componentInstance.clearAll();

    expect(store.setSearch).toHaveBeenCalledWith('');
    expect(store.setBreedIds).toHaveBeenCalledWith([]);
    expect(store.setSort).toHaveBeenCalledWith('az');
    expect(store.setPage).toHaveBeenCalledWith(1);
  });
});
