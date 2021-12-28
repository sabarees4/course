const mysql = require('mysql');
const AWS = require("aws-sdk");


// varibale to store conenction pool
let connection_pool = null;
//Variable to store connection from pool            
let connection_pools = {};
let idle_connections = {};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
module.exports = {
    //method to get connection
    getDbConnection_CMPID: (companyid, withCompanyURl) => {
        let origin = '';
        let c_id = companyid.toString();
        //Dynamo db config                                  
        AWS.config.update({
            accessKeyId: process.env.DYNAMO_ACCESS_KEY,
            secretAccessKey: process.env.DYNAMO_SECRET_KEY,
            region: process.env.DYNAMO_REGION,
        });
        const docClient = new AWS.DynamoDB.DocumentClient();
        const table = process.env.DYNAMO_TABLE;
        //Dynamo db table name with key to get values
        const params = {
            TableName: table,
            Key: {
                'company_id': companyid.toString()
            }
        };
        return new Promise((resolve, reject) => {                                    //Promises to get connections

            docClient.get(params, function (err, data) {                                 //Get response from dynamo db
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    //console.log("scan succeeded:", JSON.stringify(data));
                    var obj = {
                        connectionLimit: 20,                                                        //Database configs from dynamo db
                        host: data.Item.db_host,
                        user: data.Item.db_user,
                        password: data.Item.db_pwd,
                        db_name: data.Item.db_name,
                        origin: data.Item.company_url,
                        multipleStatements: true,
                        company_id: data.Item.company_id,
                        "acquireTimeout": 1000000
                    }
                    origin = data.Item.company_url
                    let iam_service = data.Item.iam_service;
                    let data_privileges = data.Item.data_privileges;



                    module.exports.getConnection(obj, c_id).then(connection => {                                      //get connection from pool
                        //console.log("get connect")
                        if (withCompanyURl === true) {
                            if (data.Item.db_name != connection.config['database']) {
                                console.log("database mismatch")
                            }
                            if (data.Item.db_name != connection.config['database']) {
                                connection_pools[data.Item.company_url].changeUser({ database: data.Item.db_name }, (err) => {
                                    if (err) {
                                        console.log(err)
                                    } else {

                                        let connwithCompanyURl = {
                                            connection: connection,
                                            company_url: origin
                                        }
                                        // console.log("withCompanyURl" , withCompanyURl)
                                        // console.log("origin1", req.headers.origin)
                                        // console.log("cmpId_origin1", data.Item.company_url)
                                        // console.log("cmpId_origin2", connection.config['database'])
                                        // console.log("cmpId_origin3", connection.config['host'])
                                        // console.log("cmpId_from object", connection_pools[data.Item.company_url].config['database'])

                                        resolve(connwithCompanyURl)
                                    }
                                })
                            } else {
                                let connwithCompanyURl = {
                                    connection: connection,
                                    company_url: origin
                                }
                                // console.log("withCompanyURl" , withCompanyURl)
                                // console.log("origin1", req.headers.origin)
                                // console.log("cmpId_origin1", data.Item.company_url)
                                // console.log("cmpId_origin2", connection.config['database'])
                                // console.log("cmpId_origin3", connection.config['host'])
                                // console.log("cmpId_from object", connection_pools[data.Item.company_url].config['database'])

                                resolve(connwithCompanyURl)
                            }

                        }
                        else {
                            // console.log("withCompanyURl -= ", withCompanyURl)
                            //  console.log("origin1", req.headers.origin)
                            // console.log("cmpId_origin1", data.Item.company_url)
                            // console.log("cmpId_origin2", connection.config['database'])
                            // console.log("cmpId_origin3", connection.config['host'])
                            // console.log("cmpId_from object", connection_pools[data.Item.company_url].config['database'])

                            if (data.Item.db_name != connection.config['database']) {
                                console.log("database mismatch")
                            }
                            if (data.Item.db_name != connection.config['database']) {
                                // console.log('#################################')
                                connection_pools[data.Item.company_url].changeUser({ database: data.Item.db_name }, (err) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        // console.log('#################################')

                                        // console.log("cmpId_origin1", data.Item.company_url)
                                        // console.log("cmpId_origin2", connection.config['database'])
                                        // console.log("cmpId_origin3", connection.config['host'])
                                        // console.log("cmpId_from object", connection_pools[data.Item.company_url].config['database'])
                                        resolve(connection)
                                    }
                                })
                            } else {
                                resolve(connection)
                            }
                        }
                    })
                }
            });


        })
    },

    //method to get connection
    getDbConnection: (req) => {
        let origin = req.headers.origin;
        //Dynamo db config                                  
        AWS.config.update({
            accessKeyId: process.env.DYNAMO_ACCESS_KEY,
            secretAccessKey: process.env.DYNAMO_SECRET_KEY,
            region: process.env.DYNAMO_REGION,
        });
        const docClient = new AWS.DynamoDB.DocumentClient();
        const table = process.env.DYNAMO_TABLE;
        //Dynamo db table name with key to get values
        let company_id = req.companyId.toString();
        const params = {
            TableName: table,
            Key: {
                'company_id': company_id
            }
        };
        return new Promise((resolve, reject) => {                                    //Promises to get connections

            docClient.get(params, function (err, data) {                                 //Get response from dynamo db
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("scan succeeded:", JSON.stringify(data));
                    var obj = {
                        connectionLimit: 20,                                                        //Database configs from dynamo db
                        host: data.Item.db_host,
                        user: data.Item.db_user,
                        password: data.Item.db_pwd,
                        db_name: data.Item.db_name,
                        multipleStatements: true,
                        "acquireTimeout": 1000000,
                        origin: data.Item.company_url,
                        company_id: data.Item.company_id
                    }
                    let iam_service = data.Item.iam_service;
                    let data_privileges = data.Item.data_privileges;


                    if (iam_service) {
                        req.ssi_service = true;
                    } else {
                        req.ssi_service = false;
                    }
                    if (data_privileges) {
                        req.data_priv = true;
                    } else {
                        req.data_priv = false;
                    }
                    module.exports.getConnection(obj, company_id).then(connection => {                                      //get connection from pool
                        // console.log("fromconnn_origin1", req.headers.origin)
                        // console.log("fromconnn_origin1", data.Item.company_url)
                        // console.log("fromconnn_origin2", connection.config['database'])
                        // console.log("fromconnn_origin3", connection.config['host'])
                        // console.log("fromconnn_from object", connection_pools[data.Item.company_url].config['database']);
                        if (data.Item.db_name != connection.config['database']) {
                            console.log("database mismatch")
                        }
                        if (data.Item.db_name != connection.config['database']) {
                            // console.log('-----------------------------------------')
                            connection_pools[data.Item.company_url].changeUser({ database: data.Item.db_name }, (err) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    // console.log("fromconnn_origin1", req.headers.origin)
                                    // console.log("fromconnn_origin1", data.Item.company_url)
                                    // console.log("fromconnn_origin2", connection.config['database'])
                                    // console.log("fromconnn_origin3", connection.config['host'])
                                    // console.log("fromconnn_from object", connection_pools[data.Item.company_url].config['database']);
                                    resolve(connection)
                                }
                            })
                        } else {
                            resolve(connection)
                        }
                    })
                }
            });


        })
    },
    //MEthod to get connection for public routes eg. Login ,forgot password
    getDbOnOrigin: (origin, req, res) => {

        return new Promise((resolve) => {
            AWS.config.update({                                                     //Dynamo db configs
                accessKeyId: process.env.DYNAMO_ACCESS_KEY,
                secretAccessKey: process.env.DYNAMO_SECRET_KEY,
                region: process.env.DYNAMO_REGION,
            });
            const docClient = new AWS.DynamoDB.DocumentClient();
            const table = process.env.DYNAMO_TABLE;
            let cUrl = origin;
            console.log("vurls", origin)
            const params = {                                         //DYnamo db table name with key values, origin is the key
                TableName: table,
                ProjectionExpression: 'company_id,company_url,db_host,db_user,db_pwd,db_name,iam_service,data_privileges',
                ExpressionAttributeNames: {
                    "#cUrl": "company_url",
                },
                ExpressionAttributeValues: {
                    ":company_url": cUrl
                },
                FilterExpression: "#cUrl = :company_url"
            };
            docClient.scan(params, async function (err, data) {                            //response from dynamo db
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("scans succeeded orgin from origin:", JSON.stringify(data));
                    if (data.Items.length > 0) {
                        let conn_details = data.Items[0];
                        var obj = {
                            connectionLimit: 20,
                            host: conn_details.db_host,
                            user: conn_details.db_user,
                            password: conn_details.db_pwd,
                            db_name: conn_details.db_name,
                            multipleStatements: true,
                            origin: conn_details.company_url,
                            "acquireTimeout": 1000000,
                            company_id: conn_details.company_id
                        }
                        let iam_service = conn_details.iam_service;
                        let data_privileges = conn_details.data_privileges;
                        if (iam_service) {
                            req.ssi_service = true;
                        } else {
                            req.ssi_service = false;
                        }
                        if (data_privileges) {
                            req.data_priv = true;
                        } else {
                            req.data_priv = false;
                        }

                        module.exports.getConnection(obj, origin).then(connection => {                         //Get connection
                            // console.log("fromOrg_1origin1", req.headers.origin)
                            // console.log("fromOrg_1origin1", conn_details.company_url)
                            // console.log("fromOrg_1origin2", connection.config['database'])
                            // console.log("fromOrg_1origin3", connection.config['host'])
                            // console.log("fromOrg_from object", connection_pools[conn_details.company_url].config['database'])
                            if (conn_details.db_name != connection.config['database']) {
                                // console.log('-----------------------------------------')
                                connection_pools[conn_details.company_url].changeUser({ database: conn_details.db_name }, (err) => {
                                    if (err) {
                                        console.log(err)
                                    } else {

                                        // console.log("fromconnn_origin1", req.headers.origin)
                                        // console.log("fromconnn_origin1", conn_details.company_url)
                                        // console.log("fromconnn_origin2", connection.config['database'])
                                        // console.log("fromconnn_origin3", connection.config['host'])
                                        // console.log("fromconnn_from object", connection_pools[conn_details.company_url].config['database']);
                                        resolve(connection)
                                    }
                                })
                            } else {
                                resolve(connection)
                            }



                        }).catch(err => {
                            if (err) throw err;
                        })
                    } else {
                        res.status(406);
                        return res.send({ "Message": "LBLCOMPANYNOTFOUND" })
                    }
                }
            });
        })
    },
    closeConnection: (connection) => {                                          //Method to close the connection
        // //console.log('onConnection', connection.state)
        if (connection) {
            if (connection.state === 'authenticated' && connection_pool._freeConnections.indexOf(connection) === -1) {
                //console.log("con Index", connection_pool._freeConnections.indexOf(connection))
                connection.release();
            }
        }
        else {
            //console.log("Connection Need to close");
        }

    },
    destroyConnection: (connection) => {
        connection.destroy();
    },
    getCompanyIdOnOrgin: (origin, res) => {
        return new Promise((resolve) => {
            AWS.config.update({                                                     //Dynamo db configs
                accessKeyId: process.env.DYNAMO_ACCESS_KEY,
                secretAccessKey: process.env.DYNAMO_SECRET_KEY,
                region: process.env.DYNAMO_REGION,
            });
            const docClient = new AWS.DynamoDB.DocumentClient();
            const table = process.env.DYNAMO_TABLE;
            let cUrl = origin;
            const params = {                                         //DYnamo db table name with key values, origin is the key
                TableName: table,
                ProjectionExpression: 'company_id,company_url,db_host,db_user,db_pwd,db_name',
                ExpressionAttributeNames: {
                    "#cUrl": "company_url",
                },
                ExpressionAttributeValues: {
                    ":company_url": cUrl
                },
                FilterExpression: "#cUrl = :company_url"
            };
            docClient.scan(params, function (err, data) {                            //response from dynamo db
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    //console.log("scans succeeded:", JSON.stringify(data));
                    if (data.Items.length > 0) {
                        let comp_id = data.Items[0].company_id;
                        resolve(comp_id);
                    } else {                                                            //database connection not found
                        return res.send({ "Message": "LBLCOMPANYNOTFOUND" })
                    }
                }
            });
        })
    },
    getConnection: async (connection_obj, origin) => {                                           //Common method to get connection
        console.log(' get connection  from Pool', Object.keys(connection_pools));
        // console.log(' get connection  from Pool');
        if (origin != connection_obj.origin) {
            console.log("origin mismatch", origin, '-----', connection_obj.origin)
        }
        return new Promise(async (resolve, reject) => {
            if (connection_pool === null) {                              //1st hit from  API , connection pool is null so it will create the connection with host
                console.log(' connected -- New Pool');
                connection_pool = mysql.createPool(connection_obj);
                connection_pool.getConnection(function (err, new_con) {
                    if (err) {
                        console.log('err   -- Host', err);
                        if (err.code === 'ETIMEDOUT') {
                            connection_pool = mysql.createPool(connection_obj);
                            connection_pool.getConnection(function (err, new_con) {
                                if (err) {
                                    // console.log('err   -- Host - 2', err);
                                    reject(err)
                                } else {
                                    new_con.changeUser({ database: connection_obj.db_name }, function (errInCon) {
                                        if (errInCon) {
                                            // console.log('errInCon   -- Host 2', errInCon);
                                            reject(errInCon)
                                        }
                                        connection_pools[connection_obj.origin] = new_con
                                        resolve(connection_pools[connection_obj.origin]);
                                    })
                                }
                            })
                        } else {
                            reject(err)
                        }
                    } else {
                        console.log(' connected -- New Pool 2');
                        new_con.changeUser({ database: connection_obj.db_name }, async function (errInCon) {
                            if (errInCon) {
                                console.log('errInCon   -- Host', errInCon);
                                reject(errInCon)
                            }

                            connection_pools[connection_obj.origin] = new_con
                            resolve(connection_pools[connection_obj.origin]);
                        })
                    }
                })
            } else {
                // console.log(' use old pool', origin);
                console.log(' connected -- New Pool 3');
                if (!connection_pools[connection_obj.origin]) {                // console.log('New connn');
                    console.log(' connected -- New Pool 5');
                    connection_pool.getConnection(async function (err, new_con) {
                        if (err) {
                            console.log('err   -- Host', err);
                            // connection_pools = {}
                            // let new_con = await getConnection(connection_obj, origin);
                            // resolve(new_con)
                            reject(err)
                        }
                        new_con.changeUser({ database: connection_obj.db_name }, function (errInCon) {
                            if (errInCon) {
                                console.log('errInCon   -- Host', errInCon);
                                reject(errInCon)
                            }
                            connection_pools[connection_obj.origin] = new_con
                            console.log(' connected -- New Pool 55');
                            resolve(connection_pools[connection_obj.origin]);
                        })
                    })
                } else if (connection_pools[connection_obj.origin]) {
                    //  console.log(' connected -- New Pool 4', connection_pools);
                    console.log(' connected -- New Pool 4', connection_pools[connection_obj.origin]["config"]["database"]);
                    console.log(' connected -- New Pool 4', origin, connection_obj.origin, connection_obj.db_name);
                    if (connection_pools[connection_obj.origin]["config"]["database"] === connection_obj.db_name && origin === connection_obj.company_id) {
                        console.log(' connected -- New Pool 45');
                        console.log("ccccccc", connection_pools[connection_obj.origin].state);
                        // connection_pools[connection_obj.origin].connect((err) => {
                        //     if (err) console.log(err)
                        // })
                        if (connection_pools[connection_obj.origin].state !== 'disconnected') {
                            console.log(' connected -- New Pool  OLD CON 45');
                            resolve(connection_pools[connection_obj.origin]);
                        } else {
                            console.log(' connected -- New Pool  new CON 46');
                            connection_pool.getConnection(async function (err, new_con) {
                                if (err) {
                                    console.log('err   -- Host', err);
                                    // connection_pools = {}
                                    // let new_con = await getConnection(connection_obj, origin);
                                    // resolve(new_con)
                                    reject(err)
                                }
                                new_con.changeUser({ database: connection_obj.db_name }, function (errInCon) {
                                    if (errInCon) {
                                        console.log('errInCon   -- Host', errInCon);
                                        reject(errInCon)
                                    }
                                    connection_pools[connection_obj.origin] = new_con
                                    console.log(' connected -- Old Pool - New connection  - Due to fatal error');
                                    resolve(connection_pools[connection_obj.origin]);
                                })
                            })
                        }

                    } else {
                        console.log(' connected -- New Pool 55');
                        if (idle_connections === {}) {
                            idle_connections = connection_pools;
                        } else {
                            idle_connections = { ...idle_connections, ...connection_pools };
                        }

                        closeIdleConnections(idle_connections)
                        connection_pools = {}
                        let new_con = await module.exports.getConnection(connection_obj, origin);
                        resolve(new_con)
                    }

                    //console.log('Old connn', connection_obj.db_name);
                    // connection_pools[connection_obj.origin].changeUser({ database: connection_obj.db_name }, function (errInCon) {
                    //     //console.log('errInCon   -- get con', JSON.stringify(errInCon));
                    //     if (errInCon) {
                    //         console.log('errInCon   -- get con', JSON.stringify(errInCon));
                    //         if (errInCon.fatal && errInCon.code !== "ECONNRESET") {
                    //             reject(errInCon)
                    //         } else if (errInCon.code === 'PROTOCOL_CONNECTION_LOST') {
                    //             //console.log('errInCon   -- get new con');
                    //             reject(errInCon)
                    //         } else {
                    //             //console.log('errInCon   -- get new con');
                    //             connection_pool.getConnection(function (err, new_con) {
                    //                 if (err) {
                    //                     //console.log('err   -- Host', err);
                    //                     reject(err)
                    //                 }
                    //                 new_con.changeUser({ database: connection_obj.db_name }, function (errInCon) {
                    //                     if (errInCon) {
                    //                         //console.log('errInCon   -- Host', errInCon);
                    //                         reject(errInCon)
                    //                     }
                    //                     //console.log('errInCon   -- get new con 2');
                    //                     connection_pools[connection_obj.origin] = new_con
                    //                     resolve(connection_pools[connection_obj.origin]);
                    //                 })
                    //             })
                    //         }
                    //     } else {
                    //         resolve(connection_pools[connection_obj.origin]);
                    //     }

                    // })
                }

            }


        })
    }
}

closeIdleConnections = (idle_connection) => {
    let connections = Object.keys(idle_connection);
    // console.log("old********************", connections)
    setTimeout((cons, idle_con) => {
        for (let i = 0; i < connections.length; i++) {

            if (idle_con[cons[i]]) {
                // console.log("^^^^^^^^^^^^^^^^", idle_con[cons[i]].state)
                if (idle_con[cons[i]].state === 'authenticated' && connection_pool._freeConnections.indexOf(idle_con[cons[i]]) === -1) {
                    // console.log("^^^^^^^^^^^^^^^^", connection_pool._freeConnections.indexOf(idle_con[cons[i]]))
                    idle_con[cons[i]].release();
                    delete idle_connections[cons[i]];
                }
            }
        }

    }, 15000, connections, idle_connection)
}
