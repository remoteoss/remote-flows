import React from "react";
import { createRoot } from "react-dom/client";
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  CostCalculatorDisclaimer,
  RemoteFlows,
  $TSFixMe,
} from "@remoteoss/remote-flows";

import { environment } from "../../environments/environment";

// React wrapper component that uses Remote Flows components unchanged
const CostCalculatorWrapper: React.FC<$TSFixMe> = ({
  config,
  onSuccess,
  onError,
  onSubmit,
  onReset,
}) => {
  const handleReset = () => {
    console.log("Reset button clicked");
    onReset?.();
  };

  return (
    <RemoteFlows
      authId={"client"}
      environment={environment.remoteFlows.gateway || "partners"}
      auth={() => {
        const accessToken = btoa(
          `${environment.remoteFlows.clientId}:${environment.remoteFlows.clientToken}`,
        );

        return Promise.resolve({
          accessToken: accessToken || "",
          expiresIn: 3600, // Default expiration time in seconds
        });
      }}
    >
      <CostCalculatorFlow
        estimationOptions={config.estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => {
                  console.log("Remote Flows payload:", payload);
                  onSubmit?.(payload);
                }}
                onError={(error) => {
                  console.error("Remote Flows error:", error);
                  onError?.(error);
                }}
                onSuccess={(response) => {
                  console.log("Remote Flows response:", response);
                  onSuccess?.(response);
                }}
              />
              <div className="buttons-container">
                <CostCalculatorResetButton
                  className="reset-button"
                  onClick={handleReset}
                >
                  Reset
                </CostCalculatorResetButton>
                <CostCalculatorSubmitButton
                  className="submit-button"
                  disabled={props.isSubmitting}
                >
                  Get estimate
                </CostCalculatorSubmitButton>
              </div>
            </div>
          );
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
};

// Web Component class that bridges Angular and React
class CostCalculatorWebComponent extends HTMLElement {
  private root: $TSFixMe;
  private mountPoint: HTMLDivElement;

  static get observedAttributes() {
    return ["config", "flow-type"];
  }

  constructor() {
    super();
    this.mountPoint = document.createElement("div");
    this.appendChild(this.mountPoint);
  }

  connectedCallback() {
    this.mount();
  }

  disconnectedCallback() {
    this.unmount();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.mount();
    }
  }

  private mount() {
    const configStr = this.getAttribute("config") || "{}";
    let config;

    try {
      config = JSON.parse(configStr);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: $TSFixMe) {
      console.error("Invalid config JSON:", configStr);
      config = {
        estimationOptions: {
          title: "Estimate for a new company",
          includeBenefits: true,
          includeCostBreakdowns: true,
        },
      };
    }

    if (this.root) {
      this.root.unmount();
    }

    this.root = createRoot(this.mountPoint);

    // Event handlers that dispatch custom events to Angular
    const props = {
      config,
      onSubmit: (payload: $TSFixMe) => {
        this.dispatchEvent(
          new CustomEvent("submitEvent", {
            detail: payload,
            bubbles: true,
            composed: true,
          }),
        );
      },
      onSuccess: (response: $TSFixMe) => {
        this.dispatchEvent(
          new CustomEvent("successEvent", {
            detail: response,
            bubbles: true,
            composed: true,
          }),
        );
      },
      onError: (error: $TSFixMe) => {
        this.dispatchEvent(
          new CustomEvent("errorEvent", {
            detail: error,
            bubbles: true,
            composed: true,
          }),
        );
      },
      onReset: () => {
        this.dispatchEvent(
          new CustomEvent("resetEvent", {
            bubbles: true,
            composed: true,
          }),
        );
      },
    };

    this.root.render(React.createElement(CostCalculatorWrapper, props));
  }

  private unmount() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

// Register the web component
if (!customElements.get("cost-calculator-widget")) {
  customElements.define("cost-calculator-widget", CostCalculatorWebComponent);
}

export default CostCalculatorWebComponent;
