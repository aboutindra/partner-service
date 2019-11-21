const partnerProgramHandler = require('../../core/partnerProgram');

const routes = (server) => {
    server.post('/api/v1/programs', [], partnerProgramHandler.insertProgram);
    server.delete('/api/v1/programs/:id', [], partnerProgramHandler.softDeleteProgram);
    server.get('/api/v1/programs', [], partnerProgramHandler.getPrograms);
    server.get('/api/v1/programs/:partnerCode', [], partnerProgramHandler.getPartnerPrograms);
}

module.exports = {
    server
}