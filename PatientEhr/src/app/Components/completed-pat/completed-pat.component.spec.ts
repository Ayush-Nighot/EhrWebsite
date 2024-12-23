import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedPatComponent } from './completed-pat.component';

describe('CompletedPatComponent', () => {
  let component: CompletedPatComponent;
  let fixture: ComponentFixture<CompletedPatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedPatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedPatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
