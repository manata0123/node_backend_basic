const { runQuery,runTransactionQuery,selectLastId } = require('../../../library/queryHelper')
const sql = require('mssql')
mode = process.env.NODE_ENV || 'dev';
const config = require('config').get(mode);

const moment = require('moment')

const mydb = {
    campaign:config.databaseCore.campaign[0]
}
// ผลลัพธ์ result.recordset, จำนวน result.rowsAffected
module.exports = {


    getMediaList: async () => {
        const result = await runQuery(
            mydb.campaign,
            ""
        )
        return result.recordset
    },



}
