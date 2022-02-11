const http = require("http");

const host = "localhost";
const port = 8000;

const handleHttp = function (req, res) {
    res.writeHead(200);
    res.end("My first server!");
};

const server = http.createServer(handleHttp);
server.listen(port, host, () => {
    console.log(`Server running on ${host}:${port}`);
});