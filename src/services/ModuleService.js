'use strict';
const { Service } = require( '../../system/services/Service' );
const utility = require('../../system/helpers/Utility');
const { HttpError } = require('../../system/helpers/HttpError');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const dbcon = require('../../system/database/sqlConnection');

class ModuleService extends Service {
    constructor( model ) {
        super( model );
    }

    async updateModule (...apiargs) {
        let finalresponse;
        let req = apiargs[0];
        let params = req.body;
        let currentDateTime = utility.GetDateTimeInTimeZone();
        ///////////////////////////////// removable line
        req.companyId = params.companyId;
        ///////////////////////////////
  
        await dbcon.getDbConnection(req).then((dbs) => {
            let sqlExists = "SELECT start_date FROM users_products_units_module WHERE users_products_units_info_id = ? and company_id =? and user_id = ? and module_id = ?";
            finalresponse = new Promise((resolve, reject) => {
                dbs.query(sqlExists, [params.unitsinfoId, params.companyId, params.userId, params.moduleId], function (err, response) {
                    if (err != null) {
                        dbcon.closeConnection(dbs);
                        console.log(err);
                        return reject(new HttpError(err));
                    }
                    if (response == undefined || response.length == 0) {
                        let insertSql = "INSERT INTO users_products_units_module (company_id, user_id, users_products_units_info_id, module_id, start_date, session_startdate, status) VALUES (?,?,?,?,?,?, 'Inprogress'); \n" +

                            "INSERT INTO users_products_units_module_activity_history (company_id,users_products_units_activity_history_id, module_id, session_startdate) VALUES (?,?,?,?); \n" +

                            "Update users_products_units_info upum INNER JOIN company_master cmpm ON cmpm.company_id = upum.company_id SET all_training_data = CASE WHEN JSON_SEARCH(all_training_data, 'all', 'Online') IS NULL THEN \n" +
                            'JSON_ARRAY_INSERT(CASE WHEN IFNULL(JSON_LENGTH(upum.all_training_data),0)=0 THEN "[]" ELSE all_training_data END, CASE WHEN IFNULL(JSON_LENGTH(upum.all_training_data),0)=0 THEN "$[0]" ELSE "$[1]" END, \n' +
                            'json_object("score", null,"status", "Inprogress","updated_by", ?,"updated_on", ?, \n' +
                            '"training_id", upum.unit_id,"training_time", upum.total_units_timespent,"training_type","Online","completed_date",upum.completed_date,"completion_percentage", upum.completion_percentage)) \n' +
                            " ELSE upum.all_training_data END, upum.training_type =CASE WHEN upum.training_type IS NULL THEN 'Online' ELSE upum.training_type END, upum.status = CASE WHEN upum.status IS NULL THEN 'Inprogress' ELSE upum.status END, \n" +
                            " upum.start_date = CASE WHEN upum.start_date IS null THEN ? else upum.start_date END WHERE users_products_units_info_id = ? and upum.company_id = ? and upum.user_id = ?; \n" +

                            "Update users_products_info upi INNER JOIN company_master cmpm ON cmpm.company_id = upi.company_id SET upi.status = CASE WHEN upi.status IS NULL THEN 'Inprogress' ELSE upi.status END, \n" +
                            "upi.start_date = CASE WHEN upi.start_date IS null THEN ? else upi.start_date END WHERE upi.company_id = ? and upi.user_id = ? and upi.product_id = ?; \n";
                        // courseErrorTrace(req,res,"InsertOrUpdateUserCourseModule - insert module - 2");            
                        dbs.query(insertSql, [params.companyId, params.userId, params.unitsinfoId, params.moduleId, currentDateTime, currentDateTime, params.companyId, params.courseLoginHistoryId,
                        params.moduleId, currentDateTime, params.userId, currentDateTime, currentDateTime, params.unitsinfoId, params.companyId, params.userId,
                            currentDateTime, params.companyId, params.userId, params.productid], function (inserr, insresponse) {
                                dbcon.closeConnection(dbs);
                                if (inserr != null) {
                                    console.log(inserr)
                                    return reject(new HttpError(inserr));
                                }
                                else {
                                    console.log("insresponse ", insresponse)
                                    // res.status(200).send({ "insertId": insresponse[1].insertId }) 
                                    return resolve(new HttpResponse({"moduleActivityHistoryid": insresponse[1].insertId}));
                                    // "Existsbookmark": insresponse[3].length, console.log("insresponse", insresponse[2])
                                }
                            });
                    } else {
                        let updateSql = "Update users_products_units_module upum INNER JOIN company_master cmpm ON cmpm.company_id = upum.company_id SET upum.session_startdate = ?, upum.status = CASE WHEN upum.status IS NULL THEN 'Inprogress' ELSE upum.status END, upum.session_enddate = NULL WHERE upum.users_products_units_info_id = ? and upum.company_id = ? and upum.user_id = ? and upum.module_id = ?; \n" +

                            "INSERT INTO users_products_units_module_activity_history(company_id,users_products_units_activity_history_id, module_id, session_startdate, session_enddate) VALUES (?,?,?,?,NULL); \n" +

                            "Update users_products_units_info upui INNER JOIN company_master cmpm ON cmpm.company_id = upui.company_id SET upui.all_training_data = CASE WHEN JSON_SEARCH(upui.all_training_data, 'all', 'Online') IS NULL THEN \n" +
                            'JSON_ARRAY_INSERT(CASE WHEN IFNULL(JSON_LENGTH(upui.all_training_data),0)=0 THEN "[]" ELSE upui.all_training_data END, CASE WHEN IFNULL(JSON_LENGTH(upui.all_training_data),0)=0 THEN "$[0]" ELSE "$[1]" END, \n' +
                            'json_object("score", null,"status", "Inprogress","updated_by", ?,"updated_on", ?, \n' +
                            '"training_id", upui.unit_id,"training_time", upui.total_units_timespent,"training_type","Online","completed_date",upui.completed_date,"completion_percentage", upui.completion_percentage)) \n' +
                            " ELSE upui.all_training_data END, upui.training_type =CASE WHEN upui.training_type IS NULL THEN 'Online' ELSE upui.training_type END, upui.status = CASE WHEN upui.status IS NULL THEN 'Inprogress' ELSE upui.status END WHERE upui.users_products_units_info_id = ? and upui.company_id = ? and upui.user_id = ?; \n" +

                            "Update users_products_info upi INNER JOIN company_master cmpm ON cmpm.company_id = upi.company_id SET upi.status = CASE WHEN upi.status IS NULL THEN 'Inprogress' ELSE upi.status END, upi.start_date = CASE WHEN upi.start_date IS null THEN ? else upi.start_date END WHERE upi.company_id = ? and upi.user_id = ? and upi.product_id = ?; \n";

                        //   courseErrorTrace(req,res,"InsertOrUpdateUserCourseModule - update module session startdate - 4");          
                        dbs.query(updateSql, [currentDateTime, params.unitsinfoId, params.companyId, params.userId, params.moduleId, params.companyId, params.courseLoginHistoryId,
                            params.moduleId, currentDateTime, params.userId, currentDateTime, params.unitsinfoId, params.companyId, params.userId, params.unitsinfoId, params.moduleId,
                            currentDateTime, params.companyId, params.userId, params.productid], function (uperr, upresponse) {
                                dbcon.closeConnection(dbs);
                                if (uperr != null) {
                                    console.log(uperr)
                                    // res.status(401).send(JSON.stringify(uperr))
                                    return reject(new HttpError(JSON.stringify(uperr)));
                                } else {
                                    // res.status(200).send({ "insertId": upresponse[1].insertId }) 
                                    return resolve(new HttpResponse({"moduleActivityHistoryid": upresponse[1].insertId}));
                                }
                            });
                    }
                })
            })
        });
        return finalresponse.then((retVal)=>{return retVal});
    }

    async updateBookmark(...apiargs) {
        let req = apiargs[0]; let finalresponse ;
         let params = req.body;
        let currentDateTime = utility.GetDateTimeInTimeZone();
        ///////////////////////////////// removable line
        req.companyId = params.companyId;
        ///////////////////////////////
        await dbcon.getDbConnection(req).then(dbs => {
            let upQuery = "UPDATE users_products_units_info upuinfo INNER JOIN company_master cmpm ON cmpm.company_id = upuinfo.company_id SET upuinfo.session_enddate = ?, upuinfo.updated_on = ?, upuinfo.bookmark = ? \n" +
                "WHERE upuinfo.users_products_units_info_id = ? AND upuinfo.company_id = ? AND upuinfo.user_id = ?; \n" +

                "UPDATE users_products_units_module upum, (SELECT ADDTIME(TIMEDIFF( ? , session_startdate), \n" +
                "CASE WHEN total_module_timespent is not null then total_module_timespent else '00:00:00' end) as total_module_timespent, company_id FROM users_products_units_module upums \n" +
                "WHERE upums.users_products_units_info_id = ? AND upums.company_id = ? AND upums.user_id = ? AND upums.module_id = ?) as stmt \n" +
                "INNER JOIN company_master cmpm ON cmpm.company_id = stmt.company_id SET upum.session_enddate = ?, upum.total_module_timespent = stmt.total_module_timespent WHERE upum.users_products_units_info_id = ? \n" +
                "AND upum.company_id = ? AND upum.user_id = ? AND upum.module_id = ?; \n" +

                "UPDATE users_products_units_module_activity_history upumh INNER JOIN company_master cmpm ON cmpm.company_id = upumh.company_id SET upumh.session_enddate = ? \n" +
                "WHERE upumh.users_products_units_module_activity_history_id = ? AND upumh.users_products_units_activity_history_id = ? AND upumh.module_id = ?;"
              finalresponse = new Promise((resolve, reject) => {

                dbs.query(upQuery, [currentDateTime, currentDateTime, JSON.stringify(params.bookmarkdet), params.unitsinfoId, params.companyId, params.userId, currentDateTime,
                    params.unitsinfoId, params.companyId, params.userId, params.moduleId, currentDateTime,
                    params.unitsinfoId, params.companyId, params.userId, params.moduleId, currentDateTime, params.moduleActivityHistoryid,
                    params.courseLoginHistoryId, params.moduleId],
                    function (err, response) {
                         if (err != null) {
                            dbcon.closeConnection(dbs);
                            console.log("-- InsertOrUpdateUserCourseBookmark --", err)
                            // throw (err);
                            // return res.status(401).send(JSON.stringify(err));
                            return reject(new HttpError(JSON.stringify(err)))
                        }
                        else {
                            // console.log("update", response)

                            let usql = "UPDATE users_products_units_info upcs \n" +
                                " JOIN (SELECT sucm.users_products_units_info_id, SEC_TO_TIME(SUM(TIME_TO_SEC(sucm.total_module_timespent))) as total_units_timespent \n" +
                                " FROM users_products_units_module sucm WHERE sucm.users_products_units_info_id = ? and sucm.company_id = ? and sucm.user_id = ?) as stmt  ON stmt.users_products_units_info_id = upcs.users_products_units_info_id  \n" +
                                " JOIN (SELECT upcst.company_id, upcst.user_id, upcst.product_id, SEC_TO_TIME(SUM(TIME_TO_SEC(upcst.total_units_timespent))) as total_products_timespent FROM users_products_units_info upcst \n" +
                                " WHERE upcst.company_id = ? and upcst.user_id = ? and upcst.product_id = ?) totalunittime ON totalunittime.company_id = upcs.company_id and totalunittime.user_id = upcs.user_id and totalunittime.product_id = upcs.product_id \n" +
                                " INNER JOIN users_products_info pinfo ON  pinfo.company_id = upcs.company_id and pinfo.user_id = upcs.user_id and pinfo.product_id = upcs.product_id \n" +
                                " SET upcs.total_units_timespent = stmt.total_units_timespent,  pinfo.total_timespent = totalunittime.total_products_timespent, \n" +
                                "  upcs.all_training_data = JSON_SET(all_training_data, substr(JSON_SEARCH(all_training_data, 'all', 'Online'),2,4),\n" +
                                'json_object("score", null,"status", upcs.status,"upcs.updated_by", ?,"updated_on", ?, \n' +
                                '"training_id",upcs.unit_id,"training_time", upcs.total_units_timespent,"training_type","Online","completed_date",upcs.completed_date,"completion_percentage", upcs.completion_percentage)) \n'
                                " pinfo.session_enddate = ?, pinfo.updated_on=? WHERE upcs.users_products_units_info_id = ? and upcs.company_id = ? and upcs.user_id = ?";

                            // courseErrorTrace(req, res, "InsertOrUpdateUserCourseBookmark - update products info session enddate - 6");
                            dbs.query(usql, [params.unitsinfoId, params.companyId, params.userId, params.companyId, params.userId, params.productid,
                            params.userId, currentDateTime, currentDateTime, currentDateTime, params.unitsinfoId, params.companyId, params.userId],
                                function (ucerrs, uCresponses) {
                                    dbcon.closeConnection(dbs);
                                    if (ucerrs != null) {
                                        console.log("-- InsertOrUpdateUserCourseBookmark --", ucerrs)
                                        // throw (ucerrs);
                                        // return res.status(401).send(JSON.stringify(ucerrs))
                                        return reject(new HttpError(JSON.stringify(ucerrs)))
                                    }
                                    else {
                                        // return res.status(200).send(uCresponses);
                                        return resolve(new HttpResponse({affectedRows:uCresponses.affectedRows}))
                                    }
                                });

                        }
                    })
            }) 
        })
        return finalresponse.then((retVal)=>{console.log("333",retVal.statusCode);return retVal})
    }
 
    async updateUserModuleCompletion(...apiargs) {
        let req =apiargs[0];
        let res =apiargs[1];
        ///////////////////////////////// removable line
        req.companyId = req.body.companyId;
        ///////////////////////////////
        let finalresponse;
        await dbcon.getDbConnection(req).then(dbs => {
            let resData = apiargs[0].body;

            let vModuleStatus = req.body.QuizCompletionStatus != undefined ? req.body.QuizCompletionStatus : 'Completed';
            // let vDateTimeStatus = vModuleStatus == "Completed" ? common.GetDateTimeInTimeZone() : null; //new Date()
            let vDateTime = utility.GetDateTimeInTimeZone();
            // let vDateTimeStamp = Math.floor(vDateTime / 1000);
            let boardcontentlength = resData.boardcontentlength;
            let CorrectAnswersCount = resData.CorrectAnswersCount;
            let QuizCompletionStatus = resData.QuizCompletionStatus;
            let CompletionPercentage = resData.CompletionPercentage;
            let vMastered = vModuleStatus == "Completed" ? 1 : 0;
            let vMasteredDate = vMastered > 0 ? vDateTime : null;

            if (resData.moduletype == undefined) {
                boardcontentlength = null;
                CorrectAnswersCount = null;
                QuizCompletionStatus = null;
                CompletionPercentage = null;
                vMasteredDate = null;
                vMastered = null;
            }
            let upsql = "UPDATE users_products_units_module upcm INNER JOIN company_master cmpm ON cmpm.company_id = upcm.company_id SET upcm.session_enddate = ?, upcm.status = case when upcm.status = 'Inprogress' THEN ? ELSE upcm.status END,  upcm.completed_date = case when upcm.completed_date is null && upcm.status = 'Completed' THEN ? ELSE upcm.completed_date END, \n" +
                " upcm.total_quiz_question_count= case when upcm.mastered_date is not null and upcm.score < ? then ? when upcm.mastered_date is null then ? else upcm.total_quiz_question_count end, \n" +
                " upcm.correct_answered_count= case when upcm.mastered_date is not null and upcm.score < ? then ? when upcm.mastered_date is null then ? else upcm.correct_answered_count end, \n" +
                " upcm.no_of_attempts = case when upcm.correct_answered_count is not null then IF(upcm.no_of_attempts IS NULL , 1, IF(no_of_attempts IS NULL, upcm.no_of_attempts, upcm.no_of_attempts + 1)) else null end,  \n" +
                " upcm.total_points = upcm.total_quiz_question_count, \n" +
                " upcm.user_answered_points = upcm.correct_answered_count, \n" +
                " upcm.quiz_status = case when upcm.mastered_date is not null and upcm.score < ? then ? when upcm.mastered_date is null then ? else upcm.quiz_status end, \n" +
                " upcm.score = case when upcm.mastered_date is not null and upcm.score < ? then ? when upcm.mastered_date is null then ? else upcm.score end,\n" +
                " upcm.mastered_date = case when upcm.mastered_date is not null and upcm.score <= ? then ? when upcm.mastered_date is null then ? else upcm.mastered_date end, \n" +
                " upcm.mastered = case when upcm.mastered_date is not null and upcm.score <= ? then ? when upcm.mastered_date is null then ? else upcm.mastered end \n" +
                " WHERE users_products_units_info_id = ? and module_id = ?; \n" +
                " UPDATE users_products_units_module_activity_history umah INNER JOIN company_master cmpm ON cmpm.company_id = umah.company_id SET session_enddate = ? WHERE users_products_units_activity_history_id = ? and module_id = ? and users_products_units_module_activity_history_id =?; \n" +
                " UPDATE users_products_units_info upui JOIN (SELECT um.users_products_units_info_id, um.user_id, um.company_id, count(1) as completedmodulecount FROM users_products_units_module um INNER JOIN company_master cmpm ON cmpm.company_id = um.company_id WHERE um.completed_date is not null and um.users_products_units_info_id=? and um.user_id=? and um.company_id=? GROUP BY um.users_products_units_info_id ) um on upui.users_products_units_info_id = um.users_products_units_info_id and upui.user_id=um.user_id and upui.company_id=um.company_id \n" +
                "INNER JOIN company_master cmpm ON cmpm.company_id = upui.company_id SET completion_percentage = CASE WHEN ? ='Inprogress' THEN completion_percentage ELSE round((completedmodulecount/upui.unit_module_count)* 100) END WHERE upui.users_products_units_info_id=? and upui.user_id=? and upui.company_id=? and upui.completed_date is null ; \n";

            let upsqlScore = " UPDATE users_products_units_module_response_score upumrs SET upumrs.completed_date=?, upumrs.mastered_date =?, upumrs.score=?, upumrs.status=? WHERE upumrs.users_products_units_info_id = ? and upumrs.module_id = ? and upumrs.company_id=(SELECT company_id FROM company_master cmpm) order by upumrs.users_products_units_module_response_score_id desc limit 1; \n";

            let data = [vDateTime, vModuleStatus, vDateTime,
                CompletionPercentage, boardcontentlength, boardcontentlength,
                CompletionPercentage, CorrectAnswersCount, CorrectAnswersCount,
                CompletionPercentage, QuizCompletionStatus, QuizCompletionStatus,
                CompletionPercentage, CompletionPercentage, CompletionPercentage,
                CompletionPercentage, vMasteredDate, vMasteredDate,
                CompletionPercentage, vMastered, vMastered,
                resData.unitsinfoId, resData.moduleId, vDateTime, resData.courseLoginHistoryId, resData.moduleId, resData.moduleActivityHistoryid,
                resData.unitsinfoId, resData.userId, resData.companyId, vModuleStatus, resData.unitsinfoId, resData.userId, resData.companyId]

            let data1 = [vDateTime, vMasteredDate, resData.CompletionPercentage, resData.QuizCompletionStatus, resData.unitsinfoId, resData.moduleId]
            if (resData.moduletype) {
                upsql = upsql + upsqlScore;
                data = [...data, ...data1];
            }

            // courseErrorTrace(req, res, "UpdateUserCourseModuleCompetion - update module session enddate - 7");
            finalresponse = new Promise((resolve, reject) => {
                dbs.query(upsql, data,
                function (err, responses) {
                    if (err != null) {
                        dbcon.closeConnection(dbs);
                        console.log("Module responses, err: ", err) 
                        return reject(new HttpError(JSON.stringify(err)));
                    }

                    if (responses[0].affectedRows > 0) {
                        let upsql1 = "UPDATE users_products_units_module upcm, (SELECT ADDTIME(TIMEDIFF(session_enddate, session_startdate), case when total_module_timespent is not null then total_module_timespent else '00:00:00' end) as total_module_timespent, sucm.company_id FROM users_products_units_module sucm WHERE users_products_units_info_id = ? and module_id = ?) as stmt " +
                            "INNER JOIN company_master cmpm ON cmpm.company_id = stmt.company_id SET upcm.total_module_timespent = stmt.total_module_timespent WHERE users_products_units_info_id = ? and module_id = ?;";

                        // courseErrorTrace(req, res, "UpdateUserCourseModuleCompetion - update module timespent - 8");
                        dbs.query(upsql1, [resData.unitsinfoId, resData.moduleId, resData.unitsinfoId, resData.moduleId],
                            function (errs, ress) {
                                if (errs != null) {
                                    dbcon.closeConnection(dbs);
                                    console.log("Module session time update err: ", errs)
                                    return reject(new HttpError(JSON.stringify(err)));
                                }
                                /************** UpdateCompletionInUserProductUnits  ******************/
                                let completeioncountsql = "SELECT CASE WHEN COUNT(upum.status) = upui.unit_module_count THEN 1 ELSE 0 END as unitcompletedcount \n" +
                                    "FROM users_products_units_module upum \n" +
                                    "INNER JOIN company_master cmpm ON cmpm.company_id = upum.company_id \n" +
                                    "INNER JOIN users_products_units_info upui ON  upui.users_products_units_info_id = upum.users_products_units_info_id and upui.company_id = upum.company_id and upui.user_id = upum.user_id \n" +
                                    "WHERE upui.users_products_units_info_id = ? and upui.company_id = ? and upui.user_id = ? and upum.status ='Completed'; \n" +

                                    "UPDATE users_products_units_info upcs \n" +
                                    " JOIN (SELECT sucm.users_products_units_info_id, SEC_TO_TIME(SUM(TIME_TO_SEC(sucm.total_module_timespent))) as total_units_timespent \n" +
                                    " FROM users_products_units_module sucm WHERE sucm.users_products_units_info_id = ? and sucm.company_id = ? and sucm.user_id = ?) as stmt ON stmt.users_products_units_info_id = upcs.users_products_units_info_id  \n" +

                                    " JOIN (SELECT upcst.company_id, upcst.user_id, upcst.product_id, SEC_TO_TIME(SUM(TIME_TO_SEC(upcst.total_units_timespent))) as total_products_timespent FROM users_products_units_info upcst \n" +
                                    " WHERE upcst.company_id = ? and upcst.user_id = ? and upcst.product_id = ?) totalunittime ON totalunittime.company_id = upcs.company_id and totalunittime.user_id = upcs.user_id and totalunittime.product_id = upcs.product_id \n" +
                                    " INNER JOIN users_products_info pinfo ON  pinfo.company_id = upcs.company_id and pinfo.user_id = upcs.user_id and pinfo.product_id = upcs.product_id \n" +
                                    "  INNER JOIN company_master cmpm ON cmpm.company_id = upcs.company_id \n" +
                                    " SET bookmark = null, upcs.total_units_timespent = stmt.total_units_timespent,  pinfo.total_timespent = totalunittime.total_products_timespent \n" +
                                    " , upcs.all_training_data = JSON_SET(all_training_data, substr(JSON_SEARCH(all_training_data, 'all', 'Online'),2,4),\n" +
                                    'json_object("score", null,"status", upcs.status,"upcs.updated_by", ?,"updated_on", ?, \n' +
                                    '"training_id", upcs.unit_id,"training_time", upcs.total_units_timespent,"training_type","Online","completed_date",upcs.completed_date,"completion_percentage", upcs.completion_percentage)) \n' +
                                    " WHERE upcs.users_products_units_info_id = ? and upcs.company_id = ? and upcs.user_id = ?;  \n";

                                // courseErrorTrace(req, res, "UpdateUserCourseModuleCompetion - update users_products_units_info timespent - 9");
                                dbs.query(completeioncountsql, [resData.unitsinfoId, resData.companyId, resData.userId,
                                resData.unitsinfoId, resData.companyId, resData.userId,
                                resData.companyId, resData.userId, resData.productid, resData.userId, vDateTime,
                                resData.unitsinfoId, resData.companyId, resData.userId,
                                ],
                                    function (errs, cresponses) {
                                        // console.log("comptdmodulecount1 =====" , cresponses[0][0].unitcompletedcount) 
                                        if (errs != null) {
                                            dbcon.closeConnection(dbs);
                                            console.log(errs)
                                            return reject(new HttpError(JSON.stringify(errs)));
                                        }
                                        if (cresponses[0][0].unitcompletedcount == 0) {
                                            dbcon.closeConnection(dbs);
                                            return resolve(new HttpResponse(JSON.stringify(cresponses)))
                                        }
                                        else if (cresponses[0][0].unitcompletedcount > 0) {
                                            let upsql = "SELECT JSON_EXTRACT(options, '$.activity_enabled') as activity_enabled \n" +
                                                "FROM course_options_master WHERE company_id = ?; \n" +
                                                "UPDATE users_products_units_info uinfo  INNER JOIN company_master cmpm ON cmpm.company_id = uinfo.company_id SET last_completed_date =?, uinfo.completed_date = case when uinfo.completed_date is null THEN ? ELSE uinfo.completed_date END, \n" +
                                                " uinfo.status ='Completed',uinfo.training_type ='Online', uinfo.all_training_data = JSON_SET(all_training_data, substr(JSON_SEARCH(all_training_data, 'all', 'Online'),2,4), \n" +
                                                'json_object("score", null,"status", status,"updated_by", ?,"updated_on", ?, \n' +
                                                '"training_id", uinfo.unit_id,"training_time", total_units_timespent,"training_type","Online","completed_date",completed_date,"completion_percentage", completion_percentage) \n' +
                                                ") WHERE uinfo.users_products_units_info_id = ? and uinfo.company_id = ? and uinfo.user_id = ? ;";
                                            // courseErrorTrace(req, res, "UpdateUserCourseModuleCompetion - update users_products_units_info timespent count - 91###" + cresponses[0][0].unitcompletedcount);
                                            dbs.query(upsql, [resData.companyId, vDateTime, vDateTime, resData.userId, vDateTime, resData.unitsinfoId, resData.companyId, resData.userId],
                                                function (ucerrs, uCresponses) {
                                                    if (ucerrs != null) {
                                                        dbcon.closeConnection(dbs);
                                                        console.log("--- Product info status updated error ----", ucerrs)
                                                        return reject(new HttpError(JSON.stringify(ucerrs)))
                                                    }

                                                    let usql1 = "SELECT @TotalUnits:=count(1), @AllUnitsCompleted:= count(CASE WHEN uinfo.status = 'Completed' THEN 1 END), @LastComptionCount:= SUM(CASE WHEN DATE_FORMAT(pinfo.last_completed_date, '%Y-%m-%d') <= DATE_FORMAT(uinfo.last_completed_date, '%Y-%m-%d') THEN 1 ELSE 0 END)  \n" +
                                                        "FROM users_products_units_info uinfo inner join users_products_info pinfo on pinfo.company_id = uinfo.company_id and pinfo.user_id = uinfo.user_id and pinfo.product_id = uinfo.product_id \n" +
                                                        "INNER JOIN company_master cmpm ON cmpm.company_id = uinfo.company_id \n" +
                                                        "WHERE uinfo.company_id = ? and uinfo.user_id = ? and uinfo.product_id =?; \n" +
                                                        "UPDATE users_products_info pinfo  INNER JOIN company_master cmpm ON cmpm.company_id = pinfo.company_id SET pinfo.last_completed_date = CASE WHEN @LastComptionCount = @TotalUnits THEN ? ELSE pinfo.last_completed_date END, pinfo.completed_date = CASE WHEN pinfo.completed_date is null THEN ? ELSE pinfo.completed_date END, pinfo.status ='Completed' WHERE pinfo.company_id = ? and pinfo.user_id = ? and pinfo.product_id =? and @TotalUnits = @AllUnitsCompleted ; ";

                                                    // courseErrorTrace(req, res, "UpdateUserCourseModuleCompetion - update users_products_units_info timespent - 10");
                                                    dbs.query(usql1, [resData.companyId, resData.userId, resData.productid,
                                                        vDateTime, vDateTime, resData.companyId, resData.userId, resData.productid],
                                                        function (ucerrs, xuCresponses) {
                                                            dbcon.closeConnection(dbs);
                                                            if (parseInt(uCresponses[0][0].activity_enabled) == 1)
                                                                userActivityProductUnits(req, res);
                                                            if (ucerrs != null) {
                                                                console.log("**** product info status&date update error **** ", ucerrs)
                                                                return reject(new HttpError(JSON.stringify(ucerrs)))
                                                            }
                                                            else {
                                                                return resolve(new HttpResponse(JSON.stringify(xuCresponses)))
                                                            }
                                                        });
                                                });
                                        } else {
                                            dbcon.closeConnection(dbs);
                                            return resolve(new HttpResponse(JSON.stringify(cresponses)))
                                        }
                                    });
                                /************** UpdateCompletionInUserProductUnits  ******************/
                            });
                    }
                });
            });
        });
        return finalresponse.then((retVal) => { return retVal });
    }
  
    async updateModuleSessionCompletion(...apiargs){
        let req = apiargs[0];
        req.companyId = req.body.companyId;
        let params = req.body; 
        let vDateTime = utility.GetDateTimeInTimeZone();
        let finalresponse;
        await dbcon.getDbConnection(req).then(dbs => {
            let activityInsertSql = "Update users_products_units_module upcm INNER JOIN company_master cmpm ON cmpm.company_id = upcm.company_id SET upcm.session_enddate = ? WHERE upcm.company_id = ? and upcm.user_id = ? and upcm.users_products_units_info_id = ? and upcm.module_id = ?;"
            // courseErrorTrace(req, res, "UpdateUserCourseModuleSessionsCompletion - update users_products_units_module session_enddate - 11 ");
            finalresponse = new Promise((resolve, reject) => { 
                dbs.query(activityInsertSql, [vDateTime, params.companyId, params.userId, params.unitsinfoId, params.moduleId], function (ainserr, ainsresponse) {
                    if (ainserr != null) {
                        dbcon.closeConnection(dbs);
                        console.log("-- UpdateUserCourseModuleSessionsCompletion --", ainserr)
                        reject(new HttpError(JSON.stringify(ainserr)))
                    }
                    else {
                        // console.log("ainsresponse", ainsresponse)
                        let vsql = "Update users_products_units_module upcm , (SELECT ADDTIME(TIMEDIFF(session_enddate, session_startdate), \n" +
                            "case when total_module_timespent is not null then total_module_timespent else '00:00:00' end) as total_module_timespent \n" +
                            "FROM users_products_units_module sucm \n" +
                            "INNER JOIN company_master cmpm ON cmpm.company_id = sucm.company_id \n" +
                            "WHERE users_products_units_info_id  = ? and sucm.company_id = ? and sucm.user_id = ? and  sucm.module_id = ?) as stmt \n" +
                            " SET upcm.total_module_timespent = stmt.total_module_timespent WHERE users_products_units_info_id = ? and upcm.company_id = ? and upcm.user_id = ? and upcm.module_id = ?;\n" +

                            "Update users_products_units_module_activity_history upumah INNER JOIN company_master cmpm ON cmpm.company_id = upumah.company_id SET upumah.session_enddate = ? WHERE upumah.users_products_units_module_activity_history_id = ? \n" +
                            "and upumah.users_products_units_activity_history_id = ? and upumah.module_id = ?; \n" +

                            "Update users_products_units_info upui INNER JOIN company_master cmpm ON cmpm.company_id = upui.company_id SET upui.bookmark = null WHERE upui.users_products_units_info_id = ? and upui.company_id = ? and upui.user_id = ? and upui.product_id = ? and upui.unit_id =?;\n";

                        // courseErrorTrace(req, res, "UpdateUserCourseModuleSessionsCompletion - update users_products_units_module session_enddate, total_module_timespent - 12");
                        dbs.query(vsql, [params.unitsinfoId, params.companyId, params.userId, params.moduleId,
                        params.unitsinfoId, params.companyId, params.userId, params.moduleId,
                            vDateTime, params.moduleActivityHistoryId, params.courseLoginHistoryId, params.moduleId,
                        params.unitsinfoId, params.companyId, params.userId, params.productId, params.unitId], function (ainserr, ainsresponses) {
                            if (ainserr != null) {
                                dbcon.closeConnection(dbs);
                                console.log("-- UpdateUserCourseModuleSessionsCompletion --", ainserr)
                                reject(new HttpError(JSON.stringify(ainserr)))
                            }
                            else {
                                let usql1 = "UPDATE users_products_units_info upcs \n" +
                                    " JOIN (SELECT sucm.users_products_units_info_id, SEC_TO_TIME(SUM(TIME_TO_SEC(sucm.total_module_timespent))) as total_units_timespent \n" +
                                    " FROM users_products_units_module sucm INNER JOIN company_master cmpm ON cmpm.company_id = sucm.company_id WHERE sucm.users_products_units_info_id = ? and sucm.company_id = ? and sucm.user_id = ?) as stmt ON stmt.users_products_units_info_id = upcs.users_products_units_info_id  \n" +

                                    " JOIN (SELECT upcst.company_id, upcst.user_id, upcst.product_id, SEC_TO_TIME(SUM(TIME_TO_SEC(upcst.total_units_timespent))) as total_products_timespent FROM users_products_units_info upcst \n" +
                                    " WHERE upcst.company_id = ? and upcst.user_id = ? and upcst.product_id = ?) totalunittime ON totalunittime.company_id = upcs.company_id and totalunittime.user_id = upcs.user_id and totalunittime.product_id = upcs.product_id \n" +
                                    " INNER JOIN users_products_info pinfo ON  pinfo.company_id = upcs.company_id and pinfo.user_id = upcs.user_id and pinfo.product_id = upcs.product_id \n" +
                                    " INNER JOIN company_master cmpm ON cmpm.company_id = upcs.company_id \n" +
                                    " SET upcs.total_units_timespent = stmt.total_units_timespent,  pinfo.total_timespent = totalunittime.total_products_timespent \n" +
                                    " WHERE upcs.users_products_units_info_id = ? and upcs.company_id = ? and upcs.user_id = ?;";

                                // courseErrorTrace(req, res, "UpdateUserCourseModuleSessionsCompletion - update users_products_units_info- total_units_timespent - 13");
                                dbs.query(usql1, [params.unitsinfoId, params.companyId, params.userId, params.companyId, params.userId, params.productId,
                                params.unitsinfoId, params.companyId, params.userId],
                                    function (ucerrs, uCresponses) {
                                        dbcon.closeConnection(dbs);
                                        // console.log("ainsresponse", uCresponses)
                                        if (ucerrs != null) {
                                            console.log("-- UpdateUserCourseModuleSessionsCompletion --", ucerrs)
                                            reject(new HttpError(JSON.stringify(ucerrs)))
                                        }
                                        else {
                                            resolve(new HttpResponse("successfully updated"));
                                        }
                                    });
                            }
                        });
                    }
                });
            })
        });
        return finalresponse;
    }

    userActivityProductUnits(req, res) {
        var vParams = {
            companyid: req.body.companyId,
            userid: req.body.userId,
            productid: req.body.productid,
            activityid: req.body.activityid,
            unitid: req.body.unitid,
            unitstatus: 'Completed',
            learntype: "course"
        }
        // activityController.upDateUserActivityProductUnits(req, res, vParams);
    }
}

module.exports = { ModuleService };