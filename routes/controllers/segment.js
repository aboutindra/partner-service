const segmentHandler = require('../../core/segment');
const validator = require('../../utilities/validator/segmentValidator');

const routes = (server) => {
    server.post('/api/v1/segments', [validator.validateInsertSegment], segmentHandler.insertSegment);
    server.put('/api/v1/segments/:id', [validator.validateUpdateSegment], segmentHandler.updateSegment);
    server.get('/api/v1/segments', [], segmentHandler.getSegments);
}

module.exports = {
    routes
}
