import { Component } from '@angular/core';
import { AngularMaterialModule } from '../../shared/modules/angular-material.module';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-investing-calculator',
  standalone: true,
  imports: [AngularMaterialModule, ReactiveFormsModule],
  templateUrl: './investing-calculator.component.html',
  styleUrl: './investing-calculator.component.scss'
})
export class InvestingCalculatorComponent {

  inputForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ){
    this.inputForm = this.formBuilder.group({
      startingAmountControl: [''],
      additionalContributionControl: [''],
      returnRateControl: [''],
      timePeriodControl: ['']
    });
  }

}
