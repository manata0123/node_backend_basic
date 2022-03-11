const router = require('express').Router();
const CampaignController = require('../controllers/CampaignController');
const RouteConstant = require('../../../constant/Routes');
const CampaignMiddleware = require('../../../cors/Middleware').checkToken;
const CampaignValidation = require('../validation/CampaignValidation')
const ApiName = 'campaign'

module.exports = (app) => {

    // get สื่อการตลาด
    router.route('/getMediaList')
        .post(
          // CampaignMiddleware,
          CampaignController.getMediaList
        );




    app.use(
        RouteConstant.API+'/'+ApiName,
        // CampaignMiddleware,
        router
    );
};
