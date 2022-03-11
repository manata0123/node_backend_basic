const CampaignModel = require('../models/CampaignModel');
const reqResponse = require('../../../cors/responseHandler');
const { validationResult } = require('express-validator');

module.exports = {
	getMediaList: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let result = await CampaignModel.getMediaList();
			res.status(200).send(reqResponse.customResponse(result));
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},


}


