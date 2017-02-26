/**
 * Application Tests
 * (Just include this file to run tests)
 */

// Add the assert method globally (sanity check, it should already exist)
function assert (condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

(function () {

    // Dependencies exist (Deterministic)
    assert(Core, 'Core object library missing');
    assert($, 'jQuery missing');
    assert(_, '_ missing');
    assert(App, 'App missing');
    assert(Router, 'Router missing');
    assert(Loader, 'Loader missing');
    assert(Template, 'Template missing');
    assert(Utils, 'Utils missing');

    // On app load
    $(document).ready(function () {
        setTimeout(function () { // Add a delay to ASYNC template loading (Note: introduces non-deterministic test output, can fail without any errors)

            // Templates exist
            assert($('[name="navbar"]').html(), 'Navbar template missing');
            assert($('[name="footer"]').html(), 'Footer template missing');
            assert($('[data-pathname="index"]').html(), 'Index template missing');
            assert($('[data-pathname="fourohfour"]').html(), 'account/general template missing');
        }, 15000); // Add a delay to ASYNC template loading (Note: introduces non-deterministic test output, can fail without any errors)
    })

})();
