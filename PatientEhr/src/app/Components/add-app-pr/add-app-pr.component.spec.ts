import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAppPrComponent } from './add-app-pr.component';

describe('AddAppPrComponent', () => {
  let component: AddAppPrComponent;
  let fixture: ComponentFixture<AddAppPrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAppPrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAppPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
