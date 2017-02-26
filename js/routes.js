/**
 * Application: Routes
 *
 * Router Lifecycle (for reference):
 * 1. onRegistration & loadTemplates (execute code when registering the template, like loading a template from a file, etc.)
 * ... some time passes ...
 * 2. The application executes the cleanup() or unload() function from the previous route, if applicable
 * 3. Application attempts to transition state to a named route
 * 4. beforeTransition() is called
 * 5. We WAIT for
 *    a. All our templates to exist
 *    b. All our dependent models to exist & not be null / empty
 *    c. Any code defined in dependencies() to evaluate to true
 * 6. beforeRender() is called
 * 7. Route rendering:
 *    a. If render() exists, it is called
 *    b. Else, our template is compiled and rendered into the $outlet (which, is either #outlet or body, or something else we choose by overwriting $outlet)
 *    c. The title is changed (if applicable)
 * 8. afterRender() is called
 * 9. Our cleanup() or unload() function is stashed away for our next route to call
 *
 * What's missing?
 * 1. Reactive re-rendering on watched model changes
 *    a. There are some complexities, like what happens when you're filling out a non-data-bound form.
 * 2. Syntactic sugar for loading templates
 * 3. Lifecycle tests
 *
 */
'use strict';

(function () {

    /**
     * Default / Wildcard Route
     */

    Router.extendRoute('', { // Create a default/wildcard route
        title: "Wildcard route – Application",
        templates: ['navbar', 'fourohfour', 'footer']
    });


    /**
     * Special Routes
     */

    // These could be routes that render no UI, or only redirect



    /**
     * Normal Routes
     */

    // Index route
    Router.extendRoute('index', {
        title: "Index – Application",
        templates: ['navbar', 'index', 'footer'],
        loadTemplates: ["/assets/templates/index.html"]
    });

})();
