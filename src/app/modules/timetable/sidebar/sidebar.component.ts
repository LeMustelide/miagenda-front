import { Component, EventEmitter, Output } from '@angular/core';
import { GroupsService } from 'src/app/services/groups/groups.service';
import { IGroupType } from '../../../shared/interfaces/class.interface';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  selectedGroups: { [key: string]: boolean } = {};
  @Output() onGroupChange = new EventEmitter<{groupType: string, groupName: string, value: boolean}>();
  groups: IGroupType[] = [];

  constructor(private groupsService: GroupsService, private cookieService: CookieService) { }

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

  groupChange(groupType: string, groupName: string, value: boolean) {
    this.groupsService.getGroupsOfTypes(groupType).forEach((group) => {
      this.selectedGroups[group] = false;
    });
    this.onGroupChange.emit({groupType, groupName, value});
    this.selectedGroups[groupName] = value;
    this.groupsService.findIcalUrl(this.selectedGroups);
  }
}
