/**
 * A Javascript Router based on the HTML5 history API
 *
 *
 * Router Lifecycle (for reference):
 * 1. onRegistration (execute code when registering the template, like loading a template, etc.)
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
 * ******************************************************************************
 *
 * Usage Examples
 *
 * Register a route with custom transition execution functions
 *
 * Old (simple state machine) method:
 * ```javascript
 * Router.registerRoute('foo/bar/baz', {
     *   loadRoute: function () {
     *      $('#fooBarBaz').fadeIn();
     *   },
     *   unloadRoute: function () {
     *      $('#fooBarBaz').fadeOut();
     *   }
     * });
 * ```
 *
 * New (Route compositing) method:
 *
 * Everything is optional
 *
     * Router.registerRoute('kitchens/about', {
     *     dependencies: function () {
     *          // As long as this function returns false, it will "hold up" the rendering
     *     },
     *     models: ['User', 'Kitchen'], // These GLOBAL models are required to render, and when updated, trigger re-renders (Todo)
     *     title: "This is the new Page Title",
     *     beforeTransition: function () {
     *          // This is executed before an attempted transition (even if dependencies are unmet).
     *          // This can be utilized to fulfil dependencies.
     *     },
     *     beforeRender: function () {
     *          // This is executed before the template is rendered
     *     },
     *     template: function () {
     *          // This function should get the template, compile the template, and return it as a string
     *     },
     *     templates: ['header', 'body', 'footer'], // Templates to be compiled and rendered in order
     *     afterRender: function () {
     *          // This is executed after the compiled template is rendered into the $outlet
     *     },
     *     cleanup: function () {
     *          // This is executed after the route is unloaded, before loading the next route
     *     }
     * });
 *
 * Transition to a named route
 *
     * ```javascript
     * Router.routeTo('foo/bar/baz');
     * ```
 */
'use strict';

(function () {
    var Router = window.Router = new Core();

    Router.registerGlobal('routes', {});
    Router.registerGlobal('currentRoute');

    if (!window.$outlet) window.$outlet = $('#outlet').length ? $('#outlet').first() : $('body');

    // Uncomment / comment to use pathnames vs. hashes. Can be overriden.
    Router.usePathname = true;

    Router.registerGlobal('onRouteTo', function (path, preserveState) {
        return true;
    });

    /**
     * Re-render the current route (usually triggered by a manual state change)
     */
    function reRender () {
        var currentRoute = (Router.usePathname ? Router.getCurrentRouteFromPath() : Router.getCurrentRoute()) || 'index';
        Router.render(Utils.returnDeepest(Router.routes, Router.pathStringToRouteParts(currentRoute)));
    }

    Router.registerGlobal('rerender', reRender);

    /**
     * Register a Route
     */
    function registerRoute (routeName, options) {
        if (!options) return;
        // Execute onRegistration lifecycle hook
        if (options.onRegistration && typeof(options.onRegistration) === "function") options.onRegistration();

        // Load templates
        if (options.loadTemplates && options.loadTemplates.length) {
            options.loadTemplates.forEach(function (template) {
                var templateName = routeName || 'index';
                Template.create(templateName, template);
            });
        }

        var routeParts = Router.pathStringToRouteParts(routeName);

        // Get the existing object or create a new empty object
        var routeObject = Utils.deepReturnSafely(window.Router.routes, routeParts) || {};
        routeObject = $.extend(routeObject, options); // Extend vs. overwrite

        // Watch for model changes (Todo)
        //if (options && options.models && options.models.length) {
        //    options.models.forEach(function (model) {
        //        if (!window[model]) window[model] = {}; // Create an empty object for the model if it doesn't exist
        //
        //        if (logTransitions) console.log('adding watcher for', model, window[model]);
        //
        //        watch(window[model], function () {
        //            if (logTransitions) console.log('watcher triggered!');
        //            var currentRoute = (Router.usePathname ? Router.getCurrentRouteFromPath() : Router.getCurrentRoute()) || 'index';
        //            if (routeName !== currentRoute) return;
        //
        //            if (logTransitions) console.log('Watched model updated. Re-rendering!');
        //            Router.rerender();
        //        }, 5);
        //    });
        //}

        // Create an object path to routeParts
        if (!routeParts || !routeParts.length) return Router.routes = routeObject; // Modify the default/wildcard route
        return Utils.deepSetValue('Router.routes', routeParts, routeObject); // Anything else
    }

    Router.registerGlobal('new', registerRoute); // Alias
    Router.registerGlobal('newRoute', registerRoute); // Alias
    Router.registerGlobal('createRoute', registerRoute); // Alias
    Router.registerGlobal('extendRoute', registerRoute); // Alias
    Router.registerGlobal('registerRoute', registerRoute); // Original
    Router.registerGlobal('configureRoute', registerRoute); // Alias

    /**
     * Render a Route
     * Takes a route OBJECT, not a route name or path string.
     */
    Router.registerGlobal('render', function render (route) {
        var params = route.params || null;

        // Execute our previous route's cleanup/unload function (if applicable)
        var previousRouteUnloadFunction = Router.get('previousRouteUnloadFunction');
        if (previousRouteUnloadFunction && typeof(previousRouteUnloadFunction === "function")) previousRouteUnloadFunction();

        if (route && route.loadRoute) {
            // Preserve the old way of routing for backwards compatibility
            if (route.loadRoute && typeof(route.loadRoute === "function")) route.loadRoute(params);

        } else if (route) {
            // New way of routing
            if (route.beforeTransition && typeof(route.beforeTransition) === "function") route.beforeTransition(params);

            // Dependencies
            if (!route.dependencies || typeof(route.dependencies) !== "function") route.dependencies = function () { return true };

            Utils.onCondition(function () {

                // Check for the presence of all models
                if (route.models && route.models.length) {
                    for (var i = 0; i < route.models.length; i++) {
                        var model = route.models[i];
                        //console.log('waiting for model', model, !!!window[model]);
                        if (!!!window[model]) return false;
                    }
                }

                // Check to make sure the template(s) we need exist
                if (route.templates && route.templates.length) {
                    for (var j = 0; j < route.templates.length; j++) {
                        var templateName = route.templates[j];

                        if ($('template[data-pathname="'+templateName+'"]').length) {
                            if (!$("template[data-pathname='"+templateName+"']").html()) return false;
                        } else if ($('template[name="'+templateName+'"]').length) {
                            if (!$("template[name='"+templateName+"']").html()) return false;
                        }
                    }
                }

                return route.dependencies();
            }, function () {
                // Execute beforeRender()
                if (route.beforeRender && typeof(route.beforeRender === "function")) route.beforeRender(params);

                if (route.render && typeof(route.render === "function")) {  // Execute Render override
                    route.render(params);
                } else { // Execute default rendering

                    // Change page title
                    if (route.title) document.title = route.title;

                    if (route.template) {
                        var renderedTemplate = route.template(params); // compile template
                        if (window.$outlet) window.$outlet.html(renderedTemplate); // render template to outlet
                    } else if (route.templates && route.templates.length) {

                        var renderedTemplate = "";

                        route.templates.forEach(function (templateName) {
                            if ($('template[data-pathname="'+templateName+'"]').length) {
                                var out = Template.compileTemplate($('template[data-pathname="'+templateName+'"]').html());
                                renderedTemplate += out();
                            } else if ($('template[name="'+templateName+'"]').length) {
                                var out = Template.compileTemplate($('template[name="'+templateName+'"]').html());
                                renderedTemplate += out();
                            }
                        });

                        if (window.$outlet) window.$outlet.html(renderedTemplate); // render template to outlet

                    }
                }

                setTimeout(function () {
                    if (route.afterRender && typeof(route.afterRender === "function")) route.afterRender(params);
                }, 1);

                return true;
            });
        }

        Router.set('previousRouteUnloadFunction', route.unloadRoute || route.cleanup); // Stash our unload / cleanup f()
    });

    /**
     * Translates a path string to an array of route "parts"
     */
    Router.registerGlobal('pathStringToRouteParts', function (pathString) {
        var routeParts = pathString.split('/');

        // Early return if our path is FUBAR
        if (!routeParts || !Array.isArray(routeParts)) return false;

        // Filter out the good parts
        routeParts = routeParts.filter(function (n) { return n != undefined && n !== "" });

        return routeParts;
    });

    /**
     * Route to a Named Route
     */
    function routeTo (path, preserveState) {
        if (path.indexOf('/') === 0) path = path.slice(1);

        var pathState = Router.usePathname ? '/' + path : '#' + path;

        if (!preserveState) window.history.pushState({ pageTitle: document.title }, document.title, pathState);

        // Translate nullstring -> "index" route
        if (path === "") path = "index";

        if (window.logTransitions) console.log('Routing to ' + path);

        Router.onRouteTo(path, preserveState); // Allows us to reopen the router's routeTo function for things like Analytics

        Router.currentRoute = path;

        var routeParts = Router.pathStringToRouteParts(path);

        var routeObject = Utils.returnDeepest(this.routes, routeParts);

        Router.render(routeObject);

    }

    Router.registerGlobal('routeTo', routeTo);
    Router.registerGlobal('transitionTo', routeTo); // Syntactic sugar


    /**
     * Go Back
     */
    Router.registerGlobal('goBack', function () {
        window.history.back();
    });


    /**
     * Go Forward
     */
    Router.registerGlobal('goForward', function () {
        window.history.go(1);
    });

    /**
     * Return the current route name as a string (when using hashes)
     */
    Router.registerGlobal('getCurrentRoute', function () {
        var currentRoute = window.location.hash;
        if (currentRoute.indexOf('#') === 0) currentRoute = currentRoute.slice(1);
        return currentRoute;
    });

    /**
     * Return the current route name as a string (when using paths)
     */
    Router.registerGlobal('getCurrentRouteFromPath', function () {
        var currentRoute = window.location.pathname;
        if (currentRoute.indexOf('/') === 0) currentRoute = currentRoute.slice(1);
        return currentRoute;
    });

    /**
     * Route to the current Hash
     */
    Router.registerGlobal('routeToCurrentHash', function (preserveState) {
        var currentRoute = Router.getCurrentRoute();
        Router.routeTo(currentRoute, preserveState);
    });

    /**
     * Route to the current Path
     */
    Router.registerGlobal('routeToCurrentPath', function (preserveState) {
        var currentRoute = Router.getCurrentRouteFromPath();
        //console.log('pathname: ' + location.pathname, currentRoute);
        Router.routeTo(currentRoute, preserveState);
    });


    /**
     * Begin listening for navigation events after DOMContentLoaded / document.onreadystatechange
     */
    $(document).ready(function () {
        // React to [href] click events via event delegation
        $("body").on("click", "[href]:not(.external)", function (event) {
            event.preventDefault();

            var routeName = $(this).attr("href");

            if (routeName.indexOf('#') === 0) {
                routeName = routeName.slice(1);
                // console.log('routeName: ' + routeName);
            }
            return Router.routeTo(routeName);
        });

        // React to forward / back button events
        $(window).on("popstate", function (event) {
            if (event.originalEvent.state !== null) {
                event.preventDefault();
                // Reference: var pageTitle = event.originalEvent.state.pageTitle;
                // Reference: var routeName = event.originalEvent.state.routeName;

                // Load the current route (from URL)
                if (Router.usePathname) Router.routeToCurrentPath(true)
                else Router.routeToCurrentHash(true);
            }
        });

        /**
         * Load the initial route (from URL) by default
         * Todo: Why does it bork if executed too early? What exactly is causing this race condition?
         */
        setTimeout(function () { // Temp Hack. Shouldn't have to do this
            if (Router.usePathname) Router.routeToCurrentPath(true)
            else Router.routeToCurrentHash(true);

            window.initialRenderComplete = true;
        }, 300); // But at least 300ms is usually not noticable

    });

})();
