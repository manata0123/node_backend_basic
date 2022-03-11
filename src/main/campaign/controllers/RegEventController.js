const RegEventModel = require('../models/RegEventModel');
const reqResponse = require('../../../cors/responseHandler');
const { validationResult } = require('express-validator');
const ftp = require("basic-ftp");
const fs = require('fs');
const path = require('path')

// const renameEventProjectImageFile = async (data) => {
// 	try {
// 		const client = new ftp.Client()
// 		let result = null;
// 		// client.ftp.verbose = true
// 		try {
// 			await client.access({
// 				host: "",
// 				user: "",
// 				password: "",
// 			})
// 			result = await client.rename(data.nowPath, data.newPath);
// 		}
// 		catch(err) {
// 			ftpData = err
// 			// console.log(err)
// 		}
// 		client.close()

// 		return result;
// 	} catch (error) {
// 		console.error(error);
// 		return;
// 	}
// }

module.exports = {

	getRegEventList: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = await RegEventModel.getRegEventList(data);
			res.status(201).send(reqResponse.customResponse(result, "success" ,"",201))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	createEvent: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			if(!data?.ev_id){
				//create
				result = await RegEventModel.createEvent(data);
			} else {
				//update
				res.status(502).send(reqResponse.errorResponse(503))
			}
			res.status(201).send(reqResponse.customResponse(result, "success" ,"",201))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	updateEvent: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			if(!data?.ev_id){
				//create
				res.status(502).send(reqResponse.errorResponse(503))
			} else {
				//update
				result = await RegEventModel.updateEvent(data);
				res.status(200).send(reqResponse.customResponse(result))
			}
		} catch (error) {
			console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	getProjectList: async (req, res) => {
		try {
			let result = await RegEventModel.getProjectList();
			res.status(200).send(reqResponse.customResponse(result))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	createProject: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			if(!data?.ep_id){
				//create
				result = await RegEventModel.createProject(data);
			} else {
				//update
				res.status(502).send(reqResponse.errorResponse(503))
			}
			res.status(201).send(reqResponse.customResponse(result, "success" ,"",201))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	updateProject: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			if(!data?.ev_id){
				//create
				res.status(502).send(reqResponse.errorResponse(503))
			} else {
				//update
				result = await RegEventModel.updateProject(data);
				res.status(200).send(reqResponse.customResponse(result))
			}
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},
	getEventProjectList: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;

			let result = await RegEventModel.getEventProjectList(data);
			res.status(201).send(reqResponse.customResponse(result, "success" ,"",201))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},


	createImageEventProject: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			result = await RegEventModel.createImageEventProject(data);
			res.status(200).send(reqResponse.customResponse(result))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	getEventFolderNameFromProjectCode: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;

			let folderList = null;
			let projectFolder = null;
			const client = new ftp.Client()
			// client.ftp.verbose = true
			try {
				await client.access({
					host: "f",
					user: "me",
					password: "Me",
				})
				folderList = await client.list("\\company_internal\\");

				if(folderList){
					projectFolder = folderList.find(i=>i.name.indexOf(data.pj_code) !== -1);
				}
			}
			catch(err) {
				ftpData = err
				// console.log(err)
			}
			client.close()

			let result = {};

			if(projectFolder){
				result = {...projectFolder};
			}

			res.status(200).send(reqResponse.customResponse(result))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},



	getEventProjectImageList: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			result = await RegEventModel.getEventProjectImageList(data);
			res.status(200).send(reqResponse.customResponse(result))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	setActiveFalseEventProjectImage: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			result = await RegEventModel.setActiveFalseEventProjectImage(data);
			res.status(200).send(reqResponse.customResponse(result))
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	uploadEventBanner: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let file = req.file;

			console.log(file);
			console.log(data);

			let fileNames = {
				mobile: `event_banner_${data.ev_id}`,
				desktop: `event_banner_${data.ev_id}_desktop`
			}

			fileName = fileNames.mobile

			if (data.type == "desktop") {
				fileName = fileNames.desktop;
			}

			fileName += path.extname(req.file.originalname);

			const client = new ftp.Client()
			client.ftp.verbose = true
			try {
				await client.access({
					host: "",
					user: "",
					password: "Me",
				})
				uploadResult = await client.uploadFrom(req.file.path ,"\\company_internal\\\\Event\\banner\\" + fileName);

			}
			catch(err) {
				ftpData = err
				console.log(err)
			}
			client.close()

			let result = {};

			result = {
				fileName: fileName
			};

			result = {...result, ...uploadResult};

			fs.unlink(req.file.path, (err) => {
				if (err) {
				  console.error(err)
				  return
				}

				//file removed
			  })

			res.status(200).send(reqResponse.customResponse(result))
		} catch (error) {
			console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},

	updateProjectImageOrder: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(402).send(reqResponse.errorResponse(402,errors));
		}
		try {
			let data = req.body;
			let result = {};
			if(!data){
				//create
				res.status(502).send(reqResponse.errorResponse(503))
			} else {
				//update
				result = await RegEventModel.updateProjectImageOrder(data);
				res.status(200).send(reqResponse.customResponse(result))
			}
		} catch (error) {
			// console.error(error);
			res.status(502).send(reqResponse.errorResponse(503))
		}
	},
}


