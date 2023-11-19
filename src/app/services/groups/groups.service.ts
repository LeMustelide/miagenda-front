import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import groupData from './groups-config.json';
import { IClass } from '../../shared/interfaces/class.interface';
import { IGroupType } from '../../shared/interfaces/class.interface';
import { IAdeGroup } from '../../shared/interfaces/adeGroup.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private classes: IClass[] = groupData;
  thirtyDays = 365 * 24 * 60 * 60 * 1000;
  expirationDate = new Date(new Date().getTime() + this.thirtyDays);
  classSelected: string = 'L3 MIAGE';
  adeGroups: IAdeGroup[] = {} as IAdeGroup[];
  private class: IClass =
    this.classes.find((c: any) => c.name === this.classSelected) ||
    ({} as IClass);

  

  constructor(private cookieService: CookieService, private http: HttpClient) {}

  getGroupsTypeForClass(className: string = this.classSelected): IGroupType[] {
    let groups: IGroupType[] = [];
    this.classes.forEach((c: any) => {
      if (c.name === className) {
        groups = c.groupTypes;
      }
    });
    return groups;
  }

  onGroupChange(
    groupType: string,
    checkedGroup: string,
    value: string, 
    className: string = this.classSelected
  ) {
    const classConfig = this.getGroupsTypeForClass(className);
    if (classConfig.find((group: any) => group.name === groupType)) {
      const groups: string[] =
        classConfig.find((group: any) => group.name === groupType)?.groups ||
        [];
      groups.forEach((group: string) => {
        if (group !== checkedGroup) {
          this.cookieService.delete(group);
        } else {
          this.cookieService.set(group, value, this.expirationDate);
          this.cookieService.get(group);
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
    this.class =
      this.classes.find((c: any) => c.name === this.classSelected) ||
      ({} as IClass);
    this.loadAdeGroups();
    this.cookieService.set('selectedClass', className, this.expirationDate);
  }

  getAdeGroups(): IAdeGroup[] {
    return this.adeGroups;
  }

  loadAdeGroups(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<IAdeGroup[]>(`assets/` + this.class.adeConfig).subscribe(
        (data: IAdeGroup[]) => {
          this.adeGroups = data;
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  findIcalUrl(selectedGroups: { [key: string]: boolean }) {
    // vérifie pour chaque groups si la propriété "ical" n'est pas vide
    let url = null;
    for (let group in selectedGroups) {
      if (selectedGroups[group]) {
        const adeGroup = this.adeGroups.find((g) =>
          g.parentGroups.includes(group)
        );
        if (adeGroup && adeGroup.ical) {
          url = adeGroup.ical;
          break;
        }
      }
    }
    // si la taille de selectedGroups est égale à 0, on prend le premier ical trouvé
    if (!url) {
      const adeGroup = this.adeGroups.find((g) =>
        g.parentGroups.includes('default') && g.ical
      );
      if (adeGroup && adeGroup.ical) {
        url = adeGroup.ical;
      }
    }
    this.cookieService.set('icalUrl', url || '', this.expirationDate);
  }

  getSelectedAdeGroups(): IAdeGroup[] {
    const selectedAdeGroups: IAdeGroup[] = [];
    for (let adeGroup of this.adeGroups) {
      let isGroupSelected = true;
      for (let parentGroup of adeGroup.parentGroups) {
        if (!this.isGroupSelected(parentGroup) && parentGroup !== 'default') {
          isGroupSelected = false;
          break;
        }
      }
      if (isGroupSelected) {
        selectedAdeGroups.push(adeGroup);
      }
    }
    return selectedAdeGroups;
  }

  getClasses(): IClass[] {
    return this.classes;
  }
}
