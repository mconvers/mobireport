import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPromptComponent } from './report-prompt.component';

describe('ReportPromptComponent', () => {
  let component: ReportPromptComponent;
  let fixture: ComponentFixture<ReportPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportPromptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
