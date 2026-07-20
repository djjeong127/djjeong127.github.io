export enum CalculatorType {
    Investment = 'Investment',
    Mortgage = 'Mortgage',
    Paycheck = 'Paycheck'
}

export enum TimeUnit {
    Week = 'Week',
    Month = 'Month',
    Year = 'Year'
}

export interface InvestmentCalculatorModel {
    startingAmount: number;
    yearlyReturnRate: number;
    contribution: number;
    contributionFrequency: TimeUnit;
    yearsInvested: number;
}

export interface InvestmentCalculationResults {
    startingBalance: number;
    endBalance: number;
    totalContributions: number;
    totalInterestEarned: number;
    stats: InvestmentCalculationStats[]
}

export interface InvestmentCalculationStats {
    interval: TimeUnit;
    intervalNumber: number;
    startingBalance: number;
    contribution: number;
    interestEarned: number;
    endingBalance: number;
    contributionBalance: number;
}

export interface MortgageCalculatorModel {
    mortgageAmount: number;
    mortgageTermYears: number;
    interestRate: number;
}

export interface MortgageCalculationResults {
    monthlyPayment: number;
    totalPayment: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
    stats: MortgageCalculationStats[]
}

export interface MortgageCalculationStats {
    month: number;
    monthlyPayment: number;
    interest: number;
    principal: number;
    remainingBalance: number;
}