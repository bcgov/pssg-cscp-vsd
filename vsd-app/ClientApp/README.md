# vsd-app/ClientApp

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
