import { computed, Service, signal } from '@angular/core';
import { CalculatorType, InvestmentCalculationResults, InvestmentCalculatorModel, MortgageCalculationResults, MortgageCalculatorModel, TimeUnit } from '../models/calculator.model';
import { form, min, pattern, required } from '@angular/forms/signals';

@Service()
export class FinanceCalculatorsService {

    calculatorTypeModel = signal<CalculatorType>(CalculatorType.Investment)
    calculatorTypeForm = form(this.calculatorTypeModel)

    investmentCalculatorModel = signal<InvestmentCalculatorModel>({
        startingAmount: 0,
        yearlyReturnRate: 7,
        contribution: 100,
        contributionFrequency: TimeUnit.Week,
        yearsInvested: 20
    })
    investmentCalculatorForm = form(this.investmentCalculatorModel, (schemaPath) => {
        min(schemaPath.startingAmount, 0, {message: 'Starting Amount cannot be negative'})
        min(schemaPath.yearlyReturnRate, 0, {message: 'Starting Amount cannot be negative'})
        min(schemaPath.contribution, 0, {message: 'Starting Amount cannot be negative'})
        min(schemaPath.yearsInvested, 1, {message: 'Starting Amount cannot be negative'})
    })

    investmentCalculationResult = computed<InvestmentCalculationResults>(() => {
        this.storeInvestmentCalculatorModel(this.investmentCalculatorModel())
        return this.investmentCalculation(this.investmentCalculatorModel())
    })

    mortgageCalculatorModel = signal<MortgageCalculatorModel>({
        mortgageAmount: 300000,
        mortgageTermYears: 30,
        interestRate: 6
    })
    mortgageCalculatorForm = form(this.mortgageCalculatorModel, (schemaPath) => {
        min(schemaPath.mortgageAmount, 0, {message: 'Starting Amount cannot be negative'})
        min(schemaPath.mortgageTermYears, 1, {message: 'Starting Amount cannot be negative'})
        min(schemaPath.interestRate, 0, {message: 'Starting Amount cannot be negative'})
    })

    mortgageCalculationResult = computed<MortgageCalculationResults>(() => {
        this.storeMortgageCalculatorModel(this.mortgageCalculatorModel())
        return this.mortgageCalculation(this.mortgageCalculatorModel())
    })

    constructor() {

        // initialize investmentCalculatorModel in localstorage
        if (localStorage.getItem('investment-calculator-model')) {
            const storedInvestmentCalculatorModel = JSON.parse(localStorage.getItem('investment-calculator-model')!)
            this.investmentCalculatorModel.set(storedInvestmentCalculatorModel)
        }
        else {
            this.storeInvestmentCalculatorModel(this.investmentCalculatorModel())
        }

        // initialize mortgageCalculatorModel in localstorage
        if (localStorage.getItem('mortgage-calculator-model')) {
            const storedMortgageCalculatorModel = JSON.parse(localStorage.getItem('mortgage-calculator-model')!)
            this.mortgageCalculatorModel.set(storedMortgageCalculatorModel)
        }
        else {
            this.storeMortgageCalculatorModel(this.mortgageCalculatorModel())
        }

    }

    private storeInvestmentCalculatorModel(investmentCalculatorModel: InvestmentCalculatorModel) {

        localStorage.setItem('investment-calculator-model', JSON.stringify(investmentCalculatorModel));
    }

    private storeMortgageCalculatorModel(mortgageCalculatorModel: MortgageCalculatorModel) {

        localStorage.setItem('mortgage-calculator-model', JSON.stringify(mortgageCalculatorModel));
    }


    investmentCalculation(investmentCalculatorModel: InvestmentCalculatorModel): InvestmentCalculationResults {
        const contributionFrequency = this.getNumbericTimeUnit(investmentCalculatorModel.contributionFrequency);
        const totalContributions = contributionFrequency * investmentCalculatorModel.yearsInvested
        const returnRate = (investmentCalculatorModel.yearlyReturnRate / 100) / contributionFrequency
        let results: InvestmentCalculationResults = {
            startingBalance: investmentCalculatorModel.startingAmount,
            endBalance: 0,
            totalContributions: investmentCalculatorModel.contribution * totalContributions,
            totalInterestEarned: 0,
            stats: []
        }

        let currentBalance = investmentCalculatorModel.startingAmount
        let contributionBalance = investmentCalculatorModel.startingAmount

        for (let i: number = 1; i <= totalContributions; i++) {
            const startingBalance = currentBalance
            const interestEarned = startingBalance * returnRate

            currentBalance = startingBalance + interestEarned + investmentCalculatorModel.contribution
            contributionBalance += investmentCalculatorModel.contribution

            results.totalInterestEarned += interestEarned
            results.endBalance = currentBalance
            results.stats.push({
                interval: investmentCalculatorModel.contributionFrequency,
                intervalNumber: i,
                startingBalance: startingBalance,
                contribution: investmentCalculatorModel.contribution,
                interestEarned: interestEarned,
                endingBalance: currentBalance,
                contributionBalance: contributionBalance
            })
        }

        return results
    }

    getNumbericTimeUnit(timeUnit: TimeUnit): number {
        switch (timeUnit) {
            case TimeUnit.Week:
                return 52
            case TimeUnit.Month:
                return 12
            case TimeUnit.Year:
                return 1
        }
    }

    mortgageCalculation(mortgageCalculatorModel: MortgageCalculatorModel): MortgageCalculationResults {
        const mortgageCalculationResults: MortgageCalculationResults[] = [];
        let results: MortgageCalculationResults = {
            totalPayment: 0,
            totalInterestPaid: 0,
            totalPrincipalPaid: 0,
            stats: []
        }
        
        // Convert annual percentage rate to a monthly decimal rate (r)
        const monthlyRate = (mortgageCalculatorModel.interestRate / 100) / 12;
        
        // Total number of monthly payments (n)
        const totalPayments = mortgageCalculatorModel.mortgageTermYears * 12;

        // Handle 0% interest edge case to prevent division by zero
        if (monthlyRate === 0) {
        const flatPayment = mortgageCalculatorModel.mortgageAmount / totalPayments;
        let balance = mortgageCalculatorModel.mortgageAmount;
        for (let m = 1; m <= totalPayments; m++) {

            results.totalPayment += flatPayment
            results.totalInterestPaid += 0
            results.totalPrincipalPaid += flatPayment

            balance -= flatPayment;
            results.stats.push({    
                month: m,
                monthlyPayment: flatPayment,
                interest: 0,
                principal: flatPayment,
                remainingBalance: Math.max(0, balance)
            });
        }
        return results;
        }

        // Step 1: Calculate the fixed monthly P&I payment (M)
        const exactPayment = mortgageCalculatorModel.mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                            (Math.pow(1 + monthlyRate, totalPayments) - 1);
        
        let remainingBalance = mortgageCalculatorModel.mortgageAmount;

        // Step 2: Loop through each month to calculate interest and principal components
        for (let month = 1; month <= totalPayments; month++) {
        // Calculate monthly interest based on current remaining balance
        const interestPayment = remainingBalance * monthlyRate;
        
        // Principal part is the total payment minus the interest part
        let principalPayment = exactPayment - interestPayment;

        // Adjust for the final month to prevent minor rounding discrepancies
        if (month === totalPayments) {
            principalPayment = remainingBalance;
        }

        results.totalPayment += (interestPayment + principalPayment)
        results.totalInterestPaid += interestPayment
        results.totalPrincipalPaid += principalPayment

        remainingBalance -= principalPayment;

        results.stats.push({
            month: month,
            monthlyPayment: (interestPayment + principalPayment),
            interest: interestPayment,
            principal: principalPayment,
            remainingBalance: Math.max(0, remainingBalance)
        });
        }

        return results;
    }
}
