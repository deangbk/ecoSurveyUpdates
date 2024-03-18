import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateHoriTestComponent } from './template-hori-test.component';

describe('TemplateHoriTestComponent', () => {
  let component: TemplateHoriTestComponent;
  let fixture: ComponentFixture<TemplateHoriTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateHoriTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateHoriTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
