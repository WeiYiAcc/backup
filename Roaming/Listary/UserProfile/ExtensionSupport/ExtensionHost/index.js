const express = require('express');
const app = express();

var extensions = {};
var caches = {};

var listener;
var exitTimer;

process.on('uncaughtException', function (err) {
    console.log('Unhandled exception: ', err);
});

app.get('/', (req, res) => {
    res.send('Hello Listary!')
});

app.get('/exit', (req, res) => {
    console.log(req.url);
    res.sendStatus(200);
    listener.close(() => {
        // Note waits for all timers to complete before exiting
        clearTimeout(exitTimer);
        console.log('Closed by exit');
    });
});

app.get('/ping', (req, res) => {
    res.send("Ready!");
    setExitTimer();
});

app.get('/init', (req, res) => {
    console.log(req.url);
    console.log(req.query.id);
    console.log(req.query.path);
    var id = req.query.id;
    var path = req.query.path;
    var cache = req.query.cache;
    extensions[id] = {
        extension: require(path),
        useCache: cache
    }
    res.sendStatus(200);
});

app.get('/search', (req, res) => {
    console.log(extensions);
    console.log(req.query.extension);
    console.log(req.query.query);

    try {
        var extension = extensions[req.query.extension];
        if (extension.useCache) {
            var cache = caches[req.url];
            if (cache) {
                res.send(JSON.stringify(cache));
                console.log('Cache hit');
                return;
            }
        }
        extension.extension.search(req.query.query)
            .then(results => {
                if (extension.useCache) {
                    caches[req.url] = results;
                }
                res.send(JSON.stringify(results));
            })
    }
    catch(error) {
        console.log('Search error: ' + error);
    }
});

app.get('/preview', (req, res) => {
    console.log('Preview');
    console.log(req.query.extension);
    console.log(req.query.id);

    try {
        var extension = extensions[req.query.extension];
        extension.extension.preview(req.query.id)
            .then(results => {
                res.send(JSON.stringify(results));
            })
    }
    catch(error) {
        console.log('Preview error: ' + error);
    }
});

listener = app.listen(0, 'localhost', () => {
    console.log('[' + listener.address().port + ']');
    setExitTimer();
});

function setExitTimer() {
    clearTimeout(exitTimer);
    exitTimer = setTimeout(() => {
        listener.close();
    }, 60000);
}