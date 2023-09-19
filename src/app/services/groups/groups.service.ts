import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import groupData from './groups-config.json';
import groupAdeData from './ade-groups-m1miage.json';
import { IClass } from '../../shared/interfaces/class.interface';
import { IGroupType } from '../../shared/interfaces/class.interface';
import { IAdeGroup } from '../../shared/interfaces/adeGroup.interface';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private classes: IClass[] = groupData;
  thirtyDays = 365 * 24 * 60 * 60 * 1000;
  expirationDate = new Date(new Date().getTime() + this.thirtyDays);
  classSelected: string = 'M1 MIAGE';
  adeGroups: IAdeGroup[] = groupAdeData;  

  constructor(private cookieService: CookieService) {}

  getGroupsTypeForClass(className: string = this.classSelected): IGroupType[] {
    let groups: IGroupType[] = [];
    this.classes.forEach((c: any) => {
      if (c.name === className) {
        groups = c.groupTypes;
      }
    });
    return groups;
  }

  onGroupChange(groupType: string, checkedGroup: string, className: string = this.classSelected) {
    const classConfig = this.getGroupsTypeForClass(className);
    console.log(classConfig);
    if (classConfig.find((group: any) => group.name === groupType)) {
      console.log(classConfig);
      const groups: string[] = classConfig.find((group: any) => group.name === groupType)?.groups || [];
      groups.forEach((group: string) => {
        if (group !== checkedGroup) {
          this.cookieService.delete(group);
        } else {
          this.cookieService.set(group, 'true', this.expirationDate);
          console.log(this.cookieService.get(group));
        }
      });
    }
  }

  isGroupSelected(groupName: string): boolean {
    return this.cookieService.get(groupName) === 'true';
  }

  getGroupsOfTypes(groupType: string): string[] {
    const groups: string[] = [];
    this.classes.forEach((c: any) => {
      c.groupTypes.forEach((group: any) => {
        if (group.name === groupType) {
          groups.push(...group.groups);
        }
      });
    });
    return groups;
  }

  get selectedClass(): string {
    return this.cookieService.get('selectedClass');
  }

  set selectedClass(className: string) {
    this.classes.forEach((c: any) => {
      if (c.name === className) {
        this.classSelected = className;
      }
    });
    // TO DO Set adegroups
    this.cookieService.set('selectedClass', className, this.expirationDate);
  }

  getAdeGroups(): IAdeGroup[] {
    return this.adeGroups;
  }

}
