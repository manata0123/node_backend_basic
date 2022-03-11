const router = require("express").Router();
const RegEventController = require("../controllers/RegEventController");
const RouteConstant = require("../../../constant/Routes");
const CampaignMiddleware = require("../../../cors/Middleware")
  .checkToken;
const RegEventValidation = require("../validation/RegEventValidation");
const ApiName = "campaign";


const multer  = require('multer');
const upload = multer({ dest: 'upload/' });


module.exports = (app) => {
  // get รายการ Event ทั้งหมด
  router
    .route("/getRegEventList")
    .post(
      
      RegEventValidation.valid_getRegEventList(),
      RegEventController.getRegEventList
    );

//save event
  router
    .route("/createEvent")
    .post(
      
      RegEventValidation.valid_Create_Event(),
      RegEventController.createEvent
    );

    //save event
  router
  .route("/updateEvent")
  .put(
    
    RegEventValidation.valid_Update_Event(),
    RegEventController.updateEvent
  );

  //save project
  router
    .route("/createProject")
    .post(
      
      RegEventValidation.valid_Create_Event_Project(),
      RegEventController.createProject
    );

    //update project
  router
  .route("/updateProject")
  .put(
    
    RegEventValidation.valid_Update_Event_Project(),
    RegEventController.updateProject
  );
    // get dropdown project
  router
  .route("/getProjectList")
  .get(
    
    RegEventController.getProjectList,
  );

    // get event_project
    router
    .route("/getEventProjectList")
    .post(
      
      RegEventController.getEventProjectList,
    );

    // insert event_project_image
    router
    .route("/createImageEventProject")
    .post(
      
      RegEventController.createImageEventProject,      
    );

    // get getEventFolderNameFromProjectCode
    router
    .route("/getEventFolderNameFromProjectCode")
    .post(
        
      RegEventController.getEventFolderNameFromProjectCode,
    );

    // get EventProjectImage List
    router
    .route("/getEventProjectImageList")
    .post(
        
      RegEventController.getEventProjectImageList,
    );

    // SetActiveFalse Event Project Image
    router
    .route("/setActiveFalseEventProjectImage")
    .post(
        
      RegEventController.setActiveFalseEventProjectImage,
    );

    // uploadFile
    router
    .route("/uploadEventBanner")
    .post(      
      upload.single('image'),
      RegEventController.uploadEventBanner,      
    );

    router
    .route("/updateProjectImageOrder")
    .put(
        
      RegEventController.updateProjectImageOrder,
    );

  app.use(
    RouteConstant.API + "/" + ApiName,    
    CampaignMiddleware,
    router
  );
};
