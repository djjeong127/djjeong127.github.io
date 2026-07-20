import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { FinanceCalculatorsService } from './services/finance-calculators-service';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { FormField } from '@angular/forms/signals';
import { CurrencyPipe } from '@angular/common';
import { CalculatorType, InvestmentCalculationResults, InvestmentCalculationStats, MortgageCalculationResults, MortgageCalculationStats, TimeUnit } from './models/calculator.model';
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

  @ViewChild('mortgageBarChart') mortgageBarChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mortgagePieChart') mortgagePieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mortgagePaginator') mortgagePaginator!: MatPaginator;

  investmentLineChart!: Chart
  investmentPieChart!: Chart

  mortgageBarChart!: Chart
  mortgagePieChart!: Chart

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
  investmentDisplayedColumns = computed<string[]>(() => [
    this.financeCalculatorsService.investmentCalculatorModel().contributionFrequency,
    'startingBalance',
    'contribution',
    'interestEarned',
    'endingBalance'
  ])

  mortgageDataSource = computed(() => {
    let newTableData = new MatTableDataSource(this.financeCalculatorsService.mortgageCalculationResult().stats)
    this.updateMortgageBarChart(newTableData.data)
    this.updateMortgagePieChart(this.financeCalculatorsService.mortgageCalculationResult())
    newTableData.paginator = this.mortgagePaginator
    return newTableData
  })
  mortgageDisplayedColumns = computed<string[]>(() => [
    'month',
    'monthlyPayment',
    'interest',
    'principal',
    'remainingBalance'
  ])

  ngAfterViewInit() {
    this.initInvestmentLineChart();
    this.updateInvestmentLineChart(this.investmentDataSource().data);
    this.initInvestmentPieChart();
    this.updateInvestmentPieChart(this.financeCalculatorsService.investmentCalculationResult())
    this.investmentDataSource().paginator = this.investmentPaginator

    this.initMortgageBarChart();
    this.updateMortgageBarChart(this.mortgageDataSource().data);
    this.initMortgagePieChart();
    this.updateMortgagePieChart(this.financeCalculatorsService.mortgageCalculationResult())
    this.mortgageDataSource().paginator = this.mortgagePaginator

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
            label: 'Returns',
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
          // title: {
          //   display: true,
          //   text: 'Investments',
          // },
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
        labels: [], // Populated dynamically
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
          title: {
            display: true,
            text: 'Total Investments',
          },
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

    const labelList = ['Starting Amount', 'Contributions', 'Interest Earned']
    const dataList = [data.startingBalance, data.totalContributions, data.totalInterestEarned];

    // 1. Generate labels dynamically from data rows
    this.investmentPieChart.data.labels = labelList;

    // 2. Map structural columns to explicit dataset array tracks using index 0
    this.investmentPieChart.data.datasets[0].data = dataList;

    // 3. Render update transformations smoothly
    this.investmentPieChart.update();
  }

  initMortgageBarChart(): void {
    const ctx = this.mortgageBarChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.mortgageBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [], // Populated dynamically
        datasets: [
          {
            label: 'Principal',
            data: [],
            borderColor: '#10b981', // Green line
            backgroundColor: '#10b981',
            borderWidth: 1,
            stack: 'stack 1'
          },
          {
            label: 'Interest',
            data: [],
            borderColor: '#3b82f6', // Blue line
            backgroundColor: '#3b82f6',
            borderWidth: 1,
            stack: 'stack 1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          // title: {
          //   display: true,
          //   text: 'Monthly Payments'
          // },
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
            stacked: true
          },
          y: {
            stacked: true,
            ticks: {
              // Optional: Format Y-axis numbers as currency
              callback: function(value) { return '$' + value; }
            }
          }
        }
      }
    });
  }

  updateMortgageBarChart(data: MortgageCalculationStats[]): void {
  if (!this.mortgageBarChart) return;

  // 1. Generate X-axis labels dynamically (e.g., "Month 1", "Month 2")
  this.mortgageBarChart.data.labels = data.map(row => `Month ${row.month}`);

  // 2. Map structural columns to explicit dataset array tracks
  // Dataset 0: Principal Paid (Bottom section)
  this.mortgageBarChart.data.datasets[0].data = data.map(row => row.principal);
  
  // Dataset 1: Interest Paid (Top section)
  this.mortgageBarChart.data.datasets[1].data = data.map(row => row.interest);

  // 3. Render update transformations smoothly
  this.mortgageBarChart.update();
}

  initMortgagePieChart(): void {
    const ctx = this.mortgagePieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.mortgagePieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [], // Populated dynamically
        datasets: [{
          data: [], // Populated dynamically with 3 numbers during update
          borderColor: [
            '#3b82f6',
            '#f59e0b',
          ],
          backgroundColor: [
            '#3b82f6',
            '#f59e0b',
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Total Payment'
          },
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

   updateMortgagePieChart(data: MortgageCalculationResults): void {
    if (!this.mortgagePieChart) return;

    const labelList = ['Principal', 'Interest']
    const dataList = [data.totalPrincipalPaid, data.totalInterestPaid];

    // 1. Generate labels dynamically from data rows
    this.mortgagePieChart.data.labels = labelList;

    // 2. Map structural columns to explicit dataset array tracks using index 0
    this.mortgagePieChart.data.datasets[0].data = dataList;

    // 3. Render update transformations smoothly
    this.mortgagePieChart.update();
  }

  ngOnDestroy(): void {
    if (this.investmentLineChart) {
      this.investmentLineChart.destroy();
    }
    if (this.investmentPieChart) {
      this.investmentPieChart.destroy();
    }

    if (this.mortgageBarChart) {
      this.mortgageBarChart.destroy();
    }
    if (this.mortgagePieChart) {
      this.mortgagePieChart.destroy();
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

  autoFillIfBlankMortgage() {
    if (this.financeCalculatorsService.mortgageCalculatorModel().mortgageAmount === null) {
      this.financeCalculatorsService.mortgageCalculatorModel.update((model) => ({...model, mortgageAmount: 0}))
    }
    if (this.financeCalculatorsService.mortgageCalculatorModel().mortgageTermYears === null) {
      this.financeCalculatorsService.mortgageCalculatorModel.update((model) => ({...model, mortgageTermYears: 1}))
    }
    if (this.financeCalculatorsService.mortgageCalculatorModel().interestRate === null) {
      this.financeCalculatorsService.mortgageCalculatorModel.update((model) => ({...model, interestRate: 0}))
    }
  }
}
