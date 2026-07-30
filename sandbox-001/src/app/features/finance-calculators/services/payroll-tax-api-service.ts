import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { FilingStatus, PayPeriod, PayrollTaxApiRequest, PayrollTaxApiResponse, State } from '../models/calculator.model';
import { formatDate } from '@angular/common';

@Service()
export class PayrollTaxApiService {
    http = inject(HttpClient)

     private baseUrl = 'https://payrolltaxapi.com/v1';

    private ratesLookupUrl = this.baseUrl + '/rates/lookup?';
    private jurisdictionsUrl = this.baseUrl + '/jurisdictions?';
    private ratesChangesUrl = this.baseUrl + '/rates/changes?';

    // private header = new HttpHeaders().set('Authorization', 'Bearer ptx_free_c27e1fa1767d4914a7d033b7071c6148a8ae15b5649212e6')
    private header = new HttpHeaders().set('Authorization', 'Bearer ptx_free_c62ee16accade98de5c66b826ab8223ad13010d94c460374')


    getRatesLookup(payrollTaxApiRequest: PayrollTaxApiRequest): Observable<PayrollTaxApiResponse> {
        return this.http.get<PayrollTaxApiResponse>(this.ratesLookupUrl + `workState=${payrollTaxApiRequest.workState}&payDate=${payrollTaxApiRequest.payDate + '-01-01'}&residenceState=${payrollTaxApiRequest.residenceState}&grossWages=${payrollTaxApiRequest.grossWages}&payPeriod=${payrollTaxApiRequest.payPeriod}&filingStatus=${payrollTaxApiRequest.filingStatus}&allowances=${payrollTaxApiRequest.allowances}`, {headers: this.header})
    }

}
