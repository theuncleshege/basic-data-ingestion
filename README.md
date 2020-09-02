# Basic Data Ingestion API

A basic data ingestion API built on Node with Typescript. The API can be run using Express, PostgreSQL and Node Notifier or in **Serverless** with AWS API Gateway, AWS Lambda, AWS DynamoDB and AWS SNS.

## Requirements for Express

- node: >=10.16.x
- PostgreSQL: >=10.x
- yarn or npm

## How to run locally with Express

- Copy `.env.example` to `.env`

  - MacOS/Unix: `cp .env.example .env`

  - Windows: `copy .env.example .env`

- Please open the `.env` file and fill in your PostgreSQL DB local configuration.

- Create the databases `DB_NAME` and `TEST_DB_NAME` that you specified in your `.env` file above. By default these are `basicdataingestion` and `test` respectively.

- Then run the following commands from the terminal/command prompt/powershell

```

yarn # or npm install (Installs the package and dependencies)
yarn start # or npm run start

```

- Open Postman or your favorite API testing tool and try out the routes. Please note that the API endpoints have a `v1` prefix. For example, the get request for saved packets will be something like `http://localhost:3000/v1/data/device1?since=1&until=5000`.

---

## Requirements for Serverless

- node: >=10.16.x
- Java Runtime Engine (JRE) version 6.x or newer
- yarn or npm

## How to run locally with Serverless

- Copy `.env.example.yml` to `.env.yml`

  - MacOS/Unix: `cp .env.example.yml .env.yml`

  - Windows: `copy .env.example.yml .env.yml`

- Then run the following commands from the terminal/command prompt/powershell

```

yarn # or npm install (Installs the package and dependencies)
yarn db:install # or npm run db:install (Installs local version of DynamoDB. Please check and ensure that port 8000 is free)
yarn serverless # or npm run serverless

```

- Open Postman or your favorite API testing tool and try out the routes. Please note that the API endpoints have a `v1` prefix. For example, the get request for saved packets will be something like `http://localhost:3000/v1/data/device1?since=1&until=5000`.

---

## Running tests

```

yarn test # or npm run test (Runs all tests)
yarn coverage # or npm run coverage (Runs tests and generates coverage reports in html format)

```

# How to deploy to AWS

This project uses the [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/)

- Set up and configure AWS [Credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). If you're not using the default aws profile, please update the `AWS_PROFILE` entry of the `.env.yml` file with the correct aws profile.

- Create [SNS](https://console.aws.amazon.com/sns/v3/home) topic on [AWS developer console](https://console.aws.amazon.com) and update `.env.yml` with the topic's `arn`.

- Run: `yarn deploy` or `npm run deploy`

&nbsp;

---

&nbsp;

# Background

The purpose of this is to build a basic data ingestion server in node.js. A Platform that ingests sensor data from multiple IOT devices, does some processing (including alerting users for anomalous values) on them, and stores them, allowing them to be served from an HTTP API.

## Part one: Data ingestion

The most basic requirement of the API is that it can ingest the data from sensors, storing them in some form of persistent storage such that these data can later be queried and retrieved.

Sensors will send data over HTTP, by making a request to `PUT /data`, with the following request body:

```
  {
    sensorId: string,
    time:     int,
    value:    float,
  }
```

This endpoint should exhibit the following behaviour:

- Return error 400 if the packet does not contain `sensorId`;
- Return error 400 if the packet does not contain `time`;
- Return error 409 if the packet is a duplicate - `(sensorId, time)` pairings should be unique;
- Return 204 if the packet structure is valid, and the packet was successfully stored in the persistent storage.

## Part two: Retrieving data

For these data to be useful, a client (e.g. a web app) must be able to query and retrieve them. There should be an endpoint which allows a client to retrieve data from a sensor. The endpoint should return suitable status codes, and the body of the request should be returned as JSON. An example of a suitable endpoint would be:

  GET /data

With parameters:

- `sensorId`: the sensor id for which to query data;
- `since`: a lower bound on the time of the data;
- `until`: an upper bound on the time of the data.

## Part three: Threshold alerts

Often, customers want to know if something is wrong, and therefore the API should have the ability to configure thresholds for individual sensors which can send a message (e.g. via email or SMS) when that threshold is tripped. For example, if the pressure on a fuel tank is too high it could explode, or if a pipe is too cold it could burst.
