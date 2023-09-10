import { Component, OnInit } from '@angular/core';
import { TimetableService } from 'src/app/services/timetable.service';
import { ScheduleData, ScheduleItem } from '../../schedule.model';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
})
export class TimetableComponent implements OnInit {
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
    this.timetableService.getSchedule().subscribe((data: ScheduleData) => {
      this.scheduleData = data;
    });
    // this.scheduleData = {
    //   data: [
    //     {
    //       date: '07/09/2023',
    //       end_time: '09h00',
    //       groups: ['ANG3FI', 'ANG3ALT', 'SMA7MI15 UE10 Anglais'],
    //       location: 'S311',
    //       professor: 'PASQUET',
    //       start_time: '08h00',
    //       title: 'Anglais',
    //     }
    //   ],
    //   message: 'Données fraîchement récupérées',
    //   timestamp: '2023-09-10 16:49:59',
    // };
  }

  // Cette fonction retourne l'événement pour un jour et un intervalle de temps donné, si disponible
  getEvent(day: string, time: string): ScheduleItem | null {
    if (!this.scheduleData) {
      return null;
    }

    const startTime = time.split(' - ')[0];
    const endTime = time.split(' - ')[1];
    return (
      this.scheduleData.data.find((item) => 
        this.getDayName(item.date) === day && item.start_time >= startTime && item.start_time < endTime
      ) ?? null
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
}
