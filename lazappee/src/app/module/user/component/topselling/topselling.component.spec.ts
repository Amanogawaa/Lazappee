import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopsellingComponent } from './topselling.component';

describe('TopsellingComponent', () => {
  let component: TopsellingComponent;
  let fixture: ComponentFixture<TopsellingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopsellingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopsellingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
