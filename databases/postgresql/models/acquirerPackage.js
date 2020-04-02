const { NotFoundError, InternalServerError, BadRequestError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('..');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');

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
            let insertAcquirerPackageResult = await dbClient.query(insertPackageQuery);
            if (insertAcquirerPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new package"));
            }
            return wrapper.data(insertAcquirerPackageResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new ForbiddenError("Invalid type value"));
            }
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Package name already exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async updatePackageById(id, name, costType, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updateAcquirerPackageQuery = {
            name: 'update-acquirer-package',
            text: `UPDATE public.acquirer_cost_package
                SET name=$2, cost_type=$3::cost_type, amount=$4, updated_at=$5
                WHERE id = $1;`,
            values: [id, name, costType, amount, new Date()]
        }

        try {
            let updateAcquirerPackageResult = await dbClient.query(updateAcquirerPackageQuery);
            if (updateAcquirerPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }
            return wrapper.data(updateAcquirerPackageResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Package name already exist"));
            }
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new ForbiddenError("Invalid type value"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllAcquirerPackage(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllAcquirerPackagesQuery = {
            name: 'get-acquirer-cost-package-list',
            text: `SELECT id, name, cost_type AS "costType", amount, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.acquirer_cost_package
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-acquirer-cost-package-list',
            text: `SELECT COUNT(*)
                FROM public.acquirer_cost_package`
        }
        try {
            let getAllAcquirerPackagesResult = await dbClient.query(getAllAcquirerPackagesQuery);
            if (getAllAcquirerPackagesResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }
            let countAllAcquirerPackagesResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllAcquirerPackagesResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllAcquirerPackagesResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllAcquirerPackagesResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getPackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAcquirerPackageByIdQuery = {
            name: 'get-acquirer-cost-package',
            text: `SELECT id, name, cost_type AS "costType", amount, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.acquirer_cost_package
                WHERE id = $1`,
            values: [id]
        }

        try {
            let getAcquirerPackageByIdResult = await dbClient.query(getAcquirerPackageByIdQuery);
            if (getAcquirerPackageByIdResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(getAcquirerPackageByIdResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async softDeletePackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deleteAcquirerPackageQuery = {
            name: 'soft-delete-acquirer-package',
            text: `UPDATE public.acquirer_cost_package
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            let deleteAcquirerPackageResult = await dbClient.query(deleteAcquirerPackageQuery);
            if (deleteAcquirerPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(deleteAcquirerPackageResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

}

module.exports = AcquirerPackage;
