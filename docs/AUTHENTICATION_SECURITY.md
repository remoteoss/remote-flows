# Securing authentication between the SDK and the Remote API

The SDK runs in your users' browsers, so treat anything it holds as visible to them. Your client credentials never go to the frontend. The question this page answers is what the SDK uses instead, and how to keep that from giving a user more than they should have.

## The two setups

### 1. Proxy (recommended)

The SDK sends every API call to your backend, and your backend adds the Remote access token before forwarding it to the gateway. The token never reaches the browser.

```tsx
<RemoteFlows
  proxy={{ url: 'https://your-backend.example.com' }}
  credentials='include' // send your own session cookie to your proxy
>
  {/* flows */}
</RemoteFlows>
```

With `proxy` set, the SDK keeps the API path and swaps the base URL, so `/v1/employments/emp_123` goes to `https://your-backend.example.com/v1/employments/emp_123`. Don't pass `auth` in this setup: when `auth` is set, the SDK fetches the token into the browser and sends it as `Authorization: Bearer …` to your proxy as well.

### 2. Direct

The SDK calls the Remote gateway itself, with a token it gets from your backend through the `auth` function:

```tsx
const fetchToken = async () => {
  const response = await fetch('/api/remote-token'); // your backend
  const { access_token, expires_in } = await response.json();
  return { accessToken: access_token, expiresIn: expires_in };
};

<RemoteFlows auth={fetchToken}>{/* flows */}</RemoteFlows>;
```

The SDK keeps the token in memory and, when it is less than a minute from expiring, calls `auth` again before the next request. Here the access token is in the browser for as long as it is valid, so anyone with access to the page (the user with devtools, a browser extension, an XSS) can use it for any call it allows, not only the ones the flow makes. Use this setup only when the token is minted for the user in front of the screen (see below).

## Mint the token for the logged-in user

Whichever setup you use, the token should act as the person using your app, not as a shared identity. Use the JWT assertion grant and take the subject from your own session:

- a company admin or manager: `sub: urn:remote-api:company-manager:user:<user_id>`
- an employee: `sub: urn:remote-api:employee:employment:<employment_id>`

`example/api/jwt_auth.js` shows how to build and exchange the assertion. Remote has to allow your integration to act on behalf of users before this grant works; until then the token request is refused.

Don't hand the browser a token obtained once from a refresh token and shared by every visitor, and don't attach one to every proxied call: every user of your app would act on Remote as the one user that token belongs to.

## Never take the identity from the browser

The browser can send anything. Some flows say which employment a call is about: `PayrollEmployeeOnboarding` sends it in the `x-rf-employment-id` header, which your proxy receives. Before minting an employee assertion for that id, check that it belongs to the user in your session, and answer 403 otherwise. In the example this is `authorizeEmployment` in `example/api/authorize.js`; the demo has no login and lets everything through, so replace it with your own check.

The same goes for ids in the path or body when your proxy signs the call with a token that has more rights than the user. Creating and updating companies (`POST /v1/companies`, `PATCH /v1/companies/{company_id}`) uses a client credentials token, which is valid for every company your integration manages: check that the company in the path belongs to the user in your session before forwarding.

## Proxy checklist

- Authenticate the request with your own session before adding any Remote token.
- Build the assertion subject from that session, never from a header, query parameter or body field.
- Forward only to the Remote gateway. Use a fixed host and take only the path from the request.
- Forward only the methods and paths your flows use, at least for calls signed with client credentials.
- Set the `Authorization` header yourself on every call; never forward the one the browser sent.
- Don't forward the browser's cookies to the gateway: your session cookie is for your backend only.
- If your proxy authenticates with a cookie (`credentials: 'include'`), protect it against CSRF: a `SameSite` cookie and/or an anti-CSRF token.
