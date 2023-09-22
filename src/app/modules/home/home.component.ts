import { Component } from '@angular/core';
import { ScheduleItem } from '../../schedule.model';
import { GroupsService } from 'src/app/services/groups/groups.service';
import { IGroupType } from '../../shared/interfaces/class.interface';
import { CookieService } from 'ngx-cookie-service';

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

  constructor(private groupsService: GroupsService, private cookieService: CookieService) {
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
    this.groups = this.groupsService.getGroupsTypeForClass();
  
    for (let groupType of this.groups) {
      for (let group of groupType.groups) {
        if (!(group in this.selectedGroups)) {
          this.selectedGroups[group] = this.cookieService.get(group) === "true" || false;
        }
      }
    }
  }  

  onGroupChange(groupType: string, groupName: string) {
    this.groupsService.getGroupsOfTypes(groupType).forEach((group) => {
      this.selectedGroups[group] = false;
    });
    this.groupsService.onGroupChange(groupType, groupName);
    this.selectedGroups[groupName] = true;
    this.groupsService.findIcalUrl(this.selectedGroups);
  }
}
