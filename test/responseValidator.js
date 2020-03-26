const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

exports.validateResponse = function (response, message, status, code) {
    response.should.have.status(code);
    response.body.status.should.equal(status);
    response.body.message.should.equal(message);
    expect(response).to.be.json;
}
