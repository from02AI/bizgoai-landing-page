// Safety stubs loaded from external file to avoid CSP blocking of inline scripts
(function(){
    try {
        if (!window.rotateSlides) {
            window.rotateSlides = function(){ console.warn('rotateSlides external stub called'); };
        }
        if (!window.setQuoteAutoRotate) {
            window.setQuoteAutoRotate = function(v){ console.warn('setQuoteAutoRotate external stub called', !!v); };
        }
        // mark for debugging
        window.__quoteStubsLoaded = true;
        console.info('stubs.js loaded: quote stubs installed');
    } catch (e) {
        // ignore errors
    }
})();
