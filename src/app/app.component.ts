import { Component } from '@angular/core';
import { fadeAnimation } from './shared/animations/component-transition';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeAnimation],
})
export class AppComponent {
  title = 'miagenda';
  prepareRoute(outlet: any) {
    return outlet?.activatedRouteData?.animation;
  }
}
