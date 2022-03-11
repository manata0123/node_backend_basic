// 40X - Client Side Error
// 50X - Server Side Error 

module.exports = {
  ERROR_STATUS_ARRAY: [
    {
      status: 401,
      message: "error",
      result: "Unauthenticated"
    },
    {
      status: 402,
      message: "error",
      result: "Mandatory Parameter Empty.",
    },
    {
      status: 404,
      message: "error",
      result: "Content Not Found.",
    },
    {
      status: 414,
      message: "error",
      result: "Invalid token found."
    },
    {
      status: 415,
      message: "error",
      result: "Token not found in request parameter."
    },
    {
      status: 500,
      message: "error",
      result: "Internal Server Error."
    },
    {
      status: 501,
      message: "error",
      result: "Data Not Found."
    },
    {
      status: 502,
      message: "error",
      result: "JWT token Error, Error occure while generating user token."
    },
    {
      status: 503,
      message: "error",
      result: "Service Unavailable"
    },
  ]
}