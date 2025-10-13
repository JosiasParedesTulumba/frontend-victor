import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReservasComponent } from './edit-reservas.component';

describe('EditReservasComponent', () => {
  let component: EditReservasComponent;
  let fixture: ComponentFixture<EditReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
