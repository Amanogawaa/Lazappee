import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MycartPageComponent } from './mycart-page.component';

describe('MycartPageComponent', () => {
  let component: MycartPageComponent;
  let fixture: ComponentFixture<MycartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MycartPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MycartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
