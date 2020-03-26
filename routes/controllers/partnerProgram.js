const partnerProgramHandler = require('../../core/partnerProgram');
const validator = require('../../utilities/validator/partnerProgramValidator');
const paginationValidator = require('../../utilities/validator/paginationValidator');

const routes = (server) => {
    server.post('/api/v1/programs', [validator.validateInsertPartnerProgram], partnerProgramHandler.insertProgram);
    server.delete('/api/v1/programs/:id', [validator.validateDeletePartnerProgram], partnerProgramHandler.softDeleteProgram);
    server.get('/api/v1/programs', [validator.validateGetPartnerProgram, paginationValidator], partnerProgramHandler.getPrograms);
    server.get('/api/v1/programs/:partnerCode', [paginationValidator], partnerProgramHandler.getPartnerPrograms);
}

module.exports = {
    routes
}
