// Get the preload style
const intensity = document.body.dataset.preload || 'hover';

// Create the element
const el = document.createElement('link');
el.rel = 'prefetch';
el.as = 'document';

// Get all links if not disabled
const links = document.querySelectorAll('a[href]:not([newwy-disable-preload])');
let timeout;

// Create script tag foor speculationrules API
// @see https://developer.mozilla.org/en-US/docs/Glossary/Prerender
let list = [];
let scriptTag = document.createElement('script');
scriptTag.type = "speculationrules";

// Compare URLs
function isSameHost(a, b) {
    const urlA = new URL(a);
    const urlB = new URL(b);
    return urlA.host === urlB.host;
}

// Preload function
function preload(href){
    // Add to prerender list
    if(!list.includes(href) && isSameHost(window.location.href, href)){
        list.push(href);
        scriptTag.text = `
            {
                "prerender": [{
                    "source": "list",
                    "urls": ["${list.join('", "')}"]
                }]
            }`;
        document.head.appendChild(scriptTag);
    }

    // Prefetch;
    el.href = href;
    document.head.appendChild(el);
}

// Make sure all content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Loop through links and add eventlisteners to them
    if(links && links.length > 0){
        links.forEach((link) => {
            if(intensity === 'hover'){
                link.addEventListener('mouseover', () => {
                    timeout = setTimeout(() => {
                        preload(link.href);
                    }, 100);
                });
        
                link.addEventListener('mouseout', () => {
                    timeout = null;
                });
            }

            if(intensity === 'tap'){
                link.addEventListener('touchstart', () => {
                    timeout = setTimeout(() => {
                        preload(link.href);
                    }, 100);
                });
        
                link.addEventListener('touchend', () => {
                    timeout = null;
                });
            }
        });
    }
});

