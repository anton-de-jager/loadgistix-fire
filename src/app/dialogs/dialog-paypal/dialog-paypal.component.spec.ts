import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPaypalComponent } from './dialog-paypal.component';

describe('DialogPaypalComponent', () => {
  let component: DialogPaypalComponent;
  let fixture: ComponentFixture<DialogPaypalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogPaypalComponent]
    });
    fixture = TestBed.createComponent(DialogPaypalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
