const AppServer = require('./routes/routes');
const logger = require('./utilities/logger');
const appServer = new AppServer();
const port = process.env.PORT || 9070;
// const cron = require('node-cron');
// const Discount = require('./databases/postgresql/models/discount');
// const discount = new Discount(process.env.POSTGRESQL_DATABASE_PARTNER);
// const PartnerProgram = require('./databases/postgresql/models/partnerProgram');
// const partnerProgram = new PartnerProgram(process.env.POSTGRESQL_DATABASE_PARTNER);

// cron.schedule("0 * * * *", async function() {
//     discount.updateDiscountStatus();
//     partnerProgram.updatePartnerProgramStatus();
// });

let listener = appServer.app.listen(port, _ => {
    logger.info("Service started, listening at " + listener.address().port);
});

module.exports = appServer.app;
