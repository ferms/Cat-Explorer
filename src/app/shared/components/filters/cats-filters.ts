import { Component, inject, output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

type Topic = { label: string; value: string };
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
          [options]="topics"
          optionLabel="label"
          optionValue="value"
          placeholder="TOPIC"
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
export class CatsFiltersComponent {
  qChange = output<string>();
  topicsChange = output<string[]>();
  sortChange = output<'az' | 'za' | 'pop'>();

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    q: [''],
    topics: [[] as string[]],
    sort: ['az' as Sort['value']],
  });

  topics: Topic[] = [
    { label: 'Active', value: 'active' },
    { label: 'Calm', value: 'calm' },
    { label: 'Family', value: 'family' },
  ];

  sorts: Sort[] = [
    { label: 'Name (A-Z)', value: 'az' },
    { label: 'Name (Z-A)', value: 'za' },
    { label: 'Popularity', value: 'pop' },
  ];

  ngOnInit() {
    this.form.controls.q.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(v => this.qChange.emit(String(v ?? '')));

    this.form.controls.topics.valueChanges.subscribe(v => this.topicsChange.emit(v ?? []));
    this.form.controls.sort.valueChanges.subscribe(v => this.sortChange.emit((v ?? 'az') as any));
  }
}
