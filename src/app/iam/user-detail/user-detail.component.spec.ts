import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { BehaviorSubject, of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

import { AdminInternalAPIService, Provider, Role, User, UserRolesResponse } from 'src/app/shared/generated'
import { UserDetailComponent } from './user-detail.component'

const user1: User = {
  id: 'user id',
  username: 'user 1',
  firstName: 'first name 1',
  lastName: 'last name 1',
  email: 'email 1',
  createdTimestamp: 'creation date time 1'
}
const roles1: Role[] = [
  { name: 'role 1', description: 'Role 1' },
  { name: 'role 2', description: 'Role 2' }
]
const urResponse: UserRolesResponse = { roles: roles1 }
const provider: Provider = {
  name: 'prov1',
  displayName: 'Provider 1',
  domains: [{ name: 'dom1', displayName: 'Provider 1', issuer: 'http://issuer' }]
}

describe('UserDetailComponent', () => {
  let component: UserDetailComponent
  let fixture: ComponentFixture<UserDetailComponent>
  let mockUserService: any

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const adminApiSpy = {
    getUserRoles: jasmine.createSpy('getUserRoles').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    mockUserService = { lang$: new BehaviorSubject('de') }
    TestBed.configureTestingModule({
      declarations: [UserDetailComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        { provide: AdminInternalAPIService, useValue: adminApiSpy },
        { provide: UserService, useValue: mockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
  }))

  function initializeComponent(): void {
    fixture = TestBed.createComponent(UserDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    //fixture.componentInstance.ngOnChanges() // solved ExpressionChangedAfterItHasBeenCheckedError
  }

  beforeEach(() => {
    initializeComponent()
  })

  afterEach(() => {
    adminApiSpy.getUserRoles.calls.reset()
    translateServiceSpy.get.calls.reset()
    component.provider = undefined
    component.idmUser = undefined
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('on changes', () => {
    it('should ignore any action if dialog is not displayed', () => {
      component.displayDialog = false

      component.ngOnChanges()
    })

    it('should ignore any action if no user data', () => {
      component.displayDialog = true
      component.idmUser = undefined

      component.ngOnChanges()
    })

    it('should ignore any action if no provider', () => {
      component.displayDialog = true
      component.idmUser = user1
      component.provider = undefined

      component.ngOnChanges()
    })

    it('should call get user roles', (done) => {
      component.displayDialog = true
      component.idmUser = user1
      component.provider = provider
      adminApiSpy.getUserRoles.and.returnValue(of(urResponse))

      component.ngOnChanges()

      component.userRoles$.subscribe((roles) => {
        expect(roles.length).toBe(2)
        expect(roles[0]).toEqual(roles1[0].name!)
        expect(roles[1]).toEqual(roles1[1].name!)
        done()
      })
    })

    it('should call get empty role array if user does not have role', (done) => {
      component.displayDialog = true
      component.idmUser = user1
      component.provider = provider
      adminApiSpy.getUserRoles.and.returnValue(of({}))

      component.ngOnChanges()

      component.userRoles$.subscribe({
        next: (roles) => {
          if (roles) {
            expect(roles.length).toBe(0)
          }
          done()
        },
        error: done.fail
      })
    })

    it('should call get empty role array if user does not have role', (done) => {
      component.displayDialog = true
      component.idmUser = user1
      component.provider = provider
      adminApiSpy.getUserRoles.and.returnValue(throwError(() => errorResponse))
      const errorResponse = { status: 404, statusText: 'Not Found' }
      spyOn(console, 'error')

      component.ngOnChanges()

      component.userRoles$.subscribe({
        next: (roles) => {
          if (roles) {
            expect(roles.length).toBe(0)
            expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.ROLES')
            expect(console.error).toHaveBeenCalledWith('getUserRoles', errorResponse)
          }
          done()
        },
        error: done.fail
      })
    })

    describe('language', () => {
      it('should set German date format', () => {
        mockUserService.lang$.next('de')
        initializeComponent()

        expect(component.datetimeFormat).toEqual('dd.MM.yyyy HH:mm:ss')
      })

      it('should set German date format', () => {
        mockUserService.lang$.next('en')
        initializeComponent()

        expect(component.datetimeFormat).toEqual('M/d/yy, hh:mm:ss a')
      })

      it('should set German date format', () => {
        mockUserService.lang$.next('de')
        initializeComponent()

        expect(component.datetimeFormat).toEqual('dd.MM.yyyy HH:mm:ss')
      })
    })
  })

  describe('close dialog', () => {
    it('should emit if dialog is closed', () => {
      spyOn(component.hideDialog, 'emit')

      component.onDialogHide()

      expect(component.hideDialog.emit).toHaveBeenCalled()
    })
  })
})
