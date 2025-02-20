import React from "react";
import type { PropsWithChildren } from "react";
import { client } from "./client/client.gen";
import { clientCredentials } from "./auth/clientCredentials.js";
import { RemoteFlowSDKContext } from "./RemoteFlowsProvider";
import { RemoteFlowsSDKProps } from "./types";

import type { SetNonNullable } from "type-fest";

export function RemoteFlowsSDK({
  clientID,
  clientSecret,
  children,
}: PropsWithChildren<SetNonNullable<RemoteFlowsSDKProps>>) {
  if (!clientID || !clientSecret) {
    throw new Error("clientID and clientSecret are required");
  }
  console.log("hey");
  client.setConfig({
    baseUrl: process.env.REMOTE_GATEWAY_URL,
    auth: async () => {
      return clientCredentials(clientID, clientSecret);
    },
  });

  return (
    <RemoteFlowSDKContext.Provider value={{ clientID, clientSecret }}>
      {children}
    </RemoteFlowSDKContext.Provider>
  );
}
