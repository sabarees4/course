const { Controller } = require('../../system/controllers/Controller');
const { ModuleService } = require('./../services/ModuleService');
const { Module } = require('../models/module');
const autoBind = require('auto-bind'),
    moduleService = new ModuleService(
        new Module().getInstance()
    );
class ModuleController extends Controller {
    constructor(service) {
        super(service);
        autoBind(this);
    }
    async getAll(req, res, next) {
        var pipline = [
            {
                '$match': { unitId: req.query.unitId }
            },
            {
                '$addFields': {
                    isComplete: 1,
                    Menuenabled: 1
                }
            }
        ]
        try {
            const response = await this.service.getAllAggregrate(pipline);
            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async updateModule(req,res,next) {  
        let response;
        if(req.body.moduleCompletion === 0){
            response = await this.service.updateModuleSessionCompletion(req); 
        }
        else{
            response = await this.service.updateModule(req);
        }
        console.log("****-----updateModule",response.statusCode)
        return res.status(response.statusCode).json(response); 
    }
    
    async updateBookmark(req,res,next) {
        const response = await this.service.updateBookmark(req);    
        console.log("****-----updateBookmark---",response.statusCode)
        return res.status(response.statusCode).json(response); 
    } 

    async updateUserModuleCompletion(req,res,next) {
        const response = await this.service.updateUserModuleCompletion(req,res);    
        console.log("****-----updateUserModuleCompetion---",response.statusCode)
        return res.status(response.statusCode).json(response); 
    } 
}

module.exports = new ModuleController(moduleService);