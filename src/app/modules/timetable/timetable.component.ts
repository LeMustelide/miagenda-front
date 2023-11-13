import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { TimetableService } from 'src/app/services/timetable.service';
import { ScheduleData, ScheduleItem } from '../../schedule.model';
import { CookieService } from 'ngx-cookie-service';
import { GroupsService } from 'src/app/services/groups/groups.service';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
})
export class TimetableComponent implements OnInit, AfterViewInit {
  selectedGroups: { [key: string]: boolean } = {};
  public scheduleData: ScheduleData | null = null;
  @ViewChild('scrollBox') scrollBox!: ElementRef;

  public timeIntervals: string[] = [
    '08h00 - 09h00',
    '09h00 - 10h00',
    '10h00 - 11h00',
    '11h00 - 12h00',
    '12h00 - 13h00',
    '13h00 - 14h00',
    '14h00 - 15h00',
    '15h00 - 16h00',
    '16h00 - 17h00',
    '17h00 - 18h00',
    '18h00 - 19h00',
    '19h00 - 20h00',
  ];

  weekDays: Date[] = [];
  date!: Date;
  isToday: boolean = true;
  currentDay!: Date;

  constructor(
    private timetableService: TimetableService,
    private cookieService: CookieService,
    private groupsService: GroupsService
  ) {}

  ngOnInit(): void {
    this.groupsService.selectedClass = 'M1 MIAGE';
    this.date = new Date();
    this.loadDefault();
    this.groupsService.loadAdeGroups().then(() => {
      this.groupsService.findIcalUrl(this.selectedGroups);
      this.loadSchedule();
    });
    this.generateWeek();
    this.currentDay = new Date().getDay() === 0 ? this.date : new Date();
  }

  generateWeek(): void {
    let currentDayOfWeek = this.date.getDay();
    if (currentDayOfWeek === 0) {
      this.date.setDate(this.date.getDate());
    }
    currentDayOfWeek = this.date.getDay();
    const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // considérant que Sunday est 0 et Monday est 1
    for (let i = 0; i < 6; i++) {
      const newDate = new Date(this.date);
      newDate.setDate(this.date.getDate() - daysToMonday + i);
      this.weekDays.push(newDate);
    }
  }

  previousWeek(): void {
    this.weekDays = [];
    this.date = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      this.date.getDate() - 7
    );
    this.generateWeek();
    this.isToday =
      this.date.getDate() === new Date().getDate() &&
      this.date.getMonth() === new Date().getMonth() &&
      this.date.getFullYear() === new Date().getFullYear();
    this.loadSchedule();
  }

  nextWeek(): void {
    this.weekDays = [];
    this.date = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      this.date.getDate() + 7
    );
    this.generateWeek();
    this.isToday =
      this.date.getDate() === new Date().getDate() &&
      this.date.getMonth() === new Date().getMonth() &&
      this.date.getFullYear() === new Date().getFullYear();
    this.loadSchedule();
  }

  today(): void {
    this.weekDays = [];
    this.date = new Date();
    this.generateWeek();
    this.isToday = true;
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.timetableService
      .getSchedule(this.cookieService.get('icalUrl'))
      .subscribe((data: ScheduleData) => {
        const worker = new Worker('./assets/timetable-schedule-worker.js', {
          type: 'module',
        });
        worker.postMessage({
          data: data.data,
          date: this.date,
          selectedGroups: this.groupsService.getSelectedAdeGroups(),
        });
        worker.onmessage = (event) => {
          this.scheduleData = {
            ...data,
            data: event.data,
          };
          worker.terminate();
        };
      });
  }

  onGroupChange({
    groupType,
    groupName,
    value
  }: {
    groupType: string;
    groupName: string;
    value: boolean;
  }) {
    this.groupsService.getGroupsOfTypes(groupType).forEach((group: string) => {
      this.selectedGroups[group] = false;
    });
    this.groupsService.onGroupChange(groupType, groupName, String(value));
    this.selectedGroups[groupName] = value;
    this.groupsService.loadAdeGroups().then(() => {
      this.loadSchedule();
    });
  }

  // Cette fonction retourne l'événement pour un jour et un intervalle de temps donné, si disponible
  getEvent(day: Date, time: string): ScheduleItem[] | null {
    if (!this.scheduleData) {
      return null;
    }
  
    const startTime = time.split(' - ')[0];
    const endTime = time.split(' - ')[1];
    return this.scheduleData.data.filter((item) => {
      const itemDate = this.stringToDate(item.date);
  
      return (
        itemDate.getDate() === day.getDate() &&
        itemDate.getMonth() === day.getMonth() &&
        itemDate.getFullYear() === day.getFullYear() &&
        item.start_time >= startTime &&
        item.start_time < endTime
      );
    });
  }

  stringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  setCurrentDay(selectedDay: Date): void {
    this.currentDay = new Date(selectedDay);
    setTimeout(() => {
      this.centerOnSelected();
    }, 0);
  }

  // Cette fonction retourne la durée d'un événement en minutes
  getEventDuration(event: ScheduleItem): number {
    const startParts = event.start_time.split('h');
    const endParts = event.end_time.split('h');

    const startHour: number = parseInt(startParts[0]);
    const endHour: number = parseInt(endParts[0]);

    const startMinutes: number = startParts[1] ? parseInt(startParts[1]) : 0;
    const endMinutes: number = endParts[1] ? parseInt(endParts[1]) : 0;

    return endHour * 60 + endMinutes - (startHour * 60 + startMinutes);
  }

  // Cette fonction retourne la position de départ d'un événement en pourcentage
  getEventStart(event: ScheduleItem): number {
    const startParts = event.start_time.split('h');
    const startMinutes: number = startParts[1] ? parseInt(startParts[1]) : 0;

    return (startMinutes * 100) / this.getEventDuration(event);
  }

  getCurrentLinePosition(): string {
    // Décalage dû au demi-intervalle
    const initialOffset = 0.5;
    const hourPosition = initialOffset + (this.date.getHours() - 8); // 1/2fr pour chaque heure
    const minutePosition = this.date.getMinutes() * (1 / 60); // fraction de 1/2fr pour chaque minute

    const totalPosition = minutePosition + hourPosition;

    const percentagePerFr = 100 / 12.5;
    let positionPercentage = totalPosition * percentagePerFr;
    
    return Math.min(positionPercentage, 96) + '%';
  }

  get Months(): Date[] {
    const today = new Date();
    const months: Date[] = [];
    for (let i = -6; i < 7; i++) {
      const newDate = new Date(today);
      newDate.setMonth(today.getMonth() + i);
      months.push(newDate);
    }
    return months;
  }

  // donne la liste des jours du mois sélectionné
  // rajoute aussi les jours du mois précendent si la première semaine du mois ne commence pas un lundi
  // et les jours du mois suivant si la dernière semaine du mois ne fini pas un dimanche
  get daysOfMonth(): Date[] {
    const days: Date[] = [];
    const month = this.date.getMonth();
    const year = this.date.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const lastDayOfWeek = lastDayOfMonth.getDay();

    // rajoute les jours du mois précédent si la première semaine du mois ne commence pas un lundi
    if (firstDayOfWeek !== 1) {
      for (let i = firstDayOfWeek - 1; i > 0; i--) {
        const newDate = new Date(firstDayOfMonth);
        newDate.setDate(firstDayOfMonth.getDate() - i);
        days.push(newDate);
      }
    }

    // rajoute les jours du mois sélectionné
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const newDate = new Date(firstDayOfMonth);
      newDate.setDate(i);
      days.push(newDate);
    }

    // rajoute les jours du mois suivant si la dernière semaine du mois ne fini pas un dimanche
    if (lastDayOfWeek !== 0) {
      for (let i = 1; i <= 7 - lastDayOfWeek; i++) {
        const newDate = new Date(lastDayOfMonth);
        newDate.setDate(lastDayOfMonth.getDate() + i);
        days.push(newDate);
      }
    }

    return days;
  }

  ngAfterViewInit(): void {
    this.centerOnSelected();
  }

  centerOnSelected() {
    if (this.scrollBox) {
      const selectedElem =
        this.scrollBox.nativeElement.querySelector('.selected');
      if (selectedElem) {
        const boxWidth = this.scrollBox.nativeElement.offsetWidth;
        const boxHalfWidth = boxWidth / 2;
        const selectedElemHalfWidth = selectedElem.offsetWidth / 2;
        const selectedElemCenter =
          selectedElem.offsetLeft + selectedElemHalfWidth;
        const scrollLeft = selectedElemCenter - boxHalfWidth;

        this.scrollBox.nativeElement.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }

  get eventNumberOnDay(): number {
    if (!this.scheduleData) {
      return 0;
    }
    return this.scheduleData.data.filter((item) => {
      const itemDate = this.stringToDate(item.date);
      return (
        itemDate.getDate() === this.currentDay.getDate() &&
        itemDate.getMonth() === this.currentDay.getMonth() &&
        itemDate.getFullYear() === this.currentDay.getFullYear()
      );
    }).length;
  }

  // fonction de changement de mois en fonction du date
  changeMonth(event: any): void {
    const selectedDate = new Date(event.target.value + '-01');
    this.date = selectedDate;
    this.setCurrentDay(selectedDate);
    this.weekDays = [];
    this.generateWeek();
    this.isToday =
      this.date.getDate() === new Date().getDate() &&
      this.date.getMonth() === new Date().getMonth() &&
      this.date.getFullYear() === new Date().getFullYear();
    this.loadSchedule();
  }

  loadDefault() {
    const groups = this.groupsService.getGroupsTypeForClass();
    const thirtyDays = 365 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(new Date().getTime() + thirtyDays);
    let useDefault = true;
    for (let groupType of groups) {
      // si aucun groupe n'est sélectionné (présent dans les cookies) par type, alors on sélectionne le groupe par défaut
      for (let group of groupType.groups) {
        if (group in this.cookieService.getAll()) {
          useDefault = false;
        }
      }
      if(useDefault) {
        this.cookieService.set(groupType.defaultGroup, 'true', expirationDate)
      }
    }
  }

  // récupération du type de groupe à partir de la liste des groupes ade
  // param : string[] : liste des groupes ade
  // return : string : type de groupe
  getGroupType(groups: string[]): string {
    const groupsType = this.groupsService.getGroupsTypeForClass();
    const adeGroups = this.groupsService.getAdeGroups();
    let groupType = '';
    for (let group of groups) {
      for(let adeGroup of adeGroups) {
        if(adeGroup.adeNames.includes(group)) {
          for(let groupType of groupsType) {
            if(groupType.groups.includes(adeGroup.parentGroups[0])) {
              return groupType.name;
            }
          }
        }
      }
    }
    return groupType;
  }
  
  
}
