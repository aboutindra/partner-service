const segmentHandler = require('../../core/segment');

const routes = (server) => {
    server.post('/api/v1/segments', [], segmentHandler.insertSegment);
    server.put('/api/v1/segments/:id', [], segmentHandler.updateSegment);
    server.get('/api/v1/segments', [], segmentHandler.getSegments);
}

module.exports = {
    routes
}