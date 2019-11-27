const segmentHandler = require('../../core/segment');
const validator = require('../../utilities/validator/segmentValidator');

const routes = (server) => {
    server.post('/api/v1/segments', [validator.validateInsert], segmentHandler.insertSegment);
    server.put('/api/v1/segments/:id', [validator.validateUpdate], segmentHandler.updateSegment);
    server.get('/api/v1/segments', [], segmentHandler.getSegments);
}

module.exports = {
    routes
}