/**
 * LOAD-DEPENDENCIES.JS
 * A A naive dependency loader which loads scripts & stylesheets on page load.
 */
'use strict';

(function () {

    var Loader = window.Loader = new Core();

    /**
     * Sets the protocol for loading scripts, when the option is available (useful for local development)
     * Options: "http://", "https://", "file://", and "//"
     */
    var protocol = window.location.protocol === "https:" ? "https://" : "http://";

    /**
     * Unique name for this instance of the script loader
     *
     * Prevents the loader from being called twice.
     * Change this if you use multiple instances of the script loader in your website,
     * or you want to distribute your package using this loader as an entry-point.
     */
    var loaderName = "asyncLoaderComplete";

    /**
     * Async script loader
     */
    function loadScriptAsync (resource) {
        var sNew = document.createElement("script");
        sNew.async = true;
        sNew.src = resource;
        var s0 = document.getElementsByTagName('script')[0];
        s0.parentNode.insertBefore(sNew, s0);
    }

    /**
     * Naive, synchronous script loader
     */
    function loadScript (resource) {
        document.write('<script src="' + resource + '"></script>');
    }

    /**
     * Stylesheet loader
     */
    function loadStylesheet (resource) {
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = resource;
        link.media = 'all';
        head.appendChild(link);
    }

    /**
     * Template Loader
     * Creates <template> tags, with external resource dependencies [data-source-url]
     * Using document.write (early, synchronous, blocking)
     */
    function createTemplate (name, path, partial) {
        var tn = partial ? 'name' : 'data-pathname';
        var dsu = 'data-source-url';
        document.write('<template '+tn+'="'+name+'" '+dsu+'="'+path+'"></template>');
    }

    /**
     * Generate a random cacheBuster query-string
     */
    function cacheBuster () {
        return "?v=" + Math.random();
    }

    Loader.registerGlobal('protocol', protocol);
    Loader.registerGlobal('loadScript', loadScript);
    Loader.registerGlobal('cacheBuster', cacheBuster);
    Loader.registerGlobal('loadStylesheet', loadStylesheet);
    Loader.registerGlobal('loadScriptAsync', loadScriptAsync);
    Loader.registerGlobal('createTemplate', createTemplate);
    Loader.registerGlobal('loadTemplate', createTemplate);

    /**
     * User-extendable dependency loader
     * To use, uncomment commonly-used libraries or add new scripts and stylesheets
     */
    if (!window[loaderName]) {

        // The "Framework"
        Loader.loadScript('/node_modules/lodash/lodash.min.js');
        Loader.loadScript('/framework/utils.js');
        Loader.loadScript('/framework/model.js');
        Loader.loadScript('/framework/router.js');
        Loader.loadScript('/framework/template.js');

        // This contains our application
        Loader.loadScript('/js/models.js' + cacheBuster()); // Dummy & static models for our app
        Loader.loadScript('/js/app.js' + cacheBuster()); // Main application
        Loader.loadScript('/js/helpers.js' + cacheBuster()); // Presentation-layer helper methods
        Loader.loadScript('/js/routes.js' + cacheBuster()); // Handle state transitions between named routes in our application
        Loader.loadScript('/js/events.js' + cacheBuster()); // Listen for events and take actions

        // Simple Testrunner on Localhost
        if (location.host.indexOf('localhost') !== -1) Loader.loadScript('/js/tests.js');

        // Once completed, set an identifier to true to avoid running the script loader twice
        window[loaderName] = true;
    }

})();
