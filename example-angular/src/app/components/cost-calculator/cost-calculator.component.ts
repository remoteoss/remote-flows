import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
  RemoteFlowsService,
  CostCalculatorConfig,
} from "../../services/remote-flows.service";
import { $TSFixMe } from "@remoteoss/remote-flows";

@Component({
  selector: "app-cost-calculator",
  template: `
    <div class="cost-calculator-container">
      <div class="header">
        <h1>Remote Flows - Angular Integration</h1>
        <p>Cost Calculator with Web Components</p>
      </div>

      <div class="controls-section">
        <div class="config-controls">
          <h3>Configuration</h3>
          <label>
            <input
              type="text"
              [(ngModel)]="config.estimationOptions.title"
              (change)="updateConfig()"
              placeholder="Calculator title"
            />
            Title
          </label>
          <label>
            <input
              type="checkbox"
              [(ngModel)]="config.estimationOptions.includeBenefits"
              (change)="updateConfig()"
            />
            Include Benefits
          </label>
          <label>
            <input
              type="checkbox"
              [(ngModel)]="config.estimationOptions.includeCostBreakdowns"
              (change)="updateConfig()"
            />
            Include Cost Breakdowns
          </label>
        </div>

        <div class="status-panel">
          <h3>Status</h3>
          <div class="status-item">
            <span class="label">Web Component:</span>
            <span class="value" [class.loaded]="isWebComponentLoaded">
              {{ isWebComponentLoaded ? "Loaded" : "Loading..." }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Last Event:</span>
            <span class="value">{{ lastEventType || "None" }}</span>
          </div>
        </div>
      </div>

      <!-- Web Component Integration -->
      <div class="calculator-wrapper">
        <cost-calculator-widget
          #calculator
          [attr.config]="configJson"
          (submitEvent)="onSubmit($event)"
          (successEvent)="onSuccess($event)"
          (errorEvent)="onError($event)"
          (resetEvent)="onReset($event)"
        >
        </cost-calculator-widget>
      </div>

      <!-- Angular Results Section -->
      <div class="results-section" *ngIf="results">
        <h3>Results (Handled by Angular)</h3>
        <div class="result-card">
          <div class="result-header">
            <h4>Estimation Complete</h4>
            <div class="country-info" *ngIf="results.data?.employments?.length">
              <strong>{{ results.data.employments[0]?.country?.name }}</strong>
            </div>
          </div>
          <div class="result-body">
            <pre>{{ results | json }}</pre>
          </div>
          <div class="result-actions">
            <button
              class="btn-primary"
              (click)="exportResults()"
              [disabled]="!canExport"
            >
              Export PDF
            </button>
            <button class="btn-secondary" (click)="clearResults()">
              Clear Results
            </button>
            <button class="btn-toggle" (click)="toggleDebug()">
              {{ showDebug ? "Hide" : "Show" }} Debug
            </button>
          </div>
        </div>
      </div>

      <!-- Debug Section -->
      <div class="debug-section" *ngIf="showDebug">
        <h3>Debug Information</h3>
        <div class="debug-tabs">
          <button
            [class.active]="activeDebugTab === 'config'"
            (click)="activeDebugTab = 'config'"
          >
            Config
          </button>
          <button
            [class.active]="activeDebugTab === 'payload'"
            (click)="activeDebugTab = 'payload'"
          >
            Last Payload
          </button>
          <button
            [class.active]="activeDebugTab === 'results'"
            (click)="activeDebugTab = 'results'"
          >
            Results
          </button>
        </div>
        <div class="debug-content">
          <pre *ngIf="activeDebugTab === 'config'">{{ config | json }}</pre>
          <pre *ngIf="activeDebugTab === 'payload'">{{
            lastPayload | json
          }}</pre>
          <pre *ngIf="activeDebugTab === 'results'">{{ results | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./cost-calculator.component.css"],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class CostCalculatorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild("calculator") calculator!: ElementRef;

  config: CostCalculatorConfig = {
    estimationOptions: {
      title: "Estimate for a new company",
      includeBenefits: true,
      includeCostBreakdowns: true,
    },
  };

  results: $TSFixMe = null;
  lastPayload: $TSFixMe = null;
  lastEventType: string = "";
  showDebug = false;
  activeDebugTab: "config" | "payload" | "results" = "config";
  isWebComponentLoaded = false;

  constructor(private remoteFlowsService: RemoteFlowsService) {}

  ngOnInit() {
    this.loadWebComponent();
    this.subscribeToService();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWebComponent() {
    // Check if already loaded
    if (customElements.get("cost-calculator-widget")) {
      this.isWebComponentLoaded = true;
      return;
    }

    // Load the web component script
    const script = document.createElement("script");
    script.src = "/assets/js/remote-flows-widgets.js";
    script.onload = () => {
      console.log("Web component script loaded");
      this.isWebComponentLoaded = true;
    };
    script.onerror = (error) => {
      console.error("Failed to load web component script:", error);
    };
    document.head.appendChild(script);
  }

  private subscribeToService() {
    this.remoteFlowsService.results$
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.results = results;
      });

    this.remoteFlowsService.payload$
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload) => {
        this.lastPayload = payload;
      });
  }

  get configJson(): string {
    return JSON.stringify(this.config);
  }

  get canExport(): boolean {
    return !!(this.lastPayload && this.results);
  }

  updateConfig() {
    console.log("Config updated:", this.config);
    // The web component will automatically pick up the new config
    // via the observed attributes
  }

  // Event handlers for web component events
  // Event handlers for web component events
  onSubmit(event: Event) {
    this.lastEventType = "submit";
    const customEvent = event as CustomEvent;
    console.log("Angular received submit event:", customEvent.detail);
    this.remoteFlowsService.handleSubmit(customEvent.detail);
  }

  onSuccess(event: Event) {
    this.lastEventType = "success";
    const customEvent = event as CustomEvent;
    console.log("Angular received success event:", customEvent.detail);
    this.remoteFlowsService.handleSuccess(customEvent.detail);
  }

  onError(event: Event) {
    this.lastEventType = "error";
    const customEvent = event as CustomEvent;
    console.log("Angular received error event:", customEvent.detail);
    this.remoteFlowsService.handleError(customEvent.detail);
  }

  onReset(event: Event) {
    this.lastEventType = "reset";
    const customEvent = event as CustomEvent;
    console.log("Angular received reset event", customEvent);
    this.remoteFlowsService.handleReset();
  }

  exportResults() {
    if (this.canExport) {
      console.log("Exporting PDF with payload:", this.lastPayload);
      // Here you would implement the actual PDF export
      // You could call the Remote Flows PDF export functionality
      alert("PDF export functionality would be implemented here");
    }
  }

  clearResults() {
    this.remoteFlowsService.handleReset();
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }
}
