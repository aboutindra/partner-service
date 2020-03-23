const partnerProgramHandler = require('../../core/partnerProgram');
const validator = require('../../utilities/validator/partnerProgramValidator');

const routes = (server) => {
    server.post('/api/v1/programs', [validator.validateInsertPartnerProgram], partnerProgramHandler.insertProgram);
    server.delete('/api/v1/programs/:id', [validator.validateDeletePartnerProgram], partnerProgramHandler.softDeleteProgram);
    server.get('/api/v1/programs', [validator.validateGetPartnerProgram], partnerProgramHandler.getPrograms);
    server.get('/api/v1/programs/:partnerCode', [validator.validateGetPartnerProgram], partnerProgramHandler.getPartnerPrograms);
}

module.exports = {
    routes
}
