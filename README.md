# Node-api

_This is specifically written for the `coding-interview` branch. See `master` branch for a general introduction of the repository._

## Instructions

Make sure that the [Prerequisites](#prerequisites) are met, follow the steps in [Setup](#setup), and try out the application in [Getting started](#getting-started). Finally, try to solve the assignments in [Assignments](#assignments).

- Please use at least one commit per assigment.
- Add comments where needed.
- Update tests if necessary, and feel free to add addtional tests.

If you run into problems, see [Troubleshooting](#troubleshooting).

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) and [npm](https://docs.npmjs.com/cli/v9/commands/npm)
- [Docker](https://www.docker.com/)
- [GitHub account](https://github.com/join)

## Setup

- Clone this repository ([KTH/node-api](https://github.com/KTH/node-api)) or create a new repository with this repository as a template.
- Switch to branch `coding-interview`.
- Install the dependencies with `npm i`.
- Start a MongoDB server instance with `npm run mongo:start`. (You can stop it with `npm run mongo:stop`.)
- Start the application with `npm run start-dev`. (The terminal should display something similar to [Example of log output on start](#example-of-log-output-on-start).)
- Verify that the Swagger UI is available on http://localhost:3001/api/node/swagger/.

## Getting started

- Authorization is managed with an `apiKey`. The default value is set to `1234` in `./config/serverSettings.js:19`. Press the _Authorize 🔓_ button in the Swagger UI, enter _1234_, press _Authorize_, and close the modal. Now, you can try the _GET /\_checkAPIkey_ endpoint. It will return response code `200` if you are authorized.
- Try to save data to the database with the _POST /v1/data/{id}_ endpoint.
- Then, try to retrieve the same data with the _GET /v1/data/{id}_ endpoint.

## Assignments

1. Change the data endpoints to handle values with `firstName` and `lastName`, instead of just `name`. Example: `{ "name": "John Doe" }` to `{ "firstName": "John", "lastName": "Doe"}`.
2. Add `PUT` and `DELETE` data endpoints.
3. Refactor data endpoints to person endpoints. Example: _GET /v1/data/{id}_ to _GET /v1/person/{id}_.
4. Add room endpoints. Room data should have appropriate properties.

### Extra credit

- Make a rudimentary React app that uses the `node-api` as backend.

## References

### Troubleshooting

- If you have problems pushing, try `git push --no-verify`.

### Example of log output on start

```
$ npm run start-dev

> node-api@2.0.0 start-dev
> bash -c 'NODE_ENV=development nodemon app.js'

[nodemon] 2.0.20
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.* swagger.json
[nodemon] watching extensions: js,handlebars,scss,svg,png
[nodemon] starting `node app.js`
00:00:00.840Z  INFO node-api: Authentication initialized
00:00:00.931Z  INFO node-api: DATABASE: Connecting database... (package=@kth/mongo)
00:00:01.052Z  INFO node-api: Checking environment variables from .env.ini file.
00:00:01.053Z DEBUG node-api:    Environment variable 'API_KEYS_0' is missing, most likely there is a default value.
00:00:01.053Z DEBUG node-api:    Environment variable 'MONGODB_URI' is missing, most likely there is a default value.
00:00:01.053Z  INFO node-api: Checking environment variables completed.
(node:69329) [MONGOOSE] DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7. Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. Or use `mongoose.set('strictQuery', true);` to suppress this warning.
(Use `node --trace-deprecation ...` to show where the warning was created)
00:00:01.054Z  INFO node-api: *** *************************
00:00:01.054Z  INFO node-api: *** SERVER STARTED
00:00:01.054Z  INFO node-api: *** using unsecure HTTP server
00:00:01.054Z  INFO node-api: *** Listening on port: 3001
00:00:01.055Z  INFO node-api: *** *************************
00:00:01.062Z  INFO node-api: DATABASE: Default connection established (package=@kth/mongo)
00:00:01.062Z  INFO node-api: AGENDA: Trigger Agenda initialization on mongoDb connection event
00:00:01.062Z  INFO node-api: AGENDA: Agenda is not yet initialized, continuing.
00:00:01.062Z  INFO node-api: AGENDA: Initializing a new Agenda instance.
00:00:01.064Z DEBUG node-api: DATABASE connected: localhost@node (package=@kth/mongo)
00:00:01.064Z DEBUG node-api: DATABASE driver version: 6.8.1 (package=@kth/mongo)
00:00:01.064Z  INFO node-api: MongoDB: connected
00:00:01.108Z  INFO node-api: AGENDA: Canceled 0 jobs
00:00:01.111Z  INFO node-api: AGENDA: Purged 0 jobs
00:00:01.111Z  INFO node-api: AGENDA: ready, configuring jobs...
00:00:01.128Z  INFO node-api: AGENDA: Agenda instance configured and running
00:00:01.130Z  INFO node-api: AGENDA: import: scheduled at Tue Jan 03 2023 06:20:00 GMT+0100 (Central European Standard Time)

```
