import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'
import { PortalDialogService } from '@onecx/portal-integration-angular'

import {
  RealmsInternalAPIService,
  RealmResponse,
  User,
  UserPageResult,
  UsersInternalAPIService
} from 'src/app/shared/generated'
import { UserSearchComponent, UserSearchCriteriaForm } from './user-search.component'

const form = new FormGroup<UserSearchCriteriaForm>({
  userId: new FormControl<string | null>(null),
  userName: new FormControl<string | null>(null),
  firstName: new FormControl<string | null>(null),
  lastName: new FormControl<string | null>(null),
  email: new FormControl<string | null>(null),
  realm: new FormControl<string | null>(null)
})

const user1: User = {
  id: 'userid1',
  username: 'username1',
  firstName: 'first1',
  lastName: 'last1',
  email: 'em@ail1',
  realm: 'realm1'
}
const user2: User = {
  id: 'userid2',
  username: 'username2',
  firstName: 'first2',
  lastName: 'last2',
  email: 'em@ail2',
  realm: 'realm2'
}
const userPageResult1: UserPageResult = {
  totalElements: 1,
  number: 10,
  size: 10,
  totalPages: 1,
  stream: [user1]
}
const userPageResult2: UserPageResult = {
  totalElements: 2,
  number: 10,
  size: 10,
  totalPages: 2,
  stream: [user1, user2]
}

describe('UserSearchComponent', () => {
  let component: UserSearchComponent
  let fixture: ComponentFixture<UserSearchComponent>
  const routerSpy = jasmine.createSpyObj('Router', ['navigate'])
  const routeMock = { snapshot: { paramMap: new Map() } }

  //const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const userApiServiceSpy = {
    searchUsersByCriteria: jasmine.createSpy('searchUsersByCriteria').and.returnValue(of({}))
  }
  const roleApiServiceSpy = {
    getAllRealms: jasmine.createSpy('getAllRealms').and.returnValue(of({}))
  }
  const mockUserService = {
    lang$: { getValue: jasmine.createSpy('getValue') },
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(of())
  }
  const mockDialogService = { openDialog: jasmine.createSpy('openDialog').and.returnValue(of({})) }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserSearchComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: UserSearchComponent }]),
        { provide: RealmsInternalAPIService, useValue: roleApiServiceSpy },
        { provide: UsersInternalAPIService, useValue: userApiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: UserService, useValue: mockUserService },
        { provide: PortalDialogService, useValue: mockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
    // to spy data: reset
    userApiServiceSpy.searchUsersByCriteria.calls.reset()
    roleApiServiceSpy.getAllRealms.calls.reset()
    // to spy data: refill with neutral data
    userApiServiceSpy.searchUsersByCriteria.and.returnValue(of({}))
    roleApiServiceSpy.getAllRealms.and.returnValue(of({}))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    //fixture.componentInstance.ngOnInit() // solved ExpressionChangedAfterItHasBeenCheckedError
  })

  describe('init', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('action translations', (done) => {
      const actionData = {
        'DIALOG.SEARCH.ROLE.LABEL': 'roleLabel',
        'DIALOG.SEARCH.ROLE.TOOLTIP': 'roleTooltip'
      }
      const translateService = TestBed.inject(TranslateService)
      spyOn(translateService, 'get').and.returnValue(of(actionData))

      component.ngOnInit()

      component.actions$?.subscribe({
        next: (actions) => {
          if (actions) {
            expect(actions[0].label).toEqual('roleLabel')
          }
          done()
        },
        error: done.fail
      })
    })

    it('dataview translations', (done) => {
      const translationData = {
        'USER.USERNAME': 'userName',
        'USER.LASTNAME': 'lastName',
        'USER.FIRSTNAME': 'firstName',
        'ACTIONS.DATAVIEW.FILTER_OF': 'filterOf',
        'ACTIONS.DATAVIEW.SORT_BY': 'sortBy'
      }
      const translateService = TestBed.inject(TranslateService)
      spyOn(translateService, 'get').and.returnValue(of(translationData))

      component.ngOnInit()

      component.dataViewControlsTranslations$?.subscribe({
        next: (data) => {
          if (data) {
            expect(data.sortDropdownTooltip).toEqual('sortBy')
          }
          done()
        },
        error: done.fail
      })
    })
  })

  it('should call initial search', () => {
    spyOn(component, 'searchUsers')

    component.onSearch()

    expect(component.searchUsers).toHaveBeenCalled()
  })

  describe('search users', () => {
    it('should search user and found', (done) => {
      component.formGroup.controls['userName'].setValue(user1.username!)
      component.formGroup.controls['firstName'].setValue(user1.firstName!)
      component.formGroup.controls['lastName'].setValue(user1.lastName!)
      component.formGroup.controls['email'].setValue(user1.email!)
      userApiServiceSpy.searchUsersByCriteria.and.returnValue(of(userPageResult1))

      component.searchUsers()

      component.users$.subscribe({
        next: (users) => {
          expect(users.length).toBe(1)
          expect(users[0]).toBe(user1)
          done()
        },
        error: done.fail
      })
    })

    it('should search by userId and realms - ignore other criteria', (done) => {
      component.formGroup.controls['userId'].setValue(user1.id!)
      component.formGroup.controls['userName'].setValue('unknown')
      component.formGroup.controls['realm'].setValue(user1.realm!)
      userApiServiceSpy.searchUsersByCriteria.and.returnValue(of(userPageResult1))

      component.searchUsers()

      component.users$.subscribe({
        next: (users) => {
          expect(users.length).toBe(1)
          expect(users[0]).toBe(user1)
          done()
        },
        error: done.fail
      })
    })

    it('should search users result empty', (done) => {
      component.formGroup.controls['userName'].setValue('testuserName')
      userApiServiceSpy.searchUsersByCriteria.and.returnValue(of({}))

      component.searchUsers()

      component.users$.subscribe({
        next: (users) => {
          expect(users.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search users result stream list equals 2', (done) => {
      component.formGroup.controls['userName'].setValue('testuserName')
      userApiServiceSpy.searchUsersByCriteria.and.returnValue(of(userPageResult2))

      component.searchUsers()

      component.users$.subscribe({
        next: (users) => {
          expect(users.length).toBe(2)
          expect(users.at(0)).toBe(user1)
          expect(users.at(1)).toBe(user2)
          done()
        },
        error: done.fail
      })

      component.users$.subscribe({
        next: (users) => {
          expect(users.length).toBe(2)
          expect(users[0].username).toBe('username1')
        },
        error: done.fail
      })
    })

    it('should search user Error response', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      component.formGroup.controls['userName'].setValue('testcriteria')
      userApiServiceSpy.searchUsersByCriteria.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.searchUsers()

      component.users$.subscribe({
        next: (users) => {
          if (users) {
            expect(users.length).toBe(0)
            expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.USER')
            expect(console.error).toHaveBeenCalledWith('searchUsersByCriteria', errorResponse)
          }
          done()
        },
        error: done.fail
      })
    })

    it('should manage form on search criteria user id', () => {
      expect(component.formGroup.controls['userName'].enable).toBeTruthy()

      component.searchOnlyById('id')

      expect(component.formGroup.controls['userName'].disable).toBeTruthy()
    })
  })

  describe('search realms', () => {
    it('should search & found realms - successful', (done) => {
      const realmResponse: RealmResponse = { realms: ['realm1', 'realm2'] }
      roleApiServiceSpy.getAllRealms.and.returnValue(of(realmResponse))

      component.searchRealms()

      component.realms$.subscribe({
        next: (realms) => {
          expect(realms.length).toBe(2)
          expect(realms[0]).toBe('realm1')
          done()
        },
        error: done.fail
      })
    })

    it('should search realms - successful without data', (done) => {
      const realmResponse: RealmResponse = {}
      roleApiServiceSpy.getAllRealms.and.returnValue(of(realmResponse))

      component.searchRealms()

      component.realms$.subscribe({
        next: (realms) => {
          expect(realms.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search realms - successful without data', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      roleApiServiceSpy.getAllRealms.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.searchRealms()

      component.realms$.subscribe({
        next: (realms) => {
          expect(realms.length).toBe(0)
          expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.REALMS')
          expect(console.error).toHaveBeenCalledWith('getAllRealms', errorResponse)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('filter', () => {
    it('should update filter and and sort Field', () => {
      const filter = 'testFilter'

      component.onFilterChange(filter)

      expect(component.filter).toBe(filter)

      component.onSortChange('field')

      expect(component.sortField).toBe('field')
    })

    it('should update viewMode onLayoutChange', () => {
      component.onLayoutChange('grid')

      expect(component.viewMode).toBe('grid')
    })

    it('should update filter and call dv.filter onFilterChange', () => {
      const filter = 'testFilter'

      component.onFilterChange(filter)

      expect(component.filter).toBe(filter)
    })
  })

  describe('sort', () => {
    it('should update sortOrder based on asc boolean onSortDirChange', () => {
      component.onSortDirChange(true)
      expect(component.sortOrder).toBe(-1)

      component.onSortDirChange(false)
      expect(component.sortOrder).toBe(1)
    })
  })

  describe('page navigation', () => {
    it('should navigate to role search', () => {
      component.onGoToRoleSearch()

      expect(routerSpy.navigate).toHaveBeenCalledWith(['./roles'], { relativeTo: routeMock })
    })

    it('should reset roleSearchCriteriaGroup onSearchReset is called', () => {
      component.formGroup = form
      spyOn(form, 'reset').and.callThrough()

      component.onSearchReset()

      expect(component.formGroup.reset).toHaveBeenCalled()
    })

    it('should prepare action buttons with translated labels and tooltips', () => {
      spyOn(component, 'onGoToRoleSearch')

      component.ngOnInit()

      if (component.actions$) {
        component.actions$.subscribe((actions) => {
          const firstAction = actions[0]
          firstAction.actionCallback()
          expect(component.onGoToRoleSearch).toHaveBeenCalled()
          expect(actions[0].label).toBe('Roles')
          expect(actions[0].title).toBe('Search Roles in Identity Access Management (IAM)')
          expect(actions[0].icon).toBe('pi pi-bars')
          expect(actions[0].show).toBe('always')
        })
      }
    })
  })

  describe('UI actions', () => {
    it('should call detail dialog', () => {
      const mockEvent = new MouseEvent('click')

      component.onDetail(mockEvent, user1)

      expect(component.iamUser).toEqual(user1)
      expect(component.displayDetailDialog).toBeTrue()
    })

    it('should hide detail dialog', () => {
      component.displayDetailDialog = true

      component.onHideDetailDialog()

      expect(component.displayDetailDialog).toBeFalse()
    })
  })

  describe('onUserPermission', () => {
    it('should display permission dialog', () => {
      mockDialogService.openDialog.and.returnValue(of({}))

      component.onUserPermissions(user1)

      expect(mockDialogService.openDialog).toHaveBeenCalled()
    })
  })

  describe('display name', () => {
    it('should display firstname', () => {
      const usr: User = { firstName: 'first', lastName: undefined }

      const text = component.prepareDisplayName(usr, 10, 20)

      expect(text).toEqual(usr.firstName!)
    })

    it('should display lastname', () => {
      const usr: User = { firstName: undefined, lastName: 'last' }

      const text = component.prepareDisplayName(usr, 10, 20)

      expect(text).toEqual(usr.lastName!)
    })

    it('should display both names', () => {
      const usr: User = { firstName: 'first', lastName: 'last' }

      const text = component.prepareDisplayName(usr, 10, 20)

      expect(text).toEqual(usr.firstName! + ' ' + usr.lastName)
    })

    it('should display both names limited', () => {
      const usr: User = { firstName: 'first longer to be limited', lastName: 'last a bit longer than allowed' }

      const text = component.prepareDisplayName(usr, 10, 20)

      expect(text).toEqual('first long... last a...')
    })
  })
})
