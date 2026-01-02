import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CarouselModule } from 'primeng/carousel';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { CatsApiService } from '@core/services/cats-api.service';
import { CatBreed, CatImage } from '@core/models/cat';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    ChipModule,
    TagModule,
    RatingModule,
    FormsModule,
    ButtonModule,
    SkeletonModule,
    ProgressSpinnerModule,
  ],
   templateUrl: './cats-detail.page.html',
})
export class CatDetailPage implements OnInit {
  private readonly api = inject(CatsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);

  breed = signal<CatBreed | null>(null);
  images = signal<CatImage[]>([]);

  temperaments = computed(() => {
    const t = this.breed()?.temperament || '';
    return t
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 10);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing breed id.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      breed: this.api.getBreedById(id),
      images: this.api.getBreedImages(id, 10),
    })
      .pipe(
        catchError((err) => {
          const msg = err?.error?.message || 'Could not load breed detail.';
          this.error.set(msg);
          return of({ breed: null, images: [] as CatImage[] });
        })
      )
      .subscribe((res) => {
        this.breed.set(res.breed);
        this.images.set(res.images || []);
        this.loading.set(false);
      });
  }

  goBack() {
    this.router.navigate(['/cats']);
  }
  goTable() {
  this.router.navigate(['/cats/table']);
}

}
