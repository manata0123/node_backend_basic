const { body, check } = require('express-validator');
const { getCampaignPremiumByRefCode } = require('../models/CampaignModel');

module.exports = {
    valid_getStaffInfo: () => {
        return [
            check("username", "username is required!").not().isEmpty(),
        ]
    },
    valid_createCampaignTargetGroup: () => {
        return [
            check("username", "username is required!").not().isEmpty(),
            check("target_group_name", "target_group_name is required!").not().isEmpty(),
            check("owner_id", "owner_id is required!").not().isEmpty(),
        ]
    },
    valid_createCampaignBrand: () => {
        return [
            check("username", "username is required!").not().isEmpty(),
            check("brand_name", "brand_name is required!").not().isEmpty(),
        ]
    },
    valid_createCampaign: () => {
        return [
            check("username", "username is required!").not().isEmpty(),
        ]
    },
    valid_editCampaign: () => {
        return [
            check("username", "username is required!").not().isEmpty(),
            check("camp_detail_runno", "camp_detail_runno is required!").not().isEmpty(),
        ]
    },
    valid_getCampaignPremiumList: () => {
        return [
            check("owner_id", "owner_id is required!").not().isEmpty(),
        ]
    },
    valid_getCampaignPremiumCategoryList: () => {
        return [
            check("owner_id", "owner_id is required!").not().isEmpty(),
        ]
    },
    valid_getCampaignPremiumSectionList: () => {
        return [
            check("owner_id", "owner_id is required!").not().isEmpty(),
        ]
    },
    valid_createCampaignPremium: () => {
        return [
            check("username", "username is required!").not().isEmpty(),
            check("premium_name", "premium_name is required!").not().isEmpty(),
            check("premium_code", "premium_code is required!").not().isEmpty(),
            check("premium_value", "premium_value is required!").not().isEmpty(),
            check('premium_code').custom(async (ref_code, { req }) =>{
                let result = true
                try {
                    result = await getCampaignPremiumByRefCode(ref_code);
                } catch (error) {
                    throw new Error(error)
                }
                if (result) {
                    throw new Error('premium_code "'+ref_code+'" is already used!')
                }
                return true
            }),
        ]
    },

}
