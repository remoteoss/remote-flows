import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CostCalculatorConfig {
  estimationOptions: {
    title: string;
    includeBenefits: boolean;
    includeCostBreakdowns: boolean;
    includePremiumBenefits?: boolean;
    enableCurrencyConversion?: boolean;
  };
  proxy?: {
    url: string;
  };
  isClientToken?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RemoteFlowsService {
  private resultsSubject = new BehaviorSubject<any>(null);
  private payloadSubject = new BehaviorSubject<any>(null);

  public results$ = this.resultsSubject.asObservable();
  public payload$ = this.payloadSubject.asObservable();

  handleSubmit(payload: any) {
    console.log('Angular service - submit:', payload);
    this.payloadSubject.next(payload);
  }

  handleSuccess(response: any) {
    console.log('Angular service - success:', response);
    this.resultsSubject.next(response);
  }

  handleError(error: any) {
    console.error('Angular service - error:', error);
  }

  handleReset() {
    console.log('Angular service - reset');
    this.resultsSubject.next(null);
    this.payloadSubject.next(null);
  }

  getCurrentResults() {
    return this.resultsSubject.value;
  }

  getCurrentPayload() {
    return this.payloadSubject.value;
  }
}
