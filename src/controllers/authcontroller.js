const mongoose = require( 'mongoose' );
const { Controller } = require('../../system/controllers/Controller');
const { AuthService } = require('./../services/AuthService');
// const { User } = require( './../models/User' );
const { Auth } = require('./../models/auth');
const autoBind = require('auto-bind'),
    authService = new AuthService(
        new Auth().getInstance()//,new User().getInstance()
    );
class AuthController extends Controller {

    constructor(service) {
        super(service);
        autoBind(this);
    }
    async verifyDomainToken(req, res, next) {
        try {
            console.log(req.body.siteOrigin)
            var siteOrigin = req.body.siteOrigin;
            let opaqueId = req.cookies[siteOrigin + '_acc_token']
            const accessToken = await this.service.getAccessTokenByOpaqueId({ opaqueId: opaqueId, siteOrigin: siteOrigin, expression: process.env.EXPRESSION, is_dev: true },res);
            const token_value = await this.service.verifyJwtToken(accessToken,res)
            // console.log(siteOrigin,"------------ ", opaqueId, "--- ", req.cookies)
            req.ssi_opaqueId = opaqueId;
            req.opaqueId = opaqueId;
            req.companyId = token_value.payload.companyId;
            req.userId = token_value.payload.user_id;
            req.accessToken = accessToken;

            next()
        } catch (e) {
            next(e);
        }
    }

    async verifyCourseEngineToken(req,res,next) {
        try{
        let origin; 
        if (req.headers.origin != undefined) {
            origin = req.headers.origin.split('.');
            origin = origin[0].split('//');
            origin = origin[1];
            let opaqueId = req.cookies[origin + process.env.COURSE_TOKEN_SPLIT_TEXT];
              let accessToken =
             await this.service.getAccessTokenByOpaqueId({ opaqueId: opaqueId, siteOrigin: origin, expression: process.env.EXPRESSION, is_dev: true },res)
            //   then(async function(accessToken) { 
            // console.log("----- ", accessToken)
                if (accessToken && accessToken != undefined) {
                    // console.log("-==-=11")
                const token_value =   // new Promise((resolve,reject)=>{
                   await this.service.verifyJwtToken(accessToken,res)
                //  })
                 
                // console.log("-==-=22value.payload.user_idreq.r", token_value)
                req.companyId = token_value.payload.companyId;
                req.userId = token_value.payload.user_id;
                req.roleId = token_value.payload.role;
                req.auth = true;
                }
            // })
        }
        next()
        } catch (e) {
            next(e);
        }
    }

    async Login(req, res, next) {
        let UUID = await this.service.createUUID({ uuid_type: 'v1' });
        let origin = req.headers.origin.split('.');
        console.log("login",origin)
        origin = origin[0].split('//');
        origin = origin[1];
        if (UUID) {
            let courseTokenName = origin + process.env.COURSE_TOKEN_SPLIT_TEXT+'=';
            let isMobile = req.headers["app-type"] ? true : false;
            let ssi_opaque_id = req.ssi_opaqueId;
            let tokenExpire = new Date();
        // console.log("courseTokenName",courseTokenName, " ----- ",ssi_opaque_id )
            // req.accessToken
            // req.sc_opaque_id = opaque_id;
            req.body.ssi_course_uuid =UUID;
            if (!isMobile) {
                tokenExpire.setHours(tokenExpire.getHours() + 12);
            }
            else {
                tokenExpire.setFullYear(tokenExpire.getFullYear() + 10);
            }
            res.setHeader('Set-Cookie', [courseTokenName + ssi_opaque_id + ';HttpOnly;Path=/;maxAge=86,400,000;secure=true;domain=' + process.env.ACCEPTED_DOMAINURL + ';SameSite= strict ;expires=' + tokenExpire])

            const response = await this.service.login({companyId : req.companyId, userId : parseInt(req.userId), accessToken : req.accessToken,type:"course",
            courseData:{productId : req.body.productId,unitId :req.body.unitId
                // , companyId: req.body.companyId, userId: req.body.userid,
                // unitsInfoId: req.body.unitsinfoid, languagecode:req.body.languageCode
            },req});
            console.log("response",response)
            await res.status( response.statusCode ).json( response );
        }
    }

    async logOut(req,res,next){ 
          const response = await this.service.logOut(req, res);
          console.log("response",response)
          await res.status( response.statusCode ).json( response.data !=undefined ? response.data : response.message );  
    }
}



module.exports = new AuthController(authService);