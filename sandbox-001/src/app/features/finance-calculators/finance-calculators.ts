import { Component, computed, inject, ViewChild } from '@angular/core';
import { FinanceCalculatorsService } from './services/finance-calculators-service';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { FormField } from '@angular/forms/signals';
import { CurrencyPipe } from '@angular/common';
import { CalculatorType, TimeUnit } from './models/calculator.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-finance-calculators',
  imports: [ANGULAR_MATERIAL_MODULES, FormField, CurrencyPipe],
  templateUrl: './finance-calculators.html',
  styleUrl: './finance-calculators.scss',
})
export class FinanceCalculators {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  financeCalculatorsService = inject(FinanceCalculatorsService)

  calculatorType = CalculatorType
  timeUnit = TimeUnit
  timeUnits: TimeUnit[] = Object.values(TimeUnit)


  dataSource = computed(() => {
    let newTableData = new MatTableDataSource(this.financeCalculatorsService.investmentCalculationResult().stats)
    newTableData.paginator = this.paginator
    return newTableData
  })
  displayedColumns = computed<string[]>(() => [
    this.financeCalculatorsService.investmentCalculatorModel().contributionFrequency,
    'startingBalance',
    'contribution',
    'interestEarned',
    'endingBalance'
  ])

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator
  }

  autoFillIfBlank() {
    if (this.financeCalculatorsService.investmentCalculatorModel().startingAmount === null) {
      this.financeCalculatorsService.investmentCalculatorModel.update((model) => ({...model, startingAmount: 0}))
    }
    if (this.financeCalculatorsService.investmentCalculatorModel().yearlyReturnRate === null) {
      this.financeCalculatorsService.investmentCalculatorModel.update((model) => ({...model, yearlyReturnRate: 0}))
    }
    if (this.financeCalculatorsService.investmentCalculatorModel().contribution === null) {
      this.financeCalculatorsService.investmentCalculatorModel.update((model) => ({...model, contribution: 0}))
    }
    if (this.financeCalculatorsService.investmentCalculatorModel().yearsInvested === null) {
      this.financeCalculatorsService.investmentCalculatorModel.update((model) => ({...model, yearsInvested: 1}))
    }
  }
}
