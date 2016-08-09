# FootBall Pool

A app to help track a football pool.

## Running The Test Suite
To test suite is supertest. All tests can be found under the test directory. The name convention is _*spec.js_. To run the tests:

```bash
npm test
```

## Installing the App
The first thing we need to do is install our node dependencies.

```
npm install
```

## Project Configuration

An example configuration file has been created for you. For it take effect you'll need to create a copy of it and rename it to `.football-poolrc` and place in the root directory of the project. This is handled by the RC node module.

This allows you to have separate configuration per environment/dev.

If you plan to use the email feature of the app you'll need to provide it with a valid Gmail username and password.

## Running App
Simply run the command below and visit [http://localhost:3000](http://localhost:3000) in your browser.

```bash
npm start
```
