import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import type { PaginatorState } from 'primeng/paginator';

import { CatsDashboardPage } from './cats-dashboard.page';
import { CatsStore } from '@core/services/cats-store.service';

type CatsStoreMock = Pick<
  CatsStore,
  | 'loadBreeds'
  | 'setPageSize'
  | 'setPage'
  | 'setSearch'
  | 'setBreedIds'
  | 'setSort'
  | 'isLoading'
  | 'viewBreeds'
  | 'total'
  | 'page'
  | 'pageSize'
>;

describe('CatsDashboardPage', () => {
  let store: CatsStoreMock;
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
      total: signal(0),

      // si tu CatsStore real expone page/pageSize como signals:
      page: signal(1),
      pageSize: signal(9),
    } as unknown as CatsStoreMock;

    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CatsDashboardPage],
      providers: [
        { provide: CatsStore, useValue: store },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('calls store.loadBreeds on creation', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    fixture.detectChanges();
    expect(store.loadBreeds).toHaveBeenCalledTimes(1);
  });

  it('onPage sets page size and page correctly', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    const comp = fixture.componentInstance;

    const e: PaginatorState = { rows: 20, page: 0 };
    comp.onPage(e);

    expect(store.setPageSize).toHaveBeenCalledWith(20);
    expect(store.setPage).toHaveBeenCalledWith(1);
  });

  it('onPage still sets page even if rows is missing', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    const comp = fixture.componentInstance;

    const e: PaginatorState = { page: 2 }; // 0-based => 3
    comp.onPage(e);

    expect(store.setPage).toHaveBeenCalledWith(3);
  });

  it('goToDetail navigates to breed detail', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    fixture.componentInstance.goToDetail('abys');
    expect(router.navigate).toHaveBeenCalledWith(['/app/cats', 'abys']);
  });

  it('clearAll resets filters and page', () => {
    const fixture = TestBed.createComponent(CatsDashboardPage);
    fixture.componentInstance.clearAll();

    expect(store.setSearch).toHaveBeenCalledWith('');
    expect(store.setBreedIds).toHaveBeenCalledWith([]);
    expect(store.setSort).toHaveBeenCalledWith('az');
    expect(store.setPage).toHaveBeenCalledWith(1);
  });
});
