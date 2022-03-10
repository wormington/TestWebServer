
// This program uses the built-in Node.js HTTP module. It also uses the external 
// node-static module from npm. Node-static is a module which adds an easy-to-use 
// static file server.
const http = require("http");
const static = require("node-static");

// Requires GitGet to be in the parent directory of the program.
// https://github.com/wormington/GitGet
const GitGet = require("../GitGet/GitGet.js");

// Define default host address and port.
const host = "localhost";
const port = 8000;

// Create a static file server to serve files in the Initio directory.
const statServ = new static.Server("./Initio");

// This list contains existing filepaths which we want to restrict access to.
const exemptUrls = [
                    '/404.html'
                    ];

// data stores data from the Github API request. reqTimer stores the system time
// to limit the amount of request the program can make.
let data;
let reqTimer;

/*
    handleHttp(req, res) is the function which the HTTP server calls to handle
    HTTP requests. It passes all requests except those for '/repos.json' to the
    node-static file server. Requests for '/repos.json' are handled by us, as we 
    must send a request to the Github API. This function will send a request to the 
    API no more than once per minute.

    req - The object holding data about the HTTP request.
    res - The object holding data about the HTTP response.
          Calling res.end() will conclude the response and send it.
*/
const handleHttp = async (req, res) => {

    // Respond when request finishes.
    req.addListener("end", function () {

        // Requests for 'repos.json' are handled by us.
        if (req.url === "/repos.json") {

            // If repos.json is needed, serve it.
            res.writeHead(200, {'content-type':'application/json'});

            // Only allow new Github API requests if we have not already sent one
            // in the past minute. This helps to avoid wasting Github's resources
            // and also to avoid wasting our API rate limit.
            //
            // data and reqTimer should only be falsy before the initial API request.
            if (!data || Date.now() > reqTimer) {
                // If we are about to send a request, set the timer to one minute in the future.
                reqTimer = Date.now() + 60000;

                // Run our other program, GitGet, to send requests to the API.
                GitGet.main("wormington", "./test.tok", "return").then((content) => {
                    if (content) {
                        data = content;
                        res.end(data);
                    }
                });
            } else {
                // This else statement will run if 'repos.json' is needed and was updated
                // recently enough to not justify another API request.
                res.end(data);
            }

        } else if (exemptUrls.includes(req.url)) {
            // Restricts access to files that web users do not need to see.

            console.log("Info: illegal attempted access, " + req.url);
            statServ.serveFile('/404.html', 404, '', req, res);

        } else {
            // Other requests are sent to the static file server.
            //
            // If any other file is needed, serve it. If an error arises, log it
            // and respond to the client with an error status.
            statServ.serve(req, res, function (err, result) {
                if (err) { 
                    console.error("Error: encountered status " + err.status);
                    statServ.serveFile('/404.html', 404, '', req, res);
                }
            });
        }
    }).resume();

};


/**
 *  Code to run server.
 */
const server = http.createServer(handleHttp);
server.listen(port, "", () => {
    console.log(`Server running on ${host}:${port}`);
});