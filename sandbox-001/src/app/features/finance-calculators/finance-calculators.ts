import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { FinanceCalculatorsService } from './services/finance-calculators-service';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { FormField } from '@angular/forms/signals';
import { CurrencyPipe } from '@angular/common';
import { CalculatorType, InvestmentCalculationStats, TimeUnit } from './models/calculator.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Chart } from 'chart.js/auto'

@Component({
  selector: 'app-finance-calculators',
  imports: [ANGULAR_MATERIAL_MODULES, FormField, CurrencyPipe],
  templateUrl: './finance-calculators.html',
  styleUrl: './finance-calculators.scss',
})
export class FinanceCalculators {
  @ViewChild('investmentChart') investmentChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('investmentPaginator') investmentPaginator!: MatPaginator;

  investmentChart!: Chart

  financeCalculatorsService = inject(FinanceCalculatorsService)

  calculatorType = CalculatorType
  timeUnit = TimeUnit
  timeUnits: TimeUnit[] = Object.values(TimeUnit)


  investmentDataSource = computed(() => {
    let newTableData = new MatTableDataSource(this.financeCalculatorsService.investmentCalculationResult().stats)
    this.updateChartWithTableData(newTableData.data)
    newTableData.paginator = this.investmentPaginator
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
    this.initChart();
    this.updateChartWithTableData(this.investmentDataSource().data);
    this.investmentDataSource().paginator = this.investmentPaginator
  }

   initChart(): void {
    const ctx = this.investmentChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.investmentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Populated dynamically
        datasets: [
          {
            label: 'Total Returns',
            data: [],
            borderColor: '#3b82f6', // Blue line
            backgroundColor: '#3b82f6',
            tension: 0.2
          },
          {
            label: 'Contributions',
            data: [],
            borderColor: '#10b981', // Green line
            backgroundColor: '#10b981',
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              // Formats tooltips to match financial dollar values on hover
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `${context.dataset.label}: $${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              autoSkip: true,
              callback: (value) => `${this.financeCalculatorsService.investmentCalculatorModel().contributionFrequency} ` + value.toLocaleString()
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toLocaleString()
            }
          }
        }
      }
    });
  }

  updateChartWithTableData(data: InvestmentCalculationStats[]): void {
    if (!this.investmentChart) return;

    const dataRows = data;

    // 1. Generate X-axis labels dynamically (e.g., "Year 1", "Year 2")
    this.investmentChart.data.labels = [`${data[0].interval} 0`, ...dataRows.map(row => `${row.interval} ${row.intervalNumber}`)];

    // 2. Map structural columns to explicit dataset array tracks
    // this.chart.data.datasets[0].data = dataRows.map(row => row.startingBalance);
    this.investmentChart.data.datasets[0].data = [data[0].startingBalance, ...dataRows.map(row => row.endingBalance)];
    this.investmentChart.data.datasets[1].data = [data[0].startingBalance, ...dataRows.map(row => row.contributionBalance)];

    // 3. Render update transformations smoothly
    this.investmentChart.update();
  }

  ngOnDestroy(): void {
    if (this.investmentChart) {
      this.investmentChart.destroy();
    }
  }

  autoFillIfBlankInvestment() {
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
