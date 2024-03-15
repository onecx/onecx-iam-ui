import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { Router, ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { UserSearchComponent } from './user-search.component'
import { User, UserPageResult, UsersInternalAPIService } from 'src/app/shared/generated'

describe('UserSearchComponent', () => {
  let component: UserSearchComponent
  let fixture: ComponentFixture<UserSearchComponent>
  let routerSpy = jasmine.createSpyObj('Router', ['navigate'])
  let routeMock = { snapshot: { paramMap: new Map() } }

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

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const apiUserServiceSpy = {
    searchUsersByCriteria: jasmine.createSpy('searchUsersByCriteria').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserSearchComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
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
    component.formGroup.controls['criteria'].setValue('testuserName')
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
    component.formGroup.controls['criteria'].setValue('testuserName')
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
    component.formGroup.controls['criteria'].setValue('testuserName')
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
  })

  it('should update filter and and sort Field', () => {
    const filter = 'testFilter'

    component.onFilterChange(filter)

    expect(component.filter).toBe(filter)

    component.onSortChange('field')

    expect(component.sortField).toBe('field')
  })
})
