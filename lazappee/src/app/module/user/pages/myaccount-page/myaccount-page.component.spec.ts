import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyaccountPageComponent } from './myaccount-page.component';

describe('MyaccountPageComponent', () => {
  let component: MyaccountPageComponent;
  let fixture: ComponentFixture<MyaccountPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyaccountPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyaccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
