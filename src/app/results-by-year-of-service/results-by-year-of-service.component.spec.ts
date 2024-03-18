import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsByYearOfServiceComponent } from './results-by-year-of-service.component';

describe('ResultsByYearOfServiceComponent', () => {
  let component: ResultsByYearOfServiceComponent;
  let fixture: ComponentFixture<ResultsByYearOfServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsByYearOfServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsByYearOfServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
