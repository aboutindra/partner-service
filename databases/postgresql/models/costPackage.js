const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');

class CostPackage {
    constructor(database) {
       this.database = database
    }

    async insertPackage(name, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPackageQuery = {
            name: 'add-new-cost-package',
            text: `INSERT INTO public.cost_package(
                name, amount, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5);`,
            values: [name, amount, false, new Date(), new Date()]
        }

        try {
            let insertPackageResult = await dbClient.query(insertPackageQuery);
            if (insertPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new package"));
            }
            return wrapper.data(insertPackageResult.rows);
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

    async updatePackageById(id, name, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updatePackageQuery = {
            name: 'update-cost-package',
            text: `UPDATE public.cost_package
                SET name=$2, amount=$3, updated_at=$4
                WHERE id = $1;`,
            values: [id, name, amount, new Date()]
        }

        try {
            let updatePackageResult = await dbClient.query(updatePackageQuery);
            if (updatePackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }
            return wrapper.data(updatePackageResult.rows);
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

    async getPackages(page, limit, offset, search) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getCostPackagesQuery = {
            name: 'get-cost-packages',
            text: `SELECT id, name, amount, is_deleted AS "isDeleted", created_at AS "createdAt",
                updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.cost_package
                WHERE lower(name) LIKE lower('%' || $3 || '%') OR $3 IS NULL
                ORDER BY created_at ASC
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset, search]
        }
        let countDataQuery = {
            name: 'count-cost-packages',
            text: `SELECT COUNT(*)
                FROM public.cost_package
                WHERE lower(name) LIKE lower('%' || $1 || '%') OR $1 IS NULL`,
            values: [search]
        }
        try {
            let costPackages = await dbClient.query(getCostPackagesQuery);
            if (costPackages.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }

            let numberOfPackages = await dbClient.query(countDataQuery);
            let totalData = parseInt(numberOfPackages.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = costPackages.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(costPackages.rows, meta);
        }
        catch (error) {
            console.error(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getPackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPackageByIdQuery = {
            name: 'get-cost-package',
            text: `SELECT id, name, amount, is_deleted AS "isDeleted", created_at AS "createdAt",
                updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.cost_package
                WHERE id = $1`,
            values: [id]
        }

        try {
            let costPackage = await dbClient.query(getPackageByIdQuery);
            if (costPackage.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(costPackage.rows[0]);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async softDeletePackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deletePackageQuery = {
            name: 'soft-delete-cost-package',
            text: `UPDATE public.cost_package
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            let deleteResult = await dbClient.query(deletePackageQuery);
            if (deleteResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(deleteResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = CostPackage;
