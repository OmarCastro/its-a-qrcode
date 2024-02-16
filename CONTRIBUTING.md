# Contributing to "It's a QR Code"

## Code of conduct

 This project has adopted the Contributor Covenant as its Code of Conduct, and we expect project
participants to adhere to it. Please read the full text so that you can understand what actions
will and will not be tolerated.

## Open Development

 All work on "It's a QR Code" happens directly on GitHub. Both team members and contributors send pull
requests which go through the same review process

## Versioning Policy

 "It's a QR Code" follows semantic versioning. We release patch versions for critical bugfixes, minor
versions for new features or non-essential changes, and major versions for any breaking changes.
 When we make breaking changes, we also introduce deprecation warnings in a minor version so that
our users learn about the upcoming changes and migrate their code in advance.

Every significant change is documented in the CHANGELOG.md file.

## Branch Organization

 Submit all changes directly to the main branch. We don’t use separate branches for development or
for upcoming releases. We do our best to keep main in good shape, with all tests passing.

 Code that lands in main must be compatible with the latest stable release. It may contain additional
features, but no breaking changes. We should be able to release a new minor version from the tip of
main at any time

## Issues

 We are using GitHub Issues for our bugs. We keep a close eye on this and try to make it
clear when we have an internal fix in progress. Before filing a new task, try to make sure your
problem does not already exist.


## Contribution Prerequisites

- You have NodeJS installed at latest stable.
- You are familiar with Git.

## Development Workflow

After cloning the project's code repository, you can run several commands, the first time you run any of the following commands, it will automatically install dependencies with `npm ci`.

- `npm run lint` checks code style and validates assets.
- `npm run linc` is like `npm run lint` but faster because it only checks files that differ in your branch.
- `npm test` runs all unit tests.
- `npm run build` creates a build folder with dist and documentation.
- `npm run dev-server` launch a server for development
- `npm run dev-server:open` runs `npm run dev-server` and opens the documentation in a web browser
- `npm run dev` setups the whole development environment.
  - builds the project
  - runs tests
  - launch the development server
  - watch for file changes so that it build, test, check code styles and refresh the page in the browser
  - you can exit the same way you exit a command line application, Ctrl+C on the terminal 
- `npm run dev:open` runs `npm run dev` and opens the documentation in a web browser
- `npm run help` shows the list of supported tasks with their description
- `npm run release:prepare` builds the project and prepares it for release, only used when releasing a new version
- `npm run release:clean` remove assets created by `npm run release:prepare`
- `npm run build:github-action` is like `npm run build` but checks the style code before building, used for github actions

## Style Guide

The code uses [Javascript Standard Style](https://standardjs.com/) with type check using [Typescript and JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html). Run `npm run linc` after making any changes to the code if not already using `npm run dev`. It shall fix formatting issues as well as notify issues about the code rules as well as code smells.

