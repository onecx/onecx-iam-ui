import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

import { Domain, Provider, Role, AdminInternalAPIService, User, UserRolesResponse } from 'src/app/shared/generated'
import { copyToClipboard, sortByLocale } from 'src/app/shared/utils'

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnChanges {
  @Input() public displayDialog = false
  @Input() public idmUser: User | undefined
  @Input() public provider: Provider | undefined
  @Output() public hideDialog = new EventEmitter<boolean>()

  public loading = false
  public exceptionKey: string | undefined = undefined
  public datetimeFormat = 'medium'
  public userRoles$: Observable<string[]> = of()
  public userAttributes: string | undefined = undefined
  public copyToClipboard = copyToClipboard
  public domain: Domain | undefined

  constructor(
    private readonly adminApi: AdminInternalAPIService,
    private readonly user: UserService,
    private readonly translate: TranslateService
  ) {
    this.datetimeFormat = user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm:ss' : 'M/d/yy, hh:mm:ss a'
  }

  public ngOnChanges() {
    if (!this.displayDialog) return
    this.domain = this.provider?.domains?.at(0)
    this.prepareQuery()
  }

  /**
   * READING data
   */
  private prepareQuery(): void {
    if (!this.idmUser?.id || !this.domain?.issuer) return
    this.userAttributes = JSON.stringify(this.idmUser.attributes, undefined, 2)
    this.loading = true
    this.exceptionKey = undefined
    this.userRoles$ = this.adminApi
      .getUserRoles({ userId: this.idmUser.id, searchUserRolesRequest: { issuer: this.domain.issuer } })
      .pipe(
        map((response: UserRolesResponse) => {
          const roles: Role[] = response.roles ?? []
          return (roles?.map((r) => r.name) as string[]).sort(sortByLocale)
        }),
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.ROLES'
          console.error('getUserRoles', err)
          return of([])
        }),
        finalize(() => (this.loading = false))
      )
  }

  /****************************************************************************
   *  UI Events
   */
  public onDialogHide() {
    this.hideDialog.emit(false)
  }
}
