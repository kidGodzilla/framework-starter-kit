/**
 * Application: Global Event Listeners
 */
'use strict';

var debouncing = false;

(function () {

    /**
     * On Form Submission
     */
    $body.on('submit', '.form', function (e) {
        e.preventDefault();

        // Debounce multiple submit events
        if (debouncing) return;
        debouncing = true;
        setTimeout(function () { debouncing = false }, 400);

        // Do things

    });

    /**
     * On Click Element
     */
    $body.on('click', '.element', function (e) {
        e.preventDefault();

        // Debounce multiple click events
        if (debouncing) return;
        debouncing = true;
        setTimeout(function () { debouncing = false }, 400);

        // Do things

    });


})();
