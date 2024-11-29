# Node API

## Description

Node API is the backend service for [node-web](https://github.com/KTH/node-web).
It is also a template for Node API applications developed at KTH.

## Installation

### Install Dependencies

```sh
$ deno install
```

### Environment Variables

Create a new `.env` file for local development.

```
NODE_ENV=development
```

Add other environment variables depending on your needs.

| Name                 | Description                                                                          | Default Value                                        |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `API_KEYS`           | Configuration for access to API; string with name, key, and scope                    | `?name=devClient&apiKey=1234&scope=write&scope=read` |
| `LOGGING_ACCESS_LOG` | Enables or disabled application access log, used by dependency `kth-node-access-log` | `true`                                               |
| `LOGGING_LEVEL`      | Application logging level, used by dependency `@kth/log`                             | `debug`                                              |
| `MONGODB_URI`        | Document database connection string                                                  | `mongodb://127.0.0.1:27017/node`                     |
| `SERVER_PORT`        | The HTTP server port                                                                 | `3001`                                               |
| `SERVICE_PUBLISH`    | Root path for the application                                                        | `/api/node`                                          |

### Local Databases

- It is recommended to use a local document database with
  [kth-node-backend](https://github.com/KTH/kth-node-backend)

## Usage

Start the application in local development mode:

```sh
$ deno task dev
```

Access the Swagger UI on
[localhost:3001/api/node/swagger](http://localhost:3001/api/node/swagger/index.html).
Authorize with API key set with environment variable `API_KEYS`. Default value
is `1234`.

## Running Tests

Doesn’t quite work yet. 😊

```
$ deno test
```

## Contact

Node API is developed and maintained by
[Team KTH Web](https://github.com/orgs/KTH/teams/web-team).
