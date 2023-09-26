import { Component } from '@angular/core';
import { GroupsService } from 'src/app/services/groups/groups.service';
import { IGroupType } from '../../shared/interfaces/class.interface';
import { CookieService } from 'ngx-cookie-service';
import { ScheduleData, ScheduleItem } from '../../schedule.model';
import { TimetableService } from '../../services/timetable.service';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  date: Date = new Date();
  nextCourse!: ScheduleItem;
  groups: IGroupType[] = [];
  selectedGroups: { [key: string]: boolean } = {};
  scheduleData: ScheduleData | null = null;
  private worker!: Worker;
  progress = 0;
  timeBeforeNextCourse = '00:00';
  NumberOfCoursesPassed: number = 0;

  constructor(
    private groupsService: GroupsService,
    private cookieService: CookieService,
    private timetableService: TimetableService
  ) {
    this.nextCourse = {} as ScheduleItem;
  }

  ngOnInit(): void {
    this.groups = this.groupsService.getGroupsTypeForClass();
    for (let groupType of this.groups) {
      for (let group of groupType.groups) {
        if (!(group in this.selectedGroups)) {
          this.selectedGroups[group] =
            this.cookieService.get(group) === 'true' || false;
        }
      }
    }

    this.update();
  }

  loadSchedule(): Observable<ScheduleData> {
    return this.timetableService
      .getSchedule(
        this.cookieService.get('icalUrl'),
        formatDate(this.date, 'YYYY-MM-dd', 'fr')
      )
      .pipe(switchMap((data: ScheduleData) => this.filterData(data)));
  }

  private update() {
    this.groupsService.loadAdeGroups().then(() => {
      this.loadSchedule().subscribe((data) => {
        this.scheduleData = data;
        this.nextCourse = this.getNextCourse() ?? ({} as ScheduleItem);
        this.progress = this.getProgress();
        this.timeBeforeNextCourse = this.getTimeBeforeNextCourse();
        this.NumberOfCoursesPassed = this.getNumberOfCoursesPassed();
      });
    });
  }

  private filterData(data: ScheduleData): Observable<ScheduleData> {
    return new Observable((observer) => {
      const worker = new Worker('./assets/schedule-worker.js', {
        type: 'module',
      });
      worker.postMessage({
        data: data,
        selectedGroups: this.groupsService.getSelectedAdeGroups(),
      });
      worker.onmessage = (event) => {
        observer.next(event.data);
        observer.complete();
      };

      return () => {
        worker.terminate();
      };
    });
  }

  onGroupChange(groupType: string, groupName: string) {
    this.groupsService.getGroupsOfTypes(groupType).forEach((group) => {
      this.selectedGroups[group] = false;
    });
    this.groupsService.onGroupChange(groupType, groupName);
    this.selectedGroups[groupName] = true;
    this.groupsService.findIcalUrl(this.selectedGroups);

    this.update();
  }

  // retourne le prochain cours, même si il est dans plusieurs jours
  getNextCourse(): ScheduleItem | null {
    if (!this.scheduleData) {
      return null;
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayEvent = this.scheduleData.data.find((item) => {
      const itemDate = this.stringToDate(item.date);

      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear() &&
        item.start_time >= formatDate(today, 'HH:mm', 'fr')
      );
    });

    if (todayEvent) {
      return todayEvent;
    }

    const tomorrowEvent = this.scheduleData.data.find((item) => {
      const itemDate = this.stringToDate(item.date);

      return (
        itemDate.getDate() === tomorrow.getDate() &&
        itemDate.getMonth() === tomorrow.getMonth() &&
        itemDate.getFullYear() === tomorrow.getFullYear()
      );
    });

    if (tomorrowEvent) {
      return tomorrowEvent;
    }
    return this.scheduleData.data[0];
  }

  stringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // retourne le premier cours de la journée
  getFirstCourse(): ScheduleItem | null {
    if (!this.scheduleData) {
      return null;
    }

    const today = new Date();

    const todayEvent = this.scheduleData.data.find((item) => {
      const itemDate = this.stringToDate(item.date);
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });

    if (todayEvent) {
      return todayEvent;
    }

    return null;
  }

  // retourne le dernier cours de la journée
  getLastCourse(): ScheduleItem | null {
    if (!this.scheduleData) {
      return null;
    }

    const today = new Date();

    const dataReversed = this.scheduleData.data.slice();
    dataReversed.reverse();

    const todayEvent = dataReversed.find((item) => {
      const itemDate = this.stringToDate(item.date);
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });

    if (todayEvent) {
      return todayEvent;
    }

    return null;
  }

  // calcul du pourcentage de la journée écoulée en fonction de l'heure actuelle et de l'heure de début du premier cours et de l'heure de fin du dernier cours
  // si il n'y a pas de cours, le pourcentage est de 100%
  getProgress(): number {
    if (!this.scheduleData) {
      return 100;
    }

    const firstEvent = this.getFirstCourse();
    const lastEvent = this.getLastCourse();

    if (!firstEvent || !lastEvent) {
      return 100;
    }

    const firstEventTime = firstEvent.start_time.split('h').map(Number);
    const lastEventTime = lastEvent.end_time.split('h').map(Number);
    const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
    const firstEventTimeMinutes = firstEventTime[0] * 60 + firstEventTime[1];
    const lastEventTimeMinutes = lastEventTime[0] * 60 + lastEventTime[1];

    let progress =
      ((currentTime - firstEventTimeMinutes) /
        (lastEventTimeMinutes - firstEventTimeMinutes)) *
      100;

    // Restrict the progress value to the range 0 to 100
    progress = Math.min(Math.max(progress, 0), 100);

    return Math.floor(progress);
  }

  // calcul du temps avant le prochain cours en heure et minute ou en jour si le prochain cours est dans plus de 24h
  getTimeBeforeNextCourse(): string {
    const nextEvent = this.nextCourse;

    if (!nextEvent || !this.scheduleData) {
      return '00:00';
    }

    const nextEventTime = nextEvent.start_time.split('h').map(Number);
    // le format de la date est le suivant 'dd/mm/yyyy'
    const nextEventDate = this.stringToDate(nextEvent.date);
    const currentDate = new Date();

    // Calcul de la différence en jours
    const dayDifference = Math.floor(
      (nextEventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 23) // TO DO : vérifier le calcul, c'est bizarre cette division par 23
    );

    // Calcul de la différence en heures et minutes pour le jour du prochain cours
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    const nextEventTimeMinutes = nextEventTime[0] * 60 + nextEventTime[1];
    let timeBeforeNextCourse = nextEventTimeMinutes - currentTime;

    if (timeBeforeNextCourse < 0) {
      timeBeforeNextCourse += 24 * 60;
    }

    const hours = Math.floor(timeBeforeNextCourse / 60);
    const minutes = timeBeforeNextCourse % 60;

    // Formatage de la sortie en fonction de la différence en jours
    if (dayDifference > 0) {
      return `${dayDifference} jour${dayDifference > 1 ? 's' : ''}, ${
        hours < 10 ? '0' + hours : hours
      }h et ${minutes < 10 ? '0' + minutes : minutes} min`;
    } else {
      return `${hours < 10 ? '0' + hours : hours}:${
        minutes < 10 ? '0' + minutes : minutes
      }`;
    }
  }

  // retourne le nombre de cours dans la journée
  getNumberOfCourses(): number {
    if (!this.scheduleData) {
      return 0;
    }

    const today = new Date();

    const todayEvents = this.scheduleData.data.filter((item) => {
      const itemDate = this.stringToDate(item.date);

      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });

    return todayEvents.length;
  }

  // retourne le nombre de cours déjà passés dans la journée
  getNumberOfCoursesPassed(): number {
    if (!this.scheduleData) {
      return 0;
    }

    const today = new Date();

    const todayEvents = this.scheduleData.data.filter((item) => {
      const itemDate = this.stringToDate(item.date);
      const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
      const itemTime = item.end_time.split('h').map(Number);
      const itemTimeMinutes = itemTime[0] * 60 + itemTime[1];

      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear() &&
        itemTimeMinutes < currentTime
      );
    });

    return todayEvents.length;
  }
}
