import type { RemoteFlowsSDKProps } from "@remoteoss/remote-flows";

export const environment: {
  production: boolean;
  remoteFlows: {
    clientId: string;
    clientToken: string;
    gateway: RemoteFlowsSDKProps["environment"];
  };
} = {
  production: false,
  remoteFlows: {
    clientId: "4opn5sq479siib9cj97kposqgq",
    clientToken:
      "H4aTZHAVKwsT5UILLCeR/KM+8UYCc4ZHhDJbcIeDY/8q1cFhtEuPjmtGTYu/8HUszpV97rDFpxCK7UoBNC7Xww",
    gateway: "staging",
  },
};
