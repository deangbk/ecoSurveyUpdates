import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OvPercentQuestionsComponent } from './ov-percent-questions.component';

describe('OvPercentQuestionsComponent', () => {
  let component: OvPercentQuestionsComponent;
  let fixture: ComponentFixture<OvPercentQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OvPercentQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OvPercentQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
