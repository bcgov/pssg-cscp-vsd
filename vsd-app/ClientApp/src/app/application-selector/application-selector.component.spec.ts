import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApplicationSelectorComponent } from './application-selector.component';

describe('ApplicationSelectorComponent', () => {
  let component: ApplicationSelectorComponent;
  let fixture: ComponentFixture<ApplicationSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationSelectorComponent],
      imports: [RouterTestingModule, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ApplicationSelectorComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(ApplicationSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
