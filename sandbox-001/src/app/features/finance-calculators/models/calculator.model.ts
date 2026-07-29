export enum CalculatorType {
    Investment = 'Investment',
    Mortgage = 'Mortgage',
    Tax = 'Tax'
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

export interface PayrollTaxLocalStorageObject {
    request: PayrollTaxApiRequest;
    response: PayrollTaxApiResponse | undefined;
}

export interface PayrollTaxApiRequest {
    workState: State;
    payDate: string;
    residenceState: State;
    grossWages: number;
    payPeriod: PayPeriod;
    filingStatus: FilingStatus;
    allowances: number;
}

export interface PayrollTaxApiResponse {
    grossWages: number;
    taxes: Tax[];
    work_state: State;
    residence_state: State;
}

export interface Tax {
    brackets: Bracket[];
    category: string;
    effective_date: string;
    jurisdiction: string;
    name: string;
    rate: number;
    rate_structure: string;
    supplemental_rate: number;
    tax_type_code: string;
    taxpayer_side: string;
    wage_base: number;
}

export interface PayableTax {
    name: string;
    rate_structure: string;
    rate: number;
    totalActualTax: number;
    brackets: Bracket[];
    wage_base: number;
}

export interface AllPayableTaxes {
    fed_income_ee: PayableTax;
    fed_fica_ss_ee: PayableTax;
    fed_fica_med_ee: PayableTax;
    work_state_income_ee: PayableTax;
    residence_state_income_ee: PayableTax;
}

export interface Bracket {
    from: number;
    rate: number;
    to: number;
    actualTax: number;
}

export enum FilingStatus {
    Single = 'single',
    Married = 'married',
}

export enum PayPeriod {
    Weekly = 'weekly',
    Biweekly = 'biweekly',
    Semimonthly = 'semimonthly',
    Monthly = 'monthly',
    Annual = 'annual'
}

export enum State {
    Alabama = 'AL',
    Alaska = 'AK',
    Arizona = 'AZ',
    Arkansas = 'AR',
    California = 'CA',
    Colorado = 'CO',
    Connecticut = 'CT',
    Delaware = 'DE',
    Florida = 'FL',
    Georgia = 'GA',
    Hawaii = 'HI',
    Idaho = 'ID',
    Illinois = 'IL',
    Indiana = 'IN',
    Iowa = 'IA',
    Kansas = 'KS',
    Kentucky = 'KY',
    Louisiana = 'LA',
    Maine = 'ME',
    Maryland = 'MD',
    Massachusetts = 'MA',
    Michigan = 'MI',
    Minnesota = 'MN',
    Mississippi = 'MS',
    Missouri = 'MO',
    Montana = 'MT',
    Nebraska = 'NE',
    Nevada = 'NV',
    New_Hampshire = 'NH',
    New_Jersey = 'NJ',
    New_Mexico = 'NM',
    New_York = 'NY',
    North_Carolina = 'NC',
    North_Dakota = 'ND',
    Ohio = 'OH',
    Oklahoma = 'OK',
    Oregon = 'OR',
    Pennsylvania = 'PA',
    Rhode_Island = 'RI',
    South_Carolina = 'SC',
    South_Dakota = 'SD',
    Tennessee = 'TN',
    Texas = 'TX',
    Utah = 'UT',
    Vermont = 'VT',
    Virginia = 'VA',
    Washington = 'WA',
    West_Virginia = 'WV',
    Wisconsin = 'WI',
    Wyoming = 'WY'
}