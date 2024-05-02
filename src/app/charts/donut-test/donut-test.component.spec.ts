import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutTestComponent } from './donut-test.component';

describe('DonutTestComponent', () => {
  let component: DonutTestComponent;
  let fixture: ComponentFixture<DonutTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DonutTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonutTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
