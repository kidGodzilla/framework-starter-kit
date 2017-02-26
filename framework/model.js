/**
 * Model management
 */
'use strict';

(function () {
    var Model = window.Model = new Core();

    Model.debug = true; // Set to true for debug mode (logging). Overridable.

    Model.registerGlobal('new', function (name, data) {
        if (Model[name]) return false; // Do not overwrite or allow re-declaration

        data = data || {}; // Set to empty object if null
        Model.set(name, data); // Construct initial datastore

        // Custom getters and setters
        Object.defineProperty(Model, name, {
            get : function () {
                if (Model.debug) console.log('Getting', name);
                return Model.get(name);
            },
            set : function (value) {
                if (Model.debug) console.log('Setting', name, 'to', value);
                Model.set(name, value);
            }
        });
    });

    /**
     * Observe a global & trigger rerenders (Really djanky implementation of the Observer pattern)
     */
    Model.registerGlobal('observeGlobal', function (name) {
        // Bind re-renders to every present child key
        for (var key in window[name]) {
            if (window[name].hasOwnProperty(key)) {
                Object.defineProperty(window[name], key, {
                    get : function () {
                        return window[name].key;
                    },
                    set : function (value) {
                        if (Model.debug) console.log('Setting',name, '->', key, 'to', value);
                        window[name].key = value;
                        if (Router && Router.watchers) Router.rerender();
                        return true;
                    }
                });
            }
        }
    });

})();
