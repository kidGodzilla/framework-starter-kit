/**
 * Application
 */
'use strict';

// Begin App
(function () {
    /***********************************************************************************************************
     * SETUP
     * ---------------------------------------------------------------------------------------------------------
     *
     * The following code creates a global event bus and initial state for the application
     ***********************************************************************************************************/
    var App = window.App = new Core();
    var $body = window.$body = $('body'); // Chain events off $body
    var $outlet = window.$outlet = $('#outlet').length ? $('#outlet').first() : $body; // Register a global outlet
    var loadedOn = window.loadedOn = + new Date;
    if (window._DevMode) window.logTransitions = true; // Debug

    /**
     * Load individual Templates (Partials)
     */
    Template.create('navbar', "/assets/templates/partials/navbar.html", true);
    Template.create('footer', "/assets/templates/partials/footer.html", true);
    Template.create('fourohfour', "/assets/templates/404.html");

    /**
     * Reopen the router's routeTo function to execute analytics code
     */
    Router.onRouteTo = function (path, preserveState) {
        if (window.ga) ga('send', 'pageview'); // Send a new Google analytics pageview
    };


    /***********************************************************************************************************
     * INITIALIZE THE APPLICATION
     * ---------------------------------------------------------------------------------------------------------
     *
     * The following code kicks-off execution of our application (similar to an init() call)
     ***********************************************************************************************************/


    // Setup after onload()
    $(document).ready(function () {

    });

    // Template inclusion via. [data-source-url]
    Template.HTMLIncludes();

})();
