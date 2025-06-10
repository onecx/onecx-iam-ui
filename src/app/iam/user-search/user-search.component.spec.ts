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
  AdminInternalAPIService,
  Domain,
  Provider,
  ProvidersResponse,
  User,
  UserPageResult
} from 'src/app/shared/generated'
import { UserSearchComponent, UserSearchCriteriaForm } from './user-search.component'

const searchForm = new FormGroup<UserSearchCriteriaForm>({
  userId: new FormControl<string | null>(null),
  userName: new FormControl<string | null>(null),
  firstName: new FormControl<string | null>(null),
  lastName: new FormControl<string | null>(null),
  email: new FormControl<string | null>(null),
  provider: new FormControl<string | null>(null),
  issuer: new FormControl<string | null>(null)
})

const user1: User = {
  id: 'userId1',
  username: 'username1',
  firstName: 'first1',
  lastName: 'last1',
  email: 'em@ail1',
  domain: 'domain1'
}
const user2: User = {
  id: 'userId2',
  username: 'username2',
  firstName: 'first2',
  lastName: 'last2',
  email: 'em@ail2',
  domain: 'domain2'
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
const domain1: Domain = { name: 'domain1', displayName: 'IDM 1', issuer: 'http://keycloak' }
const domain2: Domain = { name: 'domain2', issuer: 'http://keycloak2' }
const provider1: Provider = {
  name: 'idm1',
  displayName: 'IDM 1',
  domains: [domain1]
}
const provider2: Provider = {
  name: 'idm2',
  domains: [domain1, domain2]
}

describe('UserSearchComponent', () => {
  let component: UserSearchComponent
  let fixture: ComponentFixture<UserSearchComponent>
  const routerSpy = jasmine.createSpyObj('Router', ['navigate'])
  const routeMock = { snapshot: { paramMap: new Map() } }

  const adminApiSpy = {
    getAllProviders: jasmine.createSpy('getAllProviders').and.returnValue(of({})),
    searchUsersByCriteria: jasmine.createSpy('searchUsersByCriteria').and.returnValue(of({}))
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
        { provide: AdminInternalAPIService, useValue: adminApiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: UserService, useValue: mockUserService },
        { provide: PortalDialogService, useValue: mockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
    // to spy data: reset
    adminApiSpy.searchUsersByCriteria.calls.reset()
    adminApiSpy.getAllProviders.calls.reset()
    // to spy data: refill with neutral data
    adminApiSpy.searchUsersByCriteria.and.returnValue(of({}))
    adminApiSpy.getAllProviders.and.returnValue(of({}))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    //fixture.componentInstance.ngOnInit() // solved ExpressionChangedAfterItHasBeenCheckedError
  })

  describe('initialize', () => {
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

  describe('search users', () => {
    it('should call search but missing issuer', () => {
      component.searchCriteriaForm.reset()
      component.searchCriteriaForm.controls['userName'].setValue(user1.username!)
      component.searchCriteriaForm.controls['provider'].setValue(provider1.name!)

      component.ngOnInit()
      component.onSearch()

      expect(component.exceptionKey).toBe('EXCEPTIONS.MISSING_ISSUER')
    })

    it('should search user and found', (done) => {
      component.searchCriteriaForm.controls['userName'].setValue(user1.username!)
      component.searchCriteriaForm.controls['firstName'].setValue(user1.firstName!)
      component.searchCriteriaForm.controls['lastName'].setValue(user1.lastName!)
      component.searchCriteriaForm.controls['email'].setValue(user1.email!)
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchUsersByCriteria.and.returnValue(of(userPageResult1))

      component.ngOnInit()
      component.searchUsers()

      component.users$?.subscribe({
        next: (users) => {
          expect(users.length).toBe(1)
          expect(users[0]).toBe(user1)
          done()
        },
        error: done.fail
      })
    })

    it('should search by userId and providers - ignore other criteria', (done) => {
      component.searchCriteriaForm.controls['userId'].setValue(user1.id!)
      component.searchCriteriaForm.controls['userName'].setValue('unknown')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchUsersByCriteria.and.returnValue(of(userPageResult1))

      component.ngOnInit()
      component.searchUsers()

      component.users$?.subscribe({
        next: (users) => {
          expect(users.length).toBe(1)
          expect(users[0]).toBe(user1)
          done()
        },
        error: done.fail
      })
    })

    it('should search users result empty', (done) => {
      component.searchCriteriaForm.controls['userName'].setValue('testuserName')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchUsersByCriteria.and.returnValue(of({}))

      component.ngOnInit()
      component.searchUsers()

      component.users$?.subscribe({
        next: (users) => {
          expect(users.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search users result stream list equals 2', (done) => {
      component.searchCriteriaForm.controls['userName'].setValue('testuserName')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchUsersByCriteria.and.returnValue(of(userPageResult2))

      component.ngOnInit()
      component.searchUsers()

      component.users$?.subscribe({
        next: (users) => {
          expect(users.length).toBe(2)
          expect(users.at(0)).toBe(user1)
          expect(users.at(1)).toBe(user2)
          done()
        },
        error: done.fail
      })

      component.users$?.subscribe({
        next: (users) => {
          expect(users.length).toBe(2)
          expect(users[0].username).toBe('username1')
        },
        error: done.fail
      })
    })

    it('should search user Error response', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      component.searchCriteriaForm.controls['userName'].setValue('testcriteria')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchUsersByCriteria.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnInit()
      component.searchUsers()

      component.users$?.subscribe({
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

    it('should manage searchForm on search criteria user id', () => {
      expect(component.searchCriteriaForm.controls['userName'].enable).toBeTruthy()
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)

      component.ngOnInit()
      component.searchOnlyById('id')

      expect(component.searchCriteriaForm.controls['userName'].disable).toBeTruthy()
    })
  })

  describe('search providers', () => {
    it('should search & found providers - successful with data', (done) => {
      const providerResponse: ProvidersResponse = {
        providers: [provider1, provider2]
      }
      adminApiSpy.getAllProviders.and.returnValue(of(providerResponse))

      component.searchProviders()

      component.provider$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(2)
          done()
        },
        error: done.fail
      })
    })

    it('should search providers - successful without data', (done) => {
      const providerResponse: ProvidersResponse = {}
      adminApiSpy.getAllProviders.and.returnValue(of(providerResponse))

      component.searchProviders()

      component.provider$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search providers - successful without data', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      adminApiSpy.getAllProviders.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.searchProviders()

      component.provider$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(0)
          expect(console.error).toHaveBeenCalledWith('getAllProviders', errorResponse)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('change search criteria', () => {
    it('should reset domain - no provider selected', () => {
      component.domains = [domain1, domain2]

      component.onChangeProvider(undefined, [])

      expect(component.domains.length).toBe(0)
      expect(component.searchCriteriaForm?.controls['issuer'].value).toBeNull()
    })

    it('should refill domain from provider', () => {
      const provs = [provider1, provider2]

      component.onChangeProvider(provider2.name, provs)

      expect(component.domains.length).toBe(2)
    })

    it('should reset search results', (done) => {
      component.onChangeDomain()

      component.users$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(0)
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
      component.searchCriteriaForm = searchForm
      spyOn(searchForm, 'reset').and.callThrough()

      component.onSearchReset()

      expect(component.searchCriteriaForm.reset).toHaveBeenCalled()
    })

    it('should prepare action buttons with translated labels and tooltips', () => {
      spyOn(component, 'onGoToRoleSearch')

      component.ngOnInit()

      if (component.actions$) {
        component.actions$.subscribe((actions) => {
          const firstAction = actions[0]
          firstAction.actionCallback()
          expect(component.onGoToRoleSearch).toHaveBeenCalled()
        })
      }
    })
  })

  describe('UI actions', () => {
    it('should call detail dialog', () => {
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      const mockEvent = new MouseEvent('click')

      component.onDetail(mockEvent, user1)

      expect(component.idmUser).toEqual(user1)
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
      const mockEvent = new MouseEvent('click')

      component.onUserPermissions(mockEvent, user1)

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
