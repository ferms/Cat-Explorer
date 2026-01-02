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
  template: `
    <div class="cats-filters" [formGroup]="form">
      <div class="cats-filters__search">
        <i class="pi pi-search"></i>
        <input pInputText formControlName="q" placeholder="Search..." />
      </div>

      <div class="cats-filters__row">
        <p-multiSelect
          class="cats-filters__pill"
          formControlName="topics"
          [options]="breedOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="BREED"
          [filter]="true"
          filterPlaceholder="Search breed..."
          [showToggleAll]="false"
          [maxSelectedLabels]="1"
          display="chip"
        ></p-multiSelect>

        <p-select
          class="cats-filters__pill"
          formControlName="sort"
          [options]="sorts"
          optionLabel="label"
          optionValue="value"
          placeholder="NAME (A-Z)"
        ></p-select>
      </div>
    </div>
  `,
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
}
