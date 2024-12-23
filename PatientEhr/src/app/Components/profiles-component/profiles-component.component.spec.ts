import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilesComponentComponent } from './profiles-component.component';

describe('ProfilesComponentComponent', () => {
  let component: ProfilesComponentComponent;
  let fixture: ComponentFixture<ProfilesComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilesComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
