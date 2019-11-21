const segmentHandler = require('../../core/segment');

const routes = (server) => {
    server.get('/api/v1/segments', [], segmentHandler.getSegments);
}

module.exports = {
    routes
}