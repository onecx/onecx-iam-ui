import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { User, UserPageResult, UsersInternalAPIService } from 'src/app/shared/generated'
import { UserSearchComponent, UserSearchCriteria } from './user-search.component'

const form = new FormGroup<UserSearchCriteria>({
  userName: new FormControl<string | null>(null),
  firstName: new FormControl<string | null>(null),
  lastName: new FormControl<string | null>(null),
  email: new FormControl<string | null>(null)
})

const user1: User = {
  username: 'username1',
  firstName: 'firstname1'
}
const user2: User = {
  username: 'username2',
  firstName: 'firstname2'
}
const UserPageResult: UserPageResult = {
  totalElements: 1,
  number: 10,
  size: 10,
  totalPages: 2,
  stream: [user1]
}
const UserPageResult2: UserPageResult = {
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

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const apiUserServiceSpy = {
    searchUsersByCriteria: jasmine.createSpy('searchUsersByCriteria').and.returnValue(of({}))
  }

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
        { provide: UsersInternalAPIService, useValue: apiUserServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchComponent)
    component = fixture.componentInstance
    // fixture.detectChanges()
    fixture.componentInstance.ngOnInit() // solved ExpressionChangedAfterItHasBeenCheckedError
  })

  afterEach(() => {
    apiUserServiceSpy.searchUsersByCriteria.calls.reset()
    translateServiceSpy.get.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call searchApps onSearch', () => {
    spyOn(component, 'searchUsers')

    component.onSearch()

    expect(component.searchUsers).toHaveBeenCalled()
  })

  it('should search users result stream list equals 1', (done) => {
    component.formGroup.controls['userName'].setValue('testuserName')
    apiUserServiceSpy.searchUsersByCriteria.and.returnValue(of(UserPageResult as UserPageResult))

    component.searchUsers()

    component.usersPageResult$.subscribe({
      next: (users) => {
        expect(users.stream?.length).toBe(1)
        expect(users.stream?.at(0)).toBe(user1)
        done()
      },
      error: done.fail
    })
  })

  it('should search users result empty', (done) => {
    component.formGroup.controls['userName'].setValue('testuserName')
    apiUserServiceSpy.searchUsersByCriteria.and.returnValue(of({} as UserPageResult))

    component.searchUsers()

    component.usersPageResult$.subscribe({
      next: (users) => {
        expect(users.stream?.length).toBeUndefined()
        done()
      },
      error: done.fail
    })
  })

  it('should search users result stream list equals 2', (done) => {
    component.formGroup.controls['userName'].setValue('testuserName')
    apiUserServiceSpy.searchUsersByCriteria.and.returnValue(of(UserPageResult2 as UserPageResult))

    component.searchUsers()

    component.usersPageResult$.subscribe({
      next: (users) => {
        expect(users.stream?.length).toBe(2)
        expect(users.stream?.at(0)).toBe(user1)
        expect(users.stream?.at(1)).toBe(user2)
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
    apiUserServiceSpy.searchUsersByCriteria.and.returnValue(throwError(() => errorResponse))
    spyOn(console, 'error')

    component.searchUsers()

    component.usersPageResult$.subscribe({
      next: (users) => {
        if (users.stream) {
          expect(users.stream.length).toBe(0)
          expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.USER')
          expect(console.error).toHaveBeenCalledWith('searchUsersByCriteria', errorResponse)
        }
        done()
      },
      error: done.fail
    })
  })

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

  it('should update sortOrder based on asc boolean onSortDirChange', () => {
    component.onSortDirChange(true)
    expect(component.sortOrder).toBe(-1)

    component.onSortDirChange(false)
    expect(component.sortOrder).toBe(1)
  })

  it('should navigate back onRoleSeartcjh', () => {
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
