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
  public scheduleData: ScheduleData | null = null;

  // Liste des jours et des intervalles de temps
  public days: string[] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];
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

  constructor(private timetableService: TimetableService) {}

  ngOnInit(): void {
    this.loadSchedule();
  }
  
  loadSchedule(): void {
    this.timetableService.getSchedule().subscribe((data: ScheduleData) => {
      this.scheduleData = {
        ...data,
        data: data.data.filter(item => 
          !item.groups || item.groups.includes('Gr  ALT') 
          || (this.selectedGroupTD == 'TD1' && (item.groups.includes('Gr TD1ALT') || item.groups.includes('Gr TD1FI')))
          || (this.selectedGroupTP == 'TD2' && (item.groups.includes('Gr TD2ALT') || item.groups.includes('Gr TD2FI')))
          || (this.selectedGroupTP == 'TP1' && (item.groups.includes('Gr TP 1ALT') || item.groups.includes('Gr TP1 FI') || item.groups.includes('ANG1ALT') || item.groups.includes('ANG1FI')))
          || (this.selectedGroupTP == 'TP2' && (item.groups.includes('Gr TP 2ALT') || item.groups.includes('Gr TP2FI') || item.groups.includes('ANG2ALT') || item.groups.includes('ANG2FI')))
          || (this.selectedGroupTP == 'TP3' && (item.groups.includes('Gr TP 3ALT') || item.groups.includes('Gr TP3FI') || item.groups.includes('ANG3ALT') || item.groups.includes('ANG3FI')))

        )
      };
    });
  }
  
  handleGroupTDChange(groupTD: string) {
    this.selectedGroupTD = groupTD;
    this.loadSchedule();  // Rechargez l'emploi du temps lorsque le groupe change
  }
  
  handleGroupTPChange(groupTP: string) {
    this.selectedGroupTP = groupTP;
    this.loadSchedule();  // Rechargez l'emploi du temps lorsque le groupe change
  }
  

  // Cette fonction retourne l'événement pour un jour et un intervalle de temps donné, si disponible
  getEvent(day: string, time: string): ScheduleItem | null {
    if (!this.scheduleData) {
      return null;
    }

    const startTime = time.split(' - ')[0];
    const endTime = time.split(' - ')[1];
    return (
      this.scheduleData.data.find(
        (item) =>
          this.getDayName(item.date) === day &&
          item.start_time >= startTime &&
          item.start_time < endTime
      ) ?? null
    );
  }

  // Cette fonction retourne tous les événements pour un jour et un intervalle de temps donné
  getEvents(day: string, time: string): ScheduleItem[] {
    if (!this.scheduleData) {
      return [];
    }

    const startTime = time.split(' - ')[0];
    const endTime = time.split(' - ')[1];

    return this.scheduleData.data.filter(
      (item) =>
        this.getDayName(item.date) === day &&
        item.start_time >= startTime &&
        item.start_time < endTime
    );
  }

  // Cette fonction convertit une date au format 'yyyy-MM-dd' en nom de jour
  getDayName(date: string): string {
    const dayNames: string[] = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ];
    //change date format to 'yyyy-MM-dd'
    date = date.split('/').reverse().join('-');
    const dayIndex: number = new Date(date).getDay();
    return dayNames[dayIndex];
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
}
