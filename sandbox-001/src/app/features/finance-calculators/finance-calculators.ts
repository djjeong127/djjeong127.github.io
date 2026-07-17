import { Component, inject } from '@angular/core';
import { FinanceCalculatorsService } from './services/finance-calculators-service';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { FormField } from '@angular/forms/signals';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-finance-calculators',
  imports: [ANGULAR_MATERIAL_MODULES, FormField, CurrencyPipe],
  templateUrl: './finance-calculators.html',
  styleUrl: './finance-calculators.scss',
})
export class FinanceCalculators {
  financeCalculatorsService = inject(FinanceCalculatorsService)

}
