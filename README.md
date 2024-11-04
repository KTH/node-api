# Node-api

_This is specifically written for the `coding-interview` branch. See the `main` branch for a general introduction of the repository._

## Instructions

Make sure that the [Prerequisites](#prerequisites) are met, follow the steps in [Setup](#setup), and try out the application in [Getting started](#getting-started). Finally, try to solve the assignments in [Assignments](#assignments).

- Spend 1 hour on the assignments.
- Please use at least one commit per assignment.
- Add comments where needed.
- Update tests if necessary, and feel free to add additional tests.
- Share the repository with the KTH representative.

If you run into problems, see [Troubleshooting](#troubleshooting). Contact the KTH representative if you have any questions.

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

The assignments aim to add endpoints for full CRUD functionality.

1. Change the data endpoints to handle values with `firstName` and `lastName`, instead of just `name`. Example: `{ "name": "John Doe" }` to `{ "firstName": "John", "lastName": "Doe"}`.
2. Add `PUT` and `DELETE` data endpoints.
3. Refactor data endpoints to person endpoints. Example: _GET /v1/data/{id}_ to _GET /v1/person/{id}_.

## References

### Troubleshooting

- If you have problems pushing, try `git push --no-verify`.

### Example of log output on start

```
$ npm run start-dev

> node-api@2.0.0 start-dev
> bash -c 'NODE_ENV=development nodemon app.js'

[nodemon] 3.1.7
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.* swagger.json
[nodemon] watching extensions: js,scss,svg,png
[nodemon] starting `node app.js`
09:27:34.191Z  INFO node-api: Authentication initialized
09:27:34.334Z  INFO node-api: DATABASE: Connecting database... (package=@kth/mongo)
09:27:34.376Z  INFO node-api: kth-node-log already initialized, won't do it again
09:27:34.532Z  INFO node-api: Checking environment variables from .env.ini file.
09:27:34.532Z DEBUG node-api:    Environment variable 'API_KEYS_0' is missing, most likely there is a default value.
09:27:34.532Z DEBUG node-api:    Environment variable 'MONGODB_URI' is missing, most likely there is a default value.
09:27:34.532Z  INFO node-api: Checking environment variables completed.
09:27:34.534Z  INFO node-api: Http server listening on port 3001
09:27:34.539Z  INFO node-api: DATABASE: Default connection established (package=@kth/mongo)
09:27:34.539Z  INFO node-api: AGENDA: Trigger Agenda initialization on mongoDb connection event
09:27:34.539Z  INFO node-api: AGENDA: Agenda is not yet initialized, continuing.
09:27:34.539Z  INFO node-api: AGENDA: Initializing a new Agenda instance.
09:27:34.542Z DEBUG node-api: DATABASE connected: 127.0.0.1@node (package=@kth/mongo)
09:27:34.542Z DEBUG node-api: DATABASE driver version: 7.8.2 (package=@kth/mongo)
09:27:34.542Z  INFO node-api: MongoDB: connected
09:27:34.555Z  INFO node-api: AGENDA: Canceled 0 jobs
09:27:34.556Z  INFO node-api: AGENDA: Purged 0 jobs
09:27:34.556Z  INFO node-api: AGENDA: ready, configuring jobs...
09:27:34.600Z  INFO node-api: AGENDA: Agenda instance configured and running
09:27:34.602Z  INFO node-api: AGENDA: import: scheduled at Tue Nov 05 2024 06:20:00 GMT+0100 (Central European Standard Time)
```
