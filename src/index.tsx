import React from "react";
import type { PropsWithChildren } from "react";
import { client } from "./client/client.gen";
// import {
//   postCreateEmployment2,
//   postTokenOAuth2Token,
//   postCreateEstimation,
// } from "./client/sdk.gen.js";
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
      return clientCredentials(clientID, clientSecret, "123");
    },
  });

  return (
    <RemoteFlowSDKContext.Provider value={{ clientID, clientSecret }}>
      {children}
    </RemoteFlowSDKContext.Provider>
  );
}

// RemoteFlowsSDK({
//   clientID: "4opn5sq479siib9cj97kposqgq",
//   clientSecret: "5bs84eo5t3dg8887pt4cjha56acslgbt1mnpmkt9vhf27o062u1",
// });

// try {
// const res = await postCreateEmployment2({
//   auth: async () => {
//     const rtoken = "ff29220e-186b-43d0-8888-c1a7677f53a0";
//     const clientID = "4opn5sq479siib9cj97kposqgq";
//     const clientSecret =
//       "5bs84eo5t3dg8887pt4cjha56acslgbt1mnpmkt9vhf27o062u1";

//     return refreshToken(clientID, clientSecret, rtoken);
//   },
//   body: {
//     basic_information: {
//       email: "jane@smith.com",
//       has_seniority_date: "no",
//       job_title: "Engineer",
//       name: "Jane Smith",
//       provisional_start_date: "2025-03-15",
//     },
//     country_code: "AUS",
//     type: "employee",
//     full_name: "Jane Smith",
//     job_title: "Engineer",
//     personal_email: "jane@smith.com",
//   },
// });

//   const res = await postCreateEstimation({
//     body: {
//       employer_currency_slug: "eur-acf7d6b5-654a-449f-873f-aca61a280eba",
//       employments: [
//         {
//           age: 30,
//           annual_gross_salary: 150000,
//           annual_gross_salary_in_employer_currency: 150000,
//           employment_term: "fixed",
//           region_slug: "a1aea868-0e0a-4cd7-9b73-9941d92e5bbe",
//           regional_to_employer_exchange_rate: "1",
//           title: "SA",
//         },
//       ],
//       include_benefits: false,
//       include_cost_breakdowns: false,
//     },
//   });
//   console.log(JSON.stringify(res.data));
// } catch (ex) {
//   console.log(ex);
// }
