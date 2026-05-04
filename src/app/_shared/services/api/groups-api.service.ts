import { Injectable } from '@angular/core';
import { GroupsApi, Models } from 'purecloud-platform-client-v2';
import { forkJoin, from, Observable, of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class GroupsApiService {

  groups: Models.Group[] = [];
  private readonly apiInstance = new GroupsApi();

  getGroupsByIds(ids: string[], force = false) {
      if (this.groups.length > 0 && !force) return of(this.groups);

      return this.getGroupsByIdsPage(ids, 0).pipe(
        switchMap(response => {
          if (response.pageCount && response.pageCount > 1) {
            const observables = [
              of(response.entities!)
            ];
            for (let i = 1; i < response.pageCount; i++) {
              observables.push(this.getGroupsByIdsPage(ids, i).pipe(map(res => res.entities!)))
            }
            return forkJoin(observables).pipe(map(res => res.flat(1)));
          } else {
            return of(response.entities!)
          }
        }),
        map(groups => groups.filter(group => group.name.startsWith('TEAM_'))),
        tap(groups => this.groups = groups)
      );
  }

  getAllGroups(force: boolean = false): Observable<Models.Group[]> {

    if (this.groups.length > 0 && !force) return of(this.groups);

    return this.getGroupsPage(0).pipe(
      switchMap(response => {
        if (response.pageCount > 1) {
          const observables = [
            of(response.results)
          ];
          for (let i = 1; i < response.pageCount; i++) {
            observables.push(this.getGroupsPage(i).pipe(map(res => res.results)))
          }
          return forkJoin(observables).pipe(map(res => res.flat(1)));
        } else {
          return of (response.results)
        }
      }));

  }

  getMembersById(groupId: string): Observable<Models.UserEntityListing> {
    return from(this.apiInstance.getGroupMembers(groupId, { expand: ['presence', 'routingStatus', 'groups', 'conversationSummary']}));
  }

  private getGroupsPage(pageNum: number) {
    const opts = {
      query: [
        {
          fields: [
            "name"
          ],
          operator: "AND",
          value: "_NN",
          type: "CONTAINS"
        }
      ],
      pageSize: 100,
      pageNumber: pageNum
    };
    return from(this.apiInstance.postGroupsSearch(opts))
  }

  private getGroupsByIdsPage(ids: string[], pageNum: number) {
    const opts = {
      id: ids,
      pageSize: 100,
      pageNumber: pageNum
    };
    return from(this.apiInstance.getGroups(opts))
  }
}
