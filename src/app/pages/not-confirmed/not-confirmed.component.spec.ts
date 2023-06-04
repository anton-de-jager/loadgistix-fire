import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotConfirmedComponent } from './not-confirmed.component';

describe('NotConfirmedComponent', () => {
  let component: NotConfirmedComponent;
  let fixture: ComponentFixture<NotConfirmedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotConfirmedComponent]
    });
    fixture = TestBed.createComponent(NotConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
