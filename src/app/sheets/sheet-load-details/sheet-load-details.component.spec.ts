import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetLoadDetailsComponent } from './sheet-load-details.component';

describe('SheetLoadDetailsComponent', () => {
  let component: SheetLoadDetailsComponent;
  let fixture: ComponentFixture<SheetLoadDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SheetLoadDetailsComponent]
    });
    fixture = TestBed.createComponent(SheetLoadDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
