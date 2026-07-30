import { computed, inject, Service, signal } from '@angular/core';
import { Bracket, CalculatorType, FilingStatus, InvestmentCalculationResults, InvestmentCalculatorModel, MortgageCalculationResults, MortgageCalculatorModel, PayableTax, PayPeriod, PayrollTaxApiRequest, PayrollTaxApiResponse, PayrollTaxLocalStorageObject, State, Tax, TimeUnit } from '../models/calculator.model';
import { form, MAX_NUMBER, min, pattern, required } from '@angular/forms/signals';
import { PayrollTaxApiService } from './payroll-tax-api-service';
import { map } from 'rxjs';

@Service()
export class FinanceCalculatorsService {

    payrollTaxApiService = inject(PayrollTaxApiService)

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

    taxCalculatorModel = signal<PayrollTaxApiRequest>({
        workState: State.New_York,
        payDate: new Date().getFullYear().toString(),
        residenceState: State.New_York,
        grossWages: 100000,
        payPeriod: PayPeriod.Annual,
        filingStatus: FilingStatus.Single,
        allowances: 0
    })
    taxCalculatorForm = form(this.taxCalculatorModel, (schemaPath) => {
        min(schemaPath.grossWages, 1, {message: 'Starting Amount cannot be negative'})
    })

    taxRateResult = signal<PayrollTaxApiResponse | undefined>(undefined)


    constructor() {

        // initialize calculatorType in localstorage
        if (localStorage.getItem('calculator-type')) {
            const storedCalculatorType = JSON.parse(localStorage.getItem('calculator-type')!)
            this.calculatorTypeModel.set(storedCalculatorType)
        }
        else {
            this.storeCalculatorType(this.calculatorTypeModel())
        }

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

        // initialize taxCalculatorModel in localstorage
        if (localStorage.getItem('tax-calculator-local-storage-object')) {
            const storedTaxCalculatorLocalStorageObject: PayrollTaxLocalStorageObject = JSON.parse(localStorage.getItem('tax-calculator-local-storage-object')!)
            this.taxCalculatorModel.set(storedTaxCalculatorLocalStorageObject.request)
            this.taxRateResult.set(storedTaxCalculatorLocalStorageObject.response)
        }
        else {
            //send request for initial taxRateResult population
            this.getTaxInfo()
            const taxCalculatorLocalStorageObject: PayrollTaxLocalStorageObject = {
                request: this.taxCalculatorModel(),
                response: this.taxRateResult()
            }
            this.storeTaxCalculatorLocalStorageObject(taxCalculatorLocalStorageObject)
        }

    }

    storeCalculatorType(calculatorType: CalculatorType) {

        localStorage.setItem('calculator-type', JSON.stringify(calculatorType));
    }

    private storeInvestmentCalculatorModel(investmentCalculatorModel: InvestmentCalculatorModel) {

        localStorage.setItem('investment-calculator-model', JSON.stringify(investmentCalculatorModel));
    }

    private storeMortgageCalculatorModel(mortgageCalculatorModel: MortgageCalculatorModel) {

        localStorage.setItem('mortgage-calculator-model', JSON.stringify(mortgageCalculatorModel));
    }

    private storeTaxCalculatorLocalStorageObject(taxCalculatorLocalStorageObject: PayrollTaxLocalStorageObject) {
        localStorage.setItem('tax-calculator-local-storage-object', JSON.stringify(taxCalculatorLocalStorageObject));
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
            monthlyPayment: 0,
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

            results.monthlyPayment = flatPayment
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

        results.monthlyPayment = interestPayment + principalPayment
        results.totalPayment += interestPayment + principalPayment
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

    getTaxInfo() {

        this.payrollTaxApiService.getRatesLookup(this.taxCalculatorModel()).pipe(
            map((response: PayrollTaxApiResponse) => {
                const editedResponse: PayrollTaxApiResponse = {
                    grossWages: this.taxCalculatorModel().grossWages,
                    taxes: response.taxes,
                    work_state: response.work_state,
                    residence_state: response.residence_state
                }
                return editedResponse
            })
        ).subscribe({
            next: (response) => {
                this.taxRateResult.set(response)
                const newTaxCalculatorObject: PayrollTaxLocalStorageObject = {
                    request: this.taxCalculatorModel(),
                    response: this.taxRateResult()
                }
                this.storeTaxCalculatorLocalStorageObject(newTaxCalculatorObject)
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {

            }
        })
    }

    getSpecificStateTax(taxTypeCode: string): Tax {
        let tax = this.taxRateResult()?.taxes.find((tax: Tax) => tax.tax_type_code === taxTypeCode)

        const emptyStateTax: Tax = {
            brackets: [{
                from: 0,
                rate: 0,
                to: Number.MAX_VALUE,
                actualTax: 0
            }],
            category: 'income',
            effective_date: '',
            jurisdiction: '',
            name: `${Object.keys(State).find((state) => State[state as keyof typeof State] === taxTypeCode.slice(0, 2))?.replaceAll('_', ' ')} Income Tax`,
            rate: 0,
            rate_structure: '',
            supplemental_rate: 0,
            tax_type_code: taxTypeCode,
            taxpayer_side: '',
            wage_base: 0
        }
        if (tax === undefined) {
            tax = emptyStateTax
        }

        return tax
        
    }

    getEstimatedTaxes(grossWages: number, tax: Tax): PayableTax {
        let totalPayableTax: number = 0
        let editedBrackets: Bracket[] = []

        if (tax.rate_structure === 'flat_percent') {
            const payableTax: PayableTax = {
                name: tax.name,
                rate_structure: tax.rate_structure,
                rate: tax.rate,
                totalActualTax: grossWages * tax.rate,
                brackets: [],
                wage_base: 0
            }
            return payableTax
        }
        else if (tax.rate_structure === 'wage_base_capped') {
            const payableTax: PayableTax = {
                name: tax.name,
                rate_structure: tax.rate_structure,
                rate: tax.rate,
                totalActualTax: grossWages <= tax.wage_base ? grossWages * tax.rate : tax.wage_base * tax.rate,
                brackets: [],
                wage_base: tax.wage_base
            }
            return payableTax
        }
        else if (tax.rate_structure === 'graduated') {
            tax.brackets.forEach((bracket) => {
                if (grossWages > bracket.from) {
                    if (grossWages > bracket.to && bracket.to !== null) {
                        const bracketTax = (bracket.to - bracket.from) * bracket.rate
                        const editedBracket: Bracket = {
                            ...bracket,
                            actualTax: bracketTax
                        }
                        editedBrackets.push(editedBracket)
                        totalPayableTax += bracketTax

                    }
                    else {
                        const bracketTax = (grossWages - bracket.from) * bracket.rate
                        const editedBracket: Bracket = {
                            ...bracket,
                            actualTax: bracketTax
                        }
                        editedBrackets.push(editedBracket)
                        totalPayableTax += bracketTax
                    }
                }
                else {
                    const editedBracket: Bracket = {
                        ...bracket,
                        actualTax: 0
                    }
                    editedBrackets.push(editedBracket)
                }
            })

            const payableTax: PayableTax = {
                name: tax.name,
                rate_structure: tax.rate_structure,
                rate: tax.brackets.find((bracket) => bracket.from < grossWages && (grossWages <= bracket.to || bracket.to === null))!.rate,
                totalActualTax: totalPayableTax,
                brackets: editedBrackets,
                wage_base: 0
            }
            return payableTax
        }
        else {
            // console.error(`haven't accounted for ${tax.name} tax structure: ${tax.rate_structure}`)
            const payableTax: PayableTax = {
                name: tax.name,
                rate_structure: tax.rate_structure,
                rate: tax.rate,
                totalActualTax: 0,
                brackets: [],
                wage_base: 0
            }
            return payableTax
        }
        
        
    

        

    }
}
