import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './app-footer.html',
  styleUrl: './app-footer.scss',
})
export class AppFooter implements AfterViewInit {
  @ViewChild('vid', { static: false }) vidRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('cvs', { static: false }) cvsRef!: ElementRef<HTMLCanvasElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const video = this.vidRef.nativeElement;
    const canvas = this.cvsRef.nativeElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);
    this.destroyRef.onDestroy(stop);

    const render = () => {
   
      if (video.readyState < 2) {
        raf = requestAnimationFrame(render);
        return;
      }


      const w = video.videoWidth || 0;
      const h = video.videoHeight || 0;
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);


      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = frame.data;


      const BLACK_T = 35; 
      const BLUE_T = 60;  

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];

        if (r < BLACK_T && g < BLACK_T && b < BLACK_T) {
          d[i + 3] = 0;
          continue;
        }


        if (b > 200 && r < BLUE_T && g < 120) {
          d[i + 3] = 0;
        }
      }

      ctx.putImageData(frame, 0, 0);

      raf = requestAnimationFrame(render);
    };

    video.play().catch(() => {});
    raf = requestAnimationFrame(render);
  }
}
