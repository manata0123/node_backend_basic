const reqResponse = require('./responseHandler');
const { runQuery } = require('../library/queryHelper')
const sql = require('mssql')

module.exports = {
  basicAuth
}

async function authenticate(username, password) {
  const result = await runQuery(
      "",
      "select * from system WHERE systemName = @input_username AND systemKey = @input_password",
      [
        {
          name:"input_username",
          type:sql.VarChar(50),
          value:username
        },
        {
          name:"input_password",
          type:sql.VarChar(50),
          value:password
        },
      ]
  )
  return result.rowsAffected[0]
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
      if(username=='node-api-master'&&password=='Mis@2020') {
        // const allowed = await authenticate(username, password);
        const allowed = true;
        // console.log(allowed)
        if (allowed) {
          req.allowed = allowed
          next();
        } else {
          return res.status(401).send(reqResponse.errorResponse(401));
        }
      }else{
        return res.status(401).send(reqResponse.errorResponse(401));
      }
    } catch (error) {
      return res.status(401).send(reqResponse.errorResponse(401));
    }
  }

}