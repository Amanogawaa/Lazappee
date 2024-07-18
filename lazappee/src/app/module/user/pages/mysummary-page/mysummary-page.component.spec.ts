import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MysummaryPageComponent } from './mysummary-page.component';

describe('MysummaryPageComponent', () => {
  let component: MysummaryPageComponent;
  let fixture: ComponentFixture<MysummaryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MysummaryPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MysummaryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
