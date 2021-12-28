'use strict';
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const mongoose = require( 'mongoose' );
const { Service } = require('../../system/services/Service');
const { HttpError } = require('../../system/helpers/HttpError');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const utility = require('../../system/helpers/Utility');
const dbcon = require('../../system/database/sqlConnection');

class AuthService extends Service {
    constructor(model) {
        super(model);
    }

    async createUUID(...api_args) {
        let params = api_args[0];
        let uuid_type = params.uuid_type;
        return new Promise((resolve, reject) => {
            switch (uuid_type) {
                case 'v1':
                    resolve(uuid.v1());
                case 'v3':
                    resolve(uuid.v3());
                case 'v4':
                    resolve(uuid.v4());
                case 'v5':
                    resolve(uuid.v5());
                default:
                    resolve(uuid.v1());
            }

        })

    }
    async login(...api_args) {
        let params = api_args[0];
        let request = params.req;
        let requestBody = params.req.body;
        
         await this.model.create( {'accessToken': params.accessToken, 'users':{ userId:params.userId },type:params.type,courseData:params.courseData} );
        const tokenData = await this.model.findOne( { 'accessToken': params.accessToken } ).populate( 'users' );
        let currentDateTime = utility.GetDateTimeInTimeZone();
        let query = "Update users_products_units_activity_history useractive INNER JOIN company_master cmpm ON cmpm.company_id = useractive.company_id SET session_enddate = ? WHERE useractive.company_id =? and useractive.user_id =? and useractive.product_id =? and useractive.unit_id =? and useractive.session_enddate is null; \n" +
        "UPDATE session ses INNER JOIN company_master cmpm ON cmpm.company_id = ses.company_id SET ses.course_engine_status = 1 WHERE ses.company_id =? and ses.user_id = ?; \n" +
        "UPDATE users_products_units_info unitdet INNER JOIN company_master cmpm ON cmpm.company_id = unitdet.company_id SET unitdet.session_startdate = ?, unitdet.session_enddate= null WHERE unitdet.users_products_units_info_id =? and unitdet.company_id =? and unitdet.user_id =?; \n" + 
        "INSERT INTO users_products_units_activity_history \n" +
        "(user_login_acesstoken, user_unit_acesstoken, company_id, user_id, product_id, unit_id, session_startdate,language_code) VALUES (?,?,?,?,?,?,?,?) ";
        let finalresponse;
        let courseParams = [currentDateTime, requestBody.companyId, requestBody.userId, requestBody.productId, requestBody.unitId,requestBody.companyId, requestBody.userId, currentDateTime, requestBody.unitsinfoId,
            requestBody.companyId, requestBody.userId, params.accessToken, requestBody.ssi_course_uuid,requestBody.companyId, requestBody.userId, requestBody.productId, requestBody.unitId, requestBody.unitsinfoId, requestBody.languageCode]
        await dbcon.getDbConnection(request).then((dbs) => {
            finalresponse = new Promise((resolve, reject) => {
                dbs.query(query, courseParams, function (err, res) {
                    if (err != null) {
                        console.log(err);
                        request.sacc_token = '';
                        // res.status(400).send(JSON.stringify(inserr))
                        reject(new HttpError(JSON.stringify(err)));
                    }
                    else {
                        request.sacc_token = '';
                        // const vLoginSuccessDet = { grant: true, courseLoginHistoryId: insresponse[3].insertId };
                        // course_content.GetCourseName(req, res, vLoginSuccessDet)
                        //res.status(200).send({ grant: true, courseLoginHistoryId: insresponse.insertId, coursename: vGetCoursename})
                        resolve(new HttpResponse({ courseLoginHistoryId: res[3].insertId, tokenData }));
                    }
                })
            });
        });
        return finalresponse.then((retVal) => { return retVal });
        
        // return new HttpResponse( tokenData );
    }
    async logOut(...api_args){
        
        let req = api_args[0];
        let res = api_args[1];
        req.companyId = req.body.companyId
        let origin = req.headers.origin.split('.');
        origin = origin[0].split('//');
        origin = origin[1];

        let userId, courseId, moduleId, companyId, unitsinfoId, productId, unitId, courseLoginHistoryId, moduleActivityHistoryid, bookmark, idle_timeout;
        if (Object.keys(req.body).length > 0) {
            userId = req.body.userId;
            courseId = req.body.courseId;
            moduleId = req.body.moduleId;
            companyId = req.body.companyId;
            unitsinfoId = req.body.unitsinfoId; // unit list primary key id
            productId = req.body.productId;
            unitId = req.body.unitId;
            courseLoginHistoryId = req.body.courseLoginHistoryId;
            moduleActivityHistoryid = req.body.moduleActivityHistoryid;
            bookmark = req.body.bookmark;
            idle_timeout = req.body.idle_timeout;
          }
          else {
            userId = req.query.userId;
            courseId = req.query.courseId;
            moduleId = req.query.moduleId;
            companyId = req.query.companyId;
            unitsinfoId = req.query.unitsinfoId; // unit list primary key id
            productId = req.query.productId;
            unitId = req.query.unitId;
            courseLoginHistoryId = req.query.courseLoginHistoryId;
            moduleActivityHistoryid = req.query.moduleActivityHistoryid;
            bookmark = req.query.bookmark;
            idle_timeout = req.body.idle_timeout;
          }
          let opaque_id = req.cookies[origin + '_macc_token'];

         await this.logoutCourseEngine({ opaque_id: opaque_id, company_origin: origin, update_expression: 'course_access_token' }).then(cleared => {
            res.clearCookie(origin + '_macc_token', '')
        
          }).catch(err => {
            if (err) throw err;
          });

        let vDateTime = utility.GetDateTimeInTimeZone();
        let finalresponse;
        await dbcon.getDbConnection(req).then(dbs => {
            let query = "Update users_products_units_activity_history SET session_enddate = ?,idle_timeout=? WHERE users_products_units_activity_history_id =?; \n" +
              "UPDATE session SET course_engine_status = 0 WHERE company_id =? and user_id = ?;";
            finalresponse = new Promise((resolve,reject)=>{
                dbs.query(query, [vDateTime, idle_timeout, courseLoginHistoryId, companyId, userId], function (uperr, upresponse) {
                    if (uperr != null) {
                        dbcon.closeConnection(dbs);
                        console.log("-- courseEngineLogOut --", uperr)
                        reject(new HttpError(JSON.stringify(uperr)))
                    }
                    else {
                        if (bookmark == 0) { //bookmark is not set only update below queries
                            let vsql = "UPDATE users_products_units_module upum, (SELECT ADDTIME(TIMEDIFF( ? , session_startdate), \n" +
                                "CASE WHEN total_module_timespent is not null then total_module_timespent else '00:00:00' end) as total_module_timespent, company_id FROM users_products_units_module upums \n" +
                                "WHERE upums.users_products_units_info_id = ? AND upums.company_id = ? AND upums.user_id = ? AND upums.module_id = ?) as stmt \n" +
                                " INNER JOIN company_master cmpm ON cmpm.company_id = stmt.company_id \n" +
                                "SET upum.session_enddate = ?, upum.total_module_timespent = stmt.total_module_timespent WHERE upum.users_products_units_info_id = ? \n" +
                                "AND upum.company_id = ? AND upum.user_id = ? AND upum.module_id = ?; \n" +

                                "Update users_products_units_module_activity_history upumah INNER JOIN company_master cmpm ON cmpm.company_id = upumah.company_id SET upumah.session_enddate = ? WHERE upumah.users_products_units_module_activity_history_id = ? \n" +
                                "and upumah.users_products_units_activity_history_id = ? and upumah.module_id = ?; \n" +

                                "Update users_products_units_info upui INNER JOIN company_master cmpm ON cmpm.company_id = upui.company_id SET upui.bookmark = null, upui.session_enddate = ?, upui.updated_on=? WHERE upui.users_products_units_info_id = ? and upui.company_id = ? and upui.user_id = ? and upui.product_id = ? and upui.unit_id =?;\n";

                            dbs.query(vsql, [vDateTime, unitsinfoId, companyId, userId, moduleId,
                                vDateTime, unitsinfoId, companyId, userId, moduleId,
                                vDateTime, moduleActivityHistoryid, courseLoginHistoryId, moduleId,
                                vDateTime, vDateTime, unitsinfoId, companyId, userId, productId, unitId], function (ainserr, ainsresponse) {
                                    if (ainserr != null) {
                                        dbcon.closeConnection(dbs);
                                        console.log("-- courseEngineLogOut --", ainserr)
                                        reject(new HttpError(JSON.stringify(ainserr)))
                                    }
                                    else {
                                        let usql1 = "UPDATE users_products_units_infos upcs \n" +
                                            " JOIN (SELECT sucm.users_products_units_info_id, SEC_TO_TIME(SUM(TIME_TO_SEC(sucm.total_module_timespent))) as total_units_timespent \n" +
                                            " FROM users_products_units_module sucm WHERE sucm.users_products_units_info_id = ? and sucm.company_id = ? and sucm.user_id = ?) as stmt ON stmt.users_products_units_info_id = upcs.users_products_units_info_id  \n" +
                                            " JOIN (SELECT upcst.company_id, upcst.user_id, upcst.product_id, SEC_TO_TIME(SUM(TIME_TO_SEC(upcst.total_units_timespent))) as total_products_timespent FROM users_products_units_info upcst \n" +
                                            " WHERE upcst.company_id = ? and upcst.user_id = ? and upcst.product_id = ?) totalunittime ON totalunittime.company_id = upcs.company_id and totalunittime.user_id = upcs.user_id and totalunittime.product_id = upcs.product_id \n" +
                                            " INNER JOIN users_products_info pinfo ON  pinfo.company_id = upcs.company_id and pinfo.user_id = upcs.user_id and pinfo.product_id = upcs.product_id \n" +
                                            " INNER JOIN company_master cmpm ON cmpm.company_id = upcs.company_id \n" +
                                            " SET upcs.total_units_timespent = stmt.total_units_timespent,  pinfo.total_timespent = totalunittime.total_products_timespent, \n" +
                                            " pinfo.session_enddate = ?, pinfo.updated_on=? WHERE upcs.users_products_units_info_id = ? and upcs.company_id = ? and upcs.user_id = ?;";

                                        dbs.query(usql1, [unitsinfoId, companyId, userId, companyId, userId, productId, vDateTime, vDateTime,
                                            unitsinfoId, companyId, userId],
                                            function (ucerrs, uCresponses) {
                                                dbcon.closeConnection(dbs);
                                                if (ucerrs != null) {
                                                    // throw ucerrs;
                                                    console.log("-- courseEngineLogOut --", ucerrs)
                                                    reject(new HttpError(JSON.stringify(ucerrs)))
                                                }
                                                else {
                                                    resolve(new HttpResponse({ 'message': "Logged Out" }))
                                                }
                                            });
                                    }
                                });
                        }
                        else if (bookmark == undefined) {
                            let usql1 = "UPDATE users_products_units_info upcs \n" +
                                " JOIN (SELECT sucm.users_products_units_info_id, SEC_TO_TIME(SUM(TIME_TO_SEC(sucm.total_module_timespent))) as total_units_timespent \n" +
                                " FROM users_products_units_module sucm WHERE sucm.users_products_units_info_id = ? and sucm.company_id = ? and sucm.user_id = ?) as stmt ON stmt.users_products_units_info_id = upcs.users_products_units_info_id  \n" +
                                " JOIN (SELECT upcst.company_id, upcst.user_id, upcst.product_id, SEC_TO_TIME(SUM(TIME_TO_SEC(upcst.total_units_timespent))) as total_products_timespent FROM users_products_units_info upcst \n" +
                                " WHERE upcst.company_id = ? and upcst.user_id = ? and upcst.product_id = ?) totalunittime ON totalunittime.company_id = upcs.company_id and totalunittime.user_id = upcs.user_id and totalunittime.product_id = upcs.product_id \n" +
                                " INNER JOIN users_products_info pinfo ON  pinfo.company_id = upcs.company_id and pinfo.user_id = upcs.user_id and pinfo.product_id = upcs.product_id \n" +
                                " INNER JOIN company_master cmpm ON cmpm.company_id = upcs.company_id \n" +
                                " SET upcs.session_enddate = ?, upcs.updated_on = ?, upcs.total_units_timespent = stmt.total_units_timespent,  pinfo.total_timespent = totalunittime.total_products_timespent, \n" +
                                " pinfo.session_enddate = ?, pinfo.updated_on=? WHERE upcs.users_products_units_info_id = ? and upcs.company_id = ? and upcs.user_id = ?;";

                            dbs.query(usql1, [unitsinfoId, companyId, userId, companyId, userId, productId, vDateTime, vDateTime, vDateTime, vDateTime, unitsinfoId, companyId, userId],
                                function (ucerrs, uCresponses) {
                                    dbcon.closeConnection(dbs);
                                    if (ucerrs != null) {
                                        console.log("-- courseEngineLogOut --", ucerrs)
                                        reject(new HttpError(JSON.stringify(ucerrs)))
                                    }
                                    else {
                                        resolve(new HttpResponse({ 'message': "Logged Out" }));
                                    }
                                });
                        }
                        else {
                            dbcon.closeConnection(dbs);
                            resolve(new HttpResponse({ 'message': "Logged Out" }));
                        }
                    }
                });
            })
        }); 
        return finalresponse.then((retVal) => { return retVal });
    }
    async verifyToken(...api_args) {
        let params = api_args[0];
        let origin = params.origin.split('.');
        origin = origin[0].split('//');
        origin = origin[1];
      
        return new HttpResponse(origin);
    }
    async verifyJwtToken(...api_args){
        let acc_token = api_args[0];
        let res = api_args[1];
        // console.log("acc_token",acc_token)
        return new Promise((resolve, reject) => {
            jwt.verify(acc_token, process.env.JWT_SECRET, (err, auth) => {
                if (err) {
                    console.log(err)
                               const error = new HttpError( err );
                    res.status( error.statusCode );
                    res.json( error );
                } else {
                    
                    resolve(auth)
                }
            })
        })
       
    }
    async getAccessTokenByOpaqueId(...api_args) {
        let params = api_args[0];
        let res = api_args[1];
        let opaqueId = params.opaqueId;
        let expression = params.expression;
        let get_fields = params.get_fields;
        let siteOrigin = params.siteOrigin;
        let is_dev = params.is_dev;
    
        AWS.config.update({
            accessKeyId: process.env.OPAQUE_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.OPAQUE_AWS_SECRET_KEY,
            region: process.env.OPAQUE_AWS_REGION
        });
        const docClient = new AWS.DynamoDB.DocumentClient();

        const table = process.env.OPAQUE_LOG_TABLE;
 
        let dynamo_params;
        if (get_fields) {
            dynamo_params = {
                TableName: table,
                Key: {
                    'opaque_id': opaqueId
                }
            };
        } else {
            dynamo_params = {
                TableName: table,
                Key: {
                    'opaque_id': opaqueId
                },
                ProjectionExpression: expression
            };
        }
        return new Promise((resolve, reject) => {
            // console.log(dynamo_params)
            docClient.get(dynamo_params, (err, access_token) => {
                console.log(access_token)
                if (err)    {
                    const error = new HttpError( err );
                    res.status( error.statusCode );
                    res.json( error );
                }
              
                resolve(access_token['Item'][expression])
            })
        })
    }
    
    logoutCourseEngine (...api_args)  {
        let params = api_args[0];
        let opaque_id = params.opaque_id;
        let update_expression = params.update_expression;

        let company_origin = params.company_origin;
        if (company_origin.split(':').length > 0) {
            let port = company_origin.split(':')[1]
            company_origin = company_origin.replace(':' + port, '')
        }
        AWS.config.update({
            accessKeyId: process.env.OPAQUE_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.OPAQUE_SECRET_ACCESS_KEY,
            region: process.env.OPAQUE_AWS_REGION
        });
        const docClient = new AWS.DynamoDB.DocumentClient();
        const table = process.env.OPAQUE_LOG_TABLE;
        const paramss = {
            TableName: table,
            Key: {
                'opaque_id': opaque_id
            },
            UpdateExpression: "set " + update_expression + " = :access_token",
            ExpressionAttributeValues: {
                ":access_token": false
            },
            ReturnValues: "UPDATED_NEW"
        };
        return new Promise((resolve, reject) => {
            docClient.update(paramss, function (err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    reject(false)
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                    resolve(true)
                }
            });
        })
    }
}

module.exports = { AuthService };