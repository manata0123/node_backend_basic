const reqResponse = require('./responseHandler');
const { runQuery } = require('../library/queryHelper')
const sql = require('mssql')
mode = process.env.NODE_ENV || 'dev';
const config = require('config').get(mode);

module.exports = {
  basicAuth
}

const mydb = {
  campaign:config.databaseCore.campaign[0],
}

async function authenticate(username, password) {
  const result = await runQuery(
      mydb.campaign,
      "select system_id from CAMPAIGN_SYSTEMS WHERE system_username = @input_username AND system_key = @input_password",
      [
        {
          name:"input_username",
          type:sql.VarChar(50),
          value:username
        },
        {
          name:"input_password",
          type:sql.VarChar(20),
          value:password
        },
      ]
  )
  // return result.rowsAffected[0]
  return result.recordset[0]
}

async function basicAuth(req, res, next) {
  //check for basic auth header
  let header = req && req.headers['authorization'] && req.headers.authorization.indexOf('Basic ');
  //console.log(header)
  if (header === -1) {
    return res.status(401).send(reqResponse.errorResponse(401));
  }else {
    //verify auth credentials
    try {
      const base64Credentials = req.headers.authorization.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      const systemData = await authenticate(username, password);
      if (systemData && systemData?.system_id) {
        req.allowed = true
        req.system_id = systemData.system_id
        next();
      } else {
        return res.status(401).send(reqResponse.errorResponse(401));
      }
    } catch (error) {
      return res.status(401).send(reqResponse.errorResponse(401));
    }
  }

}
