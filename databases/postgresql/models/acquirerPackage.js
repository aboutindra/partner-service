const { NotFoundError, InternalServerError, BadRequestError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('..');
const { ERROR:errorCode } = require('../errorCode');

class AcquirerPackage {
    constructor(database) {
       this.database = database
    }

    async insertPackage(name, costType, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPackageQuery = {
            name: 'add-new-acquirer-package',
            text: `INSERT INTO public.acquirer_cost_package(
                name, cost_type, amount, is_deleted, created_at, updated_at)
                VALUES ($1, $2::cost_type, $3, $4, $5, $6);`,
            values: [name, costType, amount, false, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(insertPackageQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new package"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new BadRequestError("Invalid type value"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async updatePackageById(id, name, costType, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updatePackageQuery = {
            name: 'update-acquirer-package',
            text: `UPDATE public.acquirer_cost_package
                SET name=$2, cost_type=$3::cost_type, amount=$4, updated_at=$5
                WHERE id = $1;`,
            values: [id, name, costType, amount, new Date()]
        }

        try {
            let result = await dbClient.query(updatePackageQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new BadRequestError("Invalid type value"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getAllPackage() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllPackagesQuery = {
            name: 'get-acquirer-cost-package-list',
            text: `SELECT id, name, cost_type AS "costType", amount, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.acquirer_cost_package`
        }

        try {
            let result = await dbClient.query(getAllPackagesQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getPackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPackageByIdQuery = {
            name: 'get-acquirer-cost-package',
            text: `SELECT id, name, cost_type AS "costType", amount, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.acquirer_cost_package
                WHERE id = $1`,
            values: [id]
        }

        try {
            let result = await dbClient.query(getPackageByIdQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async softDeletePackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deletePackageQuery = {
            name: 'soft-delete-acquirer-package',
            text: `UPDATE public.acquirer_cost_package
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(deletePackageQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

}

module.exports = AcquirerPackage;
