const { NotFoundError, InternalServerError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');

class Segment {
    constructor(database) {
        this.database = database
    }

    async insertSegment(name) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertSegmentQuery = {
            name: 'insert-segment',
            text: `INSERT INTO public.segment(
                name, created_at, updated_at)
                VALUES ($1, $2, $3)`,
            values: [name, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(insertSegmentQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new segment"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async updateSegment(id, name) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updateSegmentQuery = {
            name: 'update-segment',
            text: `UPDATE public.segment
                SET name = $2, updated_at = $3
                WHERE id = $1`,
            values: [id, name, new Date()]
        }

        try {
            let result = await dbClient.query(updateSegmentQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Segment not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getAllSegment() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getSegmentQuery = {
            name: 'get-segment-list',
            text: `SELECT id, name, created_at AS "createdAt", updated_at AS "updatedAt"
                FROM public.segment`
        }

        try {
            let result = await dbClient.query(getSegmentQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Segment not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getSegmentById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getSegmentByIdQuery = {
            name: 'get-segment',
            text: `SELECT id, name, created_at AS "createdAt", updated_at AS "updatedAt"
                FROM public.segment
                WHERE id = $1`,
            values: [id]
        }

        try {
            let result = await dbClient.query(getSegmentByIdQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Segment not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }
}

module.exports = Segment;
