export enum CalculatorType {
    Investment = 'Investment',
    Mortgage = 'Mortgage'
}

export enum TimeUnit {
    Day = 'Day',
    Week = 'Week',
    Month = 'Month',
    Year = 'Year'
}

export interface InvestmentCalculator {
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
    totalInterest: number;
    stats: InvestmentCalculationStats[]
}

export interface InvestmentCalculationStats {
    interval: TimeUnit;
    intervalNumber: number;
    startingBalance: number;
    contribution: number;
    interestEarned: number;
    endingBalance: number;
}

export interface MortgageCalculator {

}