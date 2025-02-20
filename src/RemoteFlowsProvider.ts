import { createContext, useContext } from "react";
import { RemoteFlowsSDKProps } from "./types";

export const RemoteFlowSDKContext = createContext<RemoteFlowsSDKProps>({
  clientID: null,
  clientSecret: null,
});

export const useRemoteFlowsSDK = () => useContext(RemoteFlowSDKContext);
