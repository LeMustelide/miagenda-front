import { Component, OnInit } from '@angular/core';
import { TimetableService } from 'src/app/services/timetable.service';
import { ScheduleData, ScheduleItem } from '../../schedule.model';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
})
export class TimetableComponent implements OnInit {
  selectedGroupTD: string = '';
  selectedGroupTP: string = '';
  alternant: boolean = true;
  public scheduleData: ScheduleData | null = null;

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

  constructor(private timetableService: TimetableService) {}

  ngOnInit(): void {
    this.date = new Date();
    this.loadSchedule();
    this.generateWeek();
    this.currentDay = new Date().getDay() === 0 ? this.date : new Date();
  }

  generateWeek(): void {
    let currentDayOfWeek = this.date.getDay();
    if(currentDayOfWeek === 0) {
      this.date.setDate(this.date.getDate() + 1);
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
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(),this.date.getDate() - 7);
    this.generateWeek();
    this.isToday = this.date.getDate() === new Date().getDate() && this.date.getMonth() === new Date().getMonth() && this.date.getFullYear() === new Date().getFullYear();
  }

  nextWeek(): void {
    this.weekDays = [];
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(),this.date.getDate() + 7);
    this.generateWeek();
    this.isToday = this.date.getDate() === new Date().getDate() && this.date.getMonth() === new Date().getMonth() && this.date.getFullYear() === new Date().getFullYear();
  }

  today(): void {
    this.weekDays = [];
    this.date = new Date();
    this.generateWeek();
    this.isToday = true;
  }

  loadSchedule(): void {
    this.timetableService.getSchedule(this.alternant ? 'https://aderead2022.univ-orleans.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=83909bcb789af69dbb59d201976f55300d3b4c68a7820e99c53ca46537bc18bd982bf381b1007d5c58e581d9e50ed9f0150773d38134ae18c98c0a9c1622637d48c2240b7941c7dd7e7dea10fc53247e,1' : 'https://aderead2022.univ-orleans.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=cc7ee745de3d21643a129a41f75db5740d3b4c68a7820e99c53ca46537bc18bd982bf381b1007d5c58e581d9e50ed9f0150773d38134ae18c98c0a9c1622637d48c2240b7941c7dd7e7dea10fc53247e,1').subscribe((data: ScheduleData) => {
      this.scheduleData = {
        ...data,
        data: data.data.filter(
          (item) => {
            return !item.groups ||
            ( this.alternant && item.groups.includes('Gr  ALT') ) ||
            ( !this.alternant && item.groups.includes('Gr  FI') ) ||
            ( item.groups.includes('M1 MIAGE') && item.groups.length == 1 ) ||
            (this.selectedGroupTD == 'TD1' &&
              (
                ( this.alternant && item.groups.includes('Gr TD1ALT') )
                ||
                ( !this.alternant && item.groups.includes('Gr  TD1FI'))
              )
            )
            ||
            (this.selectedGroupTD == 'TD2' &&
              ( 
                ( this.alternant && item.groups.includes('Gr TD2ALT') )
                ||
                ( !this.alternant && item.groups.includes('Gr  TD2FI') )
              )
            ) ||
            (this.selectedGroupTP == 'TP1' &&
              (
                ( this.alternant && item.groups.includes('Gr TP 1ALT'))
                ||
                ( !this.alternant && item.groups.includes('Gr  TP1FI'))
                ||
                ( this.alternant && item.groups.includes('ANG1ALT'))
                ||
                ( !this.alternant && item.groups.includes('ANG1FI'))
              )
            )
            ||
            (this.selectedGroupTP == 'TP2' &&
              (
                (this.alternant && item.groups.includes('Gr TP 2ALT'))
                ||
                ( !this.alternant && item.groups.includes('Gr TP2FI'))
                ||
                ( this.alternant && item.groups.includes('ANG2ALT') )
                ||
                ( !this.alternant && item.groups.includes('ANG2FI'))
              )
            )
            ||
            (this.selectedGroupTP == 'TP3' &&
              (
                ( this.alternant && item.groups.includes('Gr TP 3ALT') )
                ||
                ( !this.alternant && item.groups.includes('Gr TP3FI') )
                ||
                ( this.alternant && item.groups.includes('ANG3ALT') )
                ||
                ( !this.alternant && item.groups.includes('ANG3FI') )
              )
            )
          }
        ),
      };
    });
  }

  handleGroupTDChange(groupTD: string) {
    this.selectedGroupTD = groupTD;
    this.loadSchedule(); // Rechargez l'emploi du temps lorsque le groupe change
  }

  handleGroupTPChange(groupTP: string) {
    this.selectedGroupTP = groupTP;
    this.loadSchedule(); // Rechargez l'emploi du temps lorsque le groupe change
  }

  handleAlternantChange(alternant: boolean) {
    this.alternant = alternant;
    this.loadSchedule(); // Rechargez l'emploi du temps lorsque le groupe change
  }

  // Cette fonction retourne l'événement pour un jour et un intervalle de temps donné, si disponible
  getEvent(day: Date, time: string): ScheduleItem | null {
    if (!this.scheduleData) {
      return null;
    }

    const startTime = time.split(' - ')[0];
    const endTime = time.split(' - ')[1];
    return (
      this.scheduleData.data.find((item) => {
        const itemDate = this.stringToDate(item.date);

        return (
          itemDate.getDate() === day.getDate() &&
          itemDate.getMonth() === day.getMonth() &&
          itemDate.getFullYear() === day.getFullYear() &&
          item.start_time >= startTime &&
          item.start_time < endTime
        );
      }) ?? null
    );
  }

  stringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // les mois sont indexés à partir de 0 en JS
  }

  setCurrentDay(selectedDay: Date): void {
    this.currentDay = new Date(selectedDay); // créez une nouvelle instance pour éviter toute référence
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
    console.log(totalPosition);

    // Convertissons le total en pourcentage par rapport à la grille entière.
    const percentagePerFr = 100 / 12.5;
    let positionPercentage = totalPosition * percentagePerFr;
    console.log(percentagePerFr+ ' !');

    return positionPercentage + '%';
  }
}
