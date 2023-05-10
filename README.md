## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter project & boilerplate (Nest, MongoDB, JWT, Roles, Guards, Filters, Interceptors) including auth and user modules.

This boilerplate includes the following:

#### Env Example

```
APP_PORT=                     //Port of the app
MONGO_CLOUD_CONNECTION_URL=   //MongoDB URL
CORS_LIST=                    //Whitelist for CORS
JWT_SECRET=                   //JWT Secret
```

#### Config Module

get your env variables

- `get(key: string): string`
- `getPortConfig()`
- `getMongoConfig()`

#### Core

##### http-error filter

Errors will be returned as:

```
code: status,
timestamp: new Date().toLocaleString(),
path: request.url,
error: {
    response: {
      message: exception['response'].message,
      error: exception['error'],
    },
  message: exception.message,
},
```

good for logging and consistent error response for the frontend.

##### Response Interceptor

All responses will have the following interface:

```
export interface Response<T> {
  code: number;
  message: string;
  data: T;
}
```

Good for consistent responses for the frontend.

##### Validation Pipe

[To write]

#### Modules

##### Auth

- Roles decorator
- User decorator
- Roles enum
- JWT and Roles Guard
- JWT Services (Generate, Compare Password, Hash Password)

##### Users

- Module
- Model
- Interface
- 2 DTOs
- Controller implementing Guards and Roles Decorators
- Service

This module is intented to set the standard of work and get you started with it after reading it well :)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
