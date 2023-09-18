import { Component } from '@angular/core';
import { ScheduleItem } from '../../schedule.model';
import { CookieService } from 'ngx-cookie-service';

type TDGroupKeys = 'TD1' | 'TD2';
type TPGroupKeys = 'TP1' | 'TP2' | 'TP3';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  date: Date = new Date();
  nextCourse!: ScheduleItem;
  tdGroup = {
    TD1: false,
    TD2: false,
  };

  tpGroup = {
    TP1: false,
    TP2: false,
    TP3: false,
  };

  alternant: boolean = true;

  constructor(private cookieService: CookieService) {
    this.nextCourse = {
      title: 'Next course',
      date: '24/09/2023',
      end_time: '12:00',
      groups: [],
      location: 'Amphi 1',
      professor: 'Prof. John Doe',
      start_time: '10:00',
    };
  }

  ngOnInit(): void {
    this.tdGroup = this.cookieService.get('tdGroup') === 'TD1' ? { TD1: true, TD2: false } : { TD1: false, TD2: true };
    this.tpGroup = this.cookieService.get('tpGroup') === 'TP1' ? { TP1: true, TP2: false, TP3: false } : this.cookieService.get('tpGroup') === 'TP2' ? { TP1: false, TP2: true, TP3: false } : { TP1: false, TP2: false, TP3: true };
    this.alternant = this.cookieService.get('alternant') === 'true';
  }

  onTdChange(checkedGroup: TDGroupKeys) {
    Object.keys(this.tdGroup).forEach((group) => {
      if (group !== checkedGroup) {
        this.tdGroup[group as TDGroupKeys] = false;
      }
    });
    this.cookieService.set('tdGroup', this.tdGroup.TD1 ? 'TD1' : 'TD2');
  }

  onTpChange(checkedGroup: TPGroupKeys) {
    Object.keys(this.tpGroup).forEach((group) => {
      if (group !== checkedGroup) {
        this.tpGroup[group as TPGroupKeys] = false;
      }
    });
    this.cookieService.set('tpGroup', this.tpGroup.TP1 ? 'TP1' : this.tpGroup.TP2 ? 'TP2' : 'TP3');
  }

  setAlternant(isInitiale: boolean) {
    this.alternant = isInitiale;
    this.cookieService.set('alternant', isInitiale ? 'true' : 'false');
  }
}
