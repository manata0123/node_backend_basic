// 4XX status code related to client side error
// 5XX status code related to server side error

const getErrorStatus = require('../constant/ErrorData');

function findErrorMessage(status) {
	return getErrorStatus.ERROR_STATUS_ARRAY.find(v => v.status == status) || { error: 'There must be an error' };
}

/**
		* Custom Response.
		* @param {any} result - response result
		* @param {number} status - response status
		* @param {string} message - response message
		* @param {number} statusCode - response status code
	*/
let customResponse = (result = null, status = 'success', message = 'Query Success!!', statusCode = 200) => {
	return {
		statusCode,
		status,
		message,
		result
	}
}

/**
 * Error Response.
 * @param {number} statusCode - Error Status Code
 * @param errors
 */
let errorResponse = (statusCode, errors) => {
	let err = findErrorMessage(statusCode)
	if(errors){
		err.errors = errors.errors
	}

	return err;
}


module.exports = {
	errorResponse,
	customResponse,
};
