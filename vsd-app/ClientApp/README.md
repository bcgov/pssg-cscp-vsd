# vsd_app

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.4.

- Npm version - 5.6.0
- Node version - 8.1.1.3
- Angular version - 5.2.11

## Installing prerequisite

Run `npm install` in `pssg-cscp-vsd\vsd-app\ClientApp`. To reinstall, delete the `node_modules` directory and re-run `npm install`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Running end-to-end tests against an arbitrary deployment

Run `ng e2e --no-serve --base-href=[URL]` where `[URL]` is the URL to your deployed instance of the app.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Ngrx Store (Client side data cache/sharing)
**@ngrx/store** is a controlled state container designed to help write performant, consistent applications on top of Angular. Core tenets:

- State is a single immutable data structure
- Actions describe state changes
- Pure functions called reducers take the previous state and the next action to compute the new state
- State accessed with the Store, an observable of state and an observer of actions
For more information see the [@ngrx/store git page](https://github.com/ngrx/store).
  
ngrx code is located in the **ClientApp/scr/app/app-state** directory

## Reactive forms
When creating angular forms, it is important to have the 'shape' of the form-group match that of the data-model
that the form deals with. This makes it easier to get and set the form values.

See the [angular reactive forms page](https://angular.io/guide/reactive-forms#creating-nested-form-groups) for reference.

## Mobile styling
For information on the Bootstrap grid system [see](https://getbootstrap.com/docs/4.0/layout/grid/).

## Debugging in Chrome
For information about debugging in chrome vist the [chrome-devtools documentation](https://developers.google.com/web/tools/chrome-devtools/javascript/).
