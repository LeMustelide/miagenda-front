import { Component, Input, OnChanges, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements OnChanges {
  @Input() progress = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    this.progress = Math.min(Math.max(this.progress, 0), 100);
    this.animateProgressBar();
  }

  private animateProgressBar() {
    const element = this.el.nativeElement.querySelector('.progress-bar');
    this.renderer.setStyle(element, 'width', '0');
    this.renderer.setStyle(element, 'transition', 'width 1s ease-out');
    requestAnimationFrame(() => {
      this.renderer.setStyle(element, 'width', `${this.progress}%`);
    });
  }
}
