const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    // "./icons/icon-72x72.png",
    // "./icons/icon-96x96.png",
    // "./icons/icon-128x128.png",
    // "./icons/icon-144x144.png",
    // "./icons/icon-152x152.png",
    // "./icons/icon-192x192.png",
    // "./icons/icon-384x384.png",
    // "./icons/icon-512x512.png",
    "./js/idb.js",
    "./js/index.js"
]

const APP_PREFIX = "BudgetTracker-"

const VERSION = 'version_01'

const CACHE_NAME = APP_PREFIX + VERSION

// install will add all the files to the browser Cache
self.addEventListener('install', function (e) {
    // waitUntil takes a promise as a parameter...in this case it's 'caches.open()
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Installing cache : ' + CACHE_NAME)
                return cache.addAll(FILES_TO_CACHE)
            })
    )
})

// Remove unwanted caches...old caches
self.addEventListener('activate', function (e) {
    // waitUntil takes a promise as a parameter...in this case it's 'caches.keys()'
    e.waitUntil(
        // returns an array of promises
        caches.keys()
            .then(cacheNames => {
                // resolve all the promises in the array
                return Promise.all(
                    cacheNames.map(cache => {
                        // if the cache name does not match the current configured CACHE_NAME
                        // at the end, only the current cache will remain in storage
                        // old, stale caches will all be deleted
                        if (cache !== CACHE_NAME) {
                            console.log('Clearing Old Cache')
                            return caches.delete(cache)
                        }
                    })
                )
            })
    )
})

// fetch event is where the files in cache gets served
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request)
            .then(function (request) {
                if (request) { // if cache is available, respond with cache
                    console.log('responding with cache : ' + e.request.url)
                    return request
                } else {       // if there are no cache, try fetching request
                    console.log('file is not cached, fetching : ' + e.request.url)
                    return fetch(e.request)
                }

                // You can omit if/else for console.log & put one line below like this too.
                // return request || fetch(e.request)
            })
    )
})