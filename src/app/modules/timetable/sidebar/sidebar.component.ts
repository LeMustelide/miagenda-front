import { Component, EventEmitter, Output } from '@angular/core';
import { GroupsService } from 'src/app/services/groups/groups.service';
import { IGroupType } from '../../../shared/interfaces/class.interface';
import { CookieService } from 'ngx-cookie-service';
import packageJson  from '../../../../../package.json';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  selectedGroups: { [key: string]: boolean } = {};
  @Output() onGroupChange = new EventEmitter<{groupType: string, groupName: string, value: boolean}>();
  groups: IGroupType[] = [];
  public version: string = packageJson.version;

  constructor(private groupsService: GroupsService, private cookieService: CookieService) { }

  ngOnInit(): void {
    this.groups = this.groupsService.getGroupsTypeForClass();
  
    for (let groupType of this.groups) {
      for (let group of groupType.groups) {
        if (!(group in this.selectedGroups)) {
          this.selectedGroups[group] = this.cookieService.get(group) === "true" || false;
          if(this.selectedGroups[group] && groupType.required) { // TO DO : améliorer la gestion des groupes obligatoires
            this.onGroupChange.emit({groupType: groupType.name, groupName: group, value: true});
          }
        }
      }
    }
  }

  groupChange(groupType: string, groupName: string, value: boolean) {
    this.groupsService.getGroupsOfTypes(groupType).forEach((group) => {
      this.selectedGroups[group] = false;
    });
    this.onGroupChange.emit({groupType, groupName, value}); // attention

    this.selectedGroups[groupName] = value;
    this.groupsService.findIcalUrl(this.selectedGroups);
  }

  // retourne le nom du groupe en fonction de la valeur actuelle pour un type de groupe donné
  getGroupName(groupType: string): string {
    const groups = this.groupsService.getGroupsOfTypes(groupType);

    for (let group of groups) {
      if (this.selectedGroups[group] === true) {
        return group;
      }
    }

    return '';
  }

  updateGroups() {
    this.groups = this.groupsService.getGroupsTypeForClass();
    
    for (let groupType of this.groups) {
      for (let group of groupType.groups) {
        if (!(group in this.selectedGroups)) {
          this.selectedGroups[group] = this.cookieService.get(group) === "true" || false;
          if(this.selectedGroups[group] && groupType.required) {
            this.onGroupChange.emit({groupType: groupType.name, groupName: group, value: true});
          }
        }
      }
    }
  }
}
