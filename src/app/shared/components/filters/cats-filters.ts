import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatsApiService } from '@core/services/cats-api.service';

type BreedOption = { label: string; value: string };
type Sort = { label: string; value: 'az' | 'za' | 'pop' };

@Component({
  standalone: true,
  selector: 'cats-filters',
  encapsulation: ViewEncapsulation.None,
  imports: [ReactiveFormsModule, InputTextModule, MultiSelectModule, SelectModule],
  templateUrl: './cats-filters.html',
  styleUrls: ['./cats-filters.scss'],
})
export class CatsFiltersComponent implements OnInit {
  qChange = output<string>();
  breedIdsChange = output<string[]>();
  sortChange = output<'az' | 'za' | 'pop'>();

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CatsApiService);
  private readonly destroyRef = inject(DestroyRef);

  form = this.fb.group({
    q: [''],
    topics: [[] as string[]],
    sort: ['az' as Sort['value']],
  });

  breedOptions: BreedOption[] = [];

  sorts: Sort[] = [
    { label: 'Name (A-Z)', value: 'az' },
    { label: 'Name (Z-A)', value: 'za' },
    { label: 'Popularity', value: 'pop' },
  ];

  ngOnInit() {
    this.api
      .getBreedOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (opts) => (this.breedOptions = opts ?? []),
        error: () => (this.breedOptions = []),
      });

    this.form.controls.q.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(v => this.qChange.emit(String(v ?? '')));

    this.form.controls.topics.valueChanges.subscribe(v => this.breedIdsChange.emit(v ?? []));

    this.form.controls.sort.valueChanges.subscribe(v => this.sortChange.emit((v ?? 'az') as any));
  }

  hasActiveFilters(): boolean {
    const { q, topics, sort } = this.form.getRawValue();
    return (
      !!q?.trim() ||
      (topics?.length ?? 0) > 0 ||
      sort !== 'az'
    );
  }

  clearFilters() {
    this.form.reset(
      {
        q: '',
        topics: [],
        sort: 'az',
      },
      { emitEvent: false }
    );
    this.qChange.emit('');
    this.breedIdsChange.emit([]);
    this.sortChange.emit('az');
  }


}
