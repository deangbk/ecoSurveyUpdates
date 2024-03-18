import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateVertGroupedComponent } from './template-vert-grouped.component';

describe('TemplateVertGroupedComponent', () => {
  let component: TemplateVertGroupedComponent;
  let fixture: ComponentFixture<TemplateVertGroupedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateVertGroupedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateVertGroupedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
