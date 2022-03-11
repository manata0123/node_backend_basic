let jwt = require('jsonwebtoken');
const reqResponse = require('./responseHandler');

module.exports = {
  checkToken
}

function checkToken(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  console.log(token);
  if (token) {
    let key = ''

    jwt.verify(token, key, {
      ignoreExpiration: true
    }, (err, decoded) => {
      if (err) {

        return res.status(414).send(reqResponse.errorResponse(414));
      } else {

        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(415).send(reqResponse.errorResponse(415));
  }

}
