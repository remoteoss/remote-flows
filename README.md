# Remote Flows

## Overview

This project provides a client SDK for interacting with the Remote API, by providing white label forms of several flows.

## Prerequisites

- Node.js
- npm

## Installation

## Running Locally

### Development Mode

To run the project in development:

```sh
npm run dev
```

**Using npm link to Test with a Test App**

To test this package with a test application using npm link, follow these steps:

1. In the root directory of the package, run:

```sh
npm link
```

This will create a global symlink for your package.

2. In the root directory of your test application, run:

```sh
npm link remote-flows
```

This will create a symlink from the `node_modules` folder of your test application to the global symlink created in the previous step.

3. Now you can import and use the `remote-flows` package in your test application as if it were installed from npm.

4. To unlink the package when you are done testing, run the following commands in your test application directory:

```sh
npm unlink remote-flows
```

And in the root directory of your package:
npm unlink

## Building the Project

```sh
npm run build
```

## Generating API Client

To generate the API client from the [Remote OpenAPI](https://gateway.remote.com/v1/docs/openapi.json) specification:

```sh
npm run openapi-ts
```

**Note**: The contents of the client folder are auto-generated by the openapi-ts tool and should not be manually modified.
