const partnerProgramHandler = require('../../core/partnerProgram');
const validator = require('../../utilities/validator/partnerProgramValidator');

const routes = (server) => {
    server.post('/api/v1/programs', [validator.validateInsert], partnerProgramHandler.insertProgram);
    server.delete('/api/v1/programs/:id', [validator.validateDelete], partnerProgramHandler.softDeleteProgram);
    server.get('/api/v1/programs', [], partnerProgramHandler.getPrograms);
    server.get('/api/v1/programs/:partnerCode', [], partnerProgramHandler.getPartnerPrograms);
}

module.exports = {
    routes
}