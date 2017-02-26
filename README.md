# framework-starter-kit
Framework Starter Kit

## To Install
```
npm install
```

## To run locally
```
grunt
```

## Getting started

### Intended Application structure
**Templates** exist in your `assets/templates` directory, and are loaded individually by the application.

Your global **application** logic should exist within `js/app.js`.

Static **data models** *(POJOs)* should exist within `js/models.js`.

Your application should be composed of **routes**, declared within `js/routes.js`.

Your application should utilize **global event listeners**, in the form of event delegates, declared within `js/events.js`.

### Where are dependencies loaded?
Dependencies are hot-loaded by `framework/loader.js` at the end of the file. They are also compiled inside `Gruntfile.js` and placed into `dist/app.min.js`.
