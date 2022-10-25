const script = document.createElement('script');
script.src = 'https://unpkg.com/mammoth@1.5.1/mammoth.browser.min.js';
document.head.appendChild(script);

export default new Proxy({}, {
    get(target, prop) {
        return window.mammoth[prop]
    }
});