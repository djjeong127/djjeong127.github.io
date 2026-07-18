import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { FinanceCalculatorsService } from './services/finance-calculators-service';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { FormField } from '@angular/forms/signals';
import { CurrencyPipe } from '@angular/common';
import { CalculatorType, InvestmentCalculationResults, InvestmentCalculationStats, TimeUnit } from './models/calculator.model';
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
  @ViewChild('investmentLineChart') investmentLineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('investmentPieChart') investmentPieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('investmentPaginator') investmentPaginator!: MatPaginator;

  investmentLineChart!: Chart
  investmentPieChart!: Chart

  financeCalculatorsService = inject(FinanceCalculatorsService)

  calculatorType = CalculatorType
  timeUnit = TimeUnit
  timeUnits: TimeUnit[] = Object.values(TimeUnit)


  investmentDataSource = computed(() => {
    let newTableData = new MatTableDataSource(this.financeCalculatorsService.investmentCalculationResult().stats)
    this.updateInvestmentLineChart(newTableData.data)
    this.updateInvestmentPieChart(this.financeCalculatorsService.investmentCalculationResult())
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
    this.initInvestmentLineChart();
    this.updateInvestmentLineChart(this.investmentDataSource().data);
    this.initInvestmentPieChart();
    this.updateInvestmentPieChart(this.financeCalculatorsService.investmentCalculationResult())
    this.investmentDataSource().paginator = this.investmentPaginator
  }

   initInvestmentLineChart(): void {
    const ctx = this.investmentLineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.investmentLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Populated dynamically
        datasets: [
          {
            label: 'Total Returns',
            data: [],
            borderColor: '#10b981', // Green line
            backgroundColor: '#10b981',
            tension: 0.2
          },
          {
            label: 'Contributions',
            data: [],
            borderColor: '#3b82f6', // Blue line
            backgroundColor: '#3b82f6',
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

  updateInvestmentLineChart(data: InvestmentCalculationStats[]): void {
    if (!this.investmentLineChart) return;

    const dataRows = data;

    // 1. Generate X-axis labels dynamically (e.g., "Year 1", "Year 2")
    this.investmentLineChart.data.labels = [`${data[0].interval} 0`, ...dataRows.map(row => `${row.interval} ${row.intervalNumber}`)];

    // 2. Map structural columns to explicit dataset array tracks
    // this.chart.data.datasets[0].data = dataRows.map(row => row.startingBalance);
    this.investmentLineChart.data.datasets[0].data = [data[0].startingBalance, ...dataRows.map(row => row.endingBalance)];
    this.investmentLineChart.data.datasets[1].data = [data[0].startingBalance, ...dataRows.map(row => row.contributionBalance)];

    // 3. Render update transformations smoothly
    this.investmentLineChart.update();
  }

  initInvestmentPieChart(): void {
    const ctx = this.investmentPieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.investmentPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Contributions', 'Total Returns', 'Other Metrics'], // Fixed section labels
        datasets: [{
          data: [], // Populated dynamically with 3 numbers during update
          borderColor: [
            '#f59e0b',
            '#3b82f6',
            '#10b981'
          ],
          backgroundColor: [
            '#f59e0b',
            '#3b82f6',
            '#10b981'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              // Formats tooltips to match financial dollar values on hover
              label: (context) => {
                const label = context.label ?? '';
                const value = context.parsed ?? 0;
                return ` ${label}: $${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

   updateInvestmentPieChart(data: InvestmentCalculationResults): void {
    if (!this.investmentPieChart) return;

    const labelList = ['Starting Amount', 'Total Contributions', 'Total Interest Earned']
    const dataList = [data.startingBalance, data.totalContributions, data.totalInterestEarned];

    // 1. Generate labels dynamically from data rows
    this.investmentPieChart.data.labels = labelList;

    // 2. Map structural columns to explicit dataset array tracks using index 0
    this.investmentPieChart.data.datasets[0].data = dataList;

    // 3. Render update transformations smoothly
    this.investmentPieChart.update();
  }

  ngOnDestroy(): void {
    if (this.investmentLineChart) {
      this.investmentLineChart.destroy();
    }
    if (this.investmentPieChart) {
      this.investmentPieChart.destroy();
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
