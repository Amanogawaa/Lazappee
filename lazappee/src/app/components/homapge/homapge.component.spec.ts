import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomapgeComponent } from './homapge.component';

describe('HomapgeComponent', () => {
  let component: HomapgeComponent;
  let fixture: ComponentFixture<HomapgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomapgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomapgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
