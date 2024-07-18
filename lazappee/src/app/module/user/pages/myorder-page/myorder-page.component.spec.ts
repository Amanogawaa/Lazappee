import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyorderPageComponent } from './myorder-page.component';

describe('MyorderPageComponent', () => {
  let component: MyorderPageComponent;
  let fixture: ComponentFixture<MyorderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyorderPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyorderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
