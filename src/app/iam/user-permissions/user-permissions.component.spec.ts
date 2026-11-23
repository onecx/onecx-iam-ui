import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { provideTranslateTestingService } from '@onecx/angular-testing'

import { UserPermissionsComponent } from './user-permissions.component'

describe('UserPermissionsComponent', () => {
  let component: UserPermissionsComponent
  let fixture: ComponentFixture<UserPermissionsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UserPermissionsComponent],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        provideTranslateTestingService({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        })
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPermissionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
