import { computed, Service, signal } from '@angular/core';
import { CalculatorType, InvestmentCalculationResults, InvestmentCalculator, TimeUnit } from '../models/calculator.model';
import { form } from '@angular/forms/signals';

@Service()
export class FinanceCalculatorsService {

    calculatorType = signal<CalculatorType>(CalculatorType.Investment)

    investmentCalculatorModel = signal<InvestmentCalculator>({
        startingAmount: 1000,
        yearlyReturnRate: 8,
        contribution: 100,
        contributionFrequency: TimeUnit.Week,
        yearsInvested: 10
    })
    investmentCalculatorForm = form(this.investmentCalculatorModel)

    investmentCalculationResult = computed<InvestmentCalculationResults>(() => this.investmentCalculation(this.investmentCalculatorModel()))

    investmentCalculation(investmentCalculator: InvestmentCalculator): InvestmentCalculationResults {
        const contributionFrequency = this.getNumbericTimeUnit(investmentCalculator.contributionFrequency);
        const totalContributions = contributionFrequency * investmentCalculator.yearsInvested
        const returnRate = (investmentCalculator.yearlyReturnRate / 100) / contributionFrequency
        let results: InvestmentCalculationResults = {
            startingBalance: investmentCalculator.startingAmount,
            endBalance: 0,
            totalContributions: investmentCalculator.contribution * totalContributions,
            totalInterest: 0,
            stats: []
        }

        let currentBalance = investmentCalculator.startingAmount

        for (let i: number = 1; i <= totalContributions; i++) {
            const startingBalance = currentBalance
            const interestEarned = startingBalance * returnRate

            currentBalance = startingBalance + interestEarned + investmentCalculator.contribution

            results.totalInterest += interestEarned
            results.endBalance = currentBalance
            results.stats.push({
                interval: investmentCalculator.contributionFrequency,
                intervalNumber: i,
                startingBalance: startingBalance,
                contribution: investmentCalculator.contribution,
                interestEarned: interestEarned,
                endingBalance: currentBalance
            })
        }

        console.log(results)
        return results
    }

    getNumbericTimeUnit(timeUnit: TimeUnit): number {
        switch (timeUnit) {
            case TimeUnit.Day:
                return 365
            case TimeUnit.Week:
                return 52
            case TimeUnit.Month:
                return 12
            case TimeUnit.Year:
                return 1
        }
    }
}
