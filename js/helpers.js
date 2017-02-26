/**
 * Application: Helpers
 *
 * What is a helper pattern?
 *
 * Background (Interesting, probably not helpful): http://softwareengineering.stackexchange.com/questions/247267/what-is-a-helper-is-it-a-design-pattern-is-it-an-algorithm
 *
 * A “Helper” in a Javascript Single-page Application is usually a block of code that
 * solves presentation-layer concerns in a reusable and generic manner. I believe at some point these
 * were called “Template Helpers”.
 *
 * Basically, it gives you a place to put all your reusable utility logic that does simple transforms
 * like date formatting, string transformation, etc. which are application specific (and therefore cannot be
 * accomplished by a library).
 *
 * For example, if specifically for our application we wish to wrap a generic string to create a code block (maybe it transforms a string
 * by wrapping it in both <pre> and <code> blocks, and fixes newline character issues). This is a common use for a helper, since it
 * doesn't really do anything outside the presentation layer.
 *
 */
'use strict';

(function () {

    /**
     * Application utility functions
     */
    function toTitleCase (str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function usTime (t) {
        if (t.indexOf(':') === -1) return t;
        var s = t.split(':');
        return ((parseInt(s[0]) + 11) % 12 + 1) + ':' + s[1] + ((parseInt(s[0]) >= 12) ? 'pm' : 'am');
    }

    // Timing helper
    function secondsAgo () {
        return ~((+ new Date - loadedOn) / -1000); // Seconds since loadedOn (int)
    }

    // Add to private namespace (App)
    App.registerGlobal('usTime', usTime);
    App.registerGlobal('secondsAgo', secondsAgo);
    App.registerGlobal('toTitleCase', toTitleCase);

})();



