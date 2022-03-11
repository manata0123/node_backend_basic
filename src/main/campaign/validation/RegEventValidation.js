const { body, check } = require('express-validator');

module.exports = {
    valid_getRegEventList: () => {
        return [
            check("ev_status", "ev_status is required!").not().isEmpty(),
        ]
    },
    valid_Create_Event: () => {
        return [
            check("ev_name", "ev_name is required!").not().isEmpty(),
            check("ev_name", "ev_name is must more than 4 charactor!").isLength({min: 4}),
            check("ev_start", "ev_start is required!").not().isEmpty(),
            check("ev_end", "ev_end is required!").not().isEmpty(),
            check("ev_created", "ev_created is required!").not().isEmpty(),
            check('ev_start').custom((sdate, { req })=>{
                // Fetch year, month and day of 
  
            // Constructing dates from given
            // string date input
            const startDate = new Date(sdate)
            const endDate = new Date(req.body.ev_end)
              
            // Validate start date so that it must
            // comes before end date
            if (startDate >= endDate) {
                throw new Error('Start date must be before End date')
            }
            return true
            }),
            check('ev_end').custom((edate, { req })=>{
                // Fetch year, month and day of 
  
            // Constructing dates from given
            // string date input
            const startDate = new Date(req.body.ev_start)
            const endDate = new Date(edate)
              
            // Validate start date so that it must
            // comes before end date
            if (startDate >= endDate) {
                throw new Error('End date must be after Start date')
            }
            return true
            })
        ]
    },
    valid_Update_Event: () => {
        return [
            check("ev_name", "ev_name is required!").not().isEmpty(),
            check("ev_name", "ev_name is must more than 4 charactor!").isLength({min: 4}),
            check("ev_start", "ev_start is required!").not().isEmpty(),
            check("ev_end", "ev_end is required!").not().isEmpty(),
            check("ev_created", "ev_created is required!").not().isEmpty(),
            check("ev_id", "ev_id is required!").not().isEmpty(),
            check("tag_id", "tag_id is required!").not().isEmpty(),
            check('ev_start').custom((sdate, { req })=>{
                // Fetch year, month and day of 
  
            // Constructing dates from given
            // string date input
            const startDate = new Date(sdate)
            const endDate = new Date(req.body.ev_end)
              
            // Validate start date so that it must
            // comes before end date
            if (startDate >= endDate) {
                throw new Error('Start date must be before End date')
            }
            return true
            }),
            check('ev_end').custom((edate, { req })=>{
                // Fetch year, month and day of 
  
            // Constructing dates from given
            // string date input
            const startDate = new Date(req.body.ev_start)
            const endDate = new Date(edate)
              
            // Validate start date so that it must
            // comes before end date
            if (startDate >= endDate) {
                throw new Error('End date must be after Start date')
            }
            return true
            })
        ]
    },
    valid_Create_Event_Project: () => {
        return [
            check("ev_id", "ev_id is required!").not().isEmpty(),
            check("pj_code", "pj_code is required!").not().isEmpty(),
        ]
    },
    valid_Update_Event_Project: () => {
        return [
            check("ev_id", "ev_id is required!").not().isEmpty(),
            check("ep_id", "ep_id is required!").not().isEmpty(),
            check("pj_code", "pj_code is required!").not().isEmpty(),
        ]
    },

}