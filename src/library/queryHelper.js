const async = require("async");
const sql = require('mssql')
mode = process.env.NODE_ENV || 'dev';
const config = require('config').get(mode);
//load sql
const { getPool,closePool,closeAll } = require('./sqlServerConnect')

const selectLastId = ";select @@IDENTITY AS \'id\';"

//create random pool name
function randomPoolName() {
    return Math.random().toString(36).substr(2, 10)
}

// run query
async function runQuery(db_config_name,query,sqlParams) {
    // const pool_name = randomPoolName()
    //ใช้ชื่อ pool เดียวกับ ชื่อ db config
    const pool_name = db_config_name
    const pool = await getPool(pool_name, config.database[db_config_name])
    const req = pool.request();
    // if(sqlParams) {
    //     sqlParams.forEach(function (param) {
    //         req.input(param.name, param.type, param.value);
    //     });
    // }



    //เอา Query parameter มาทำป้องกัน SQL Injection
    if (sqlParams) {
        const promises = sqlParams.map(async (param) => {
                let data_value = null
                //ถ้ามีสร้าง value จาก Function อื่น
                if (param.value?.hasOwnProperty('fnCall')) {
                    data_value = await module.exports[param.value.fnCall.fnName](param.value.fnCall.fnParams)
                } else {
                    data_value = param.value
                }
                req.input(param.name, param.type, data_value)
            }
        )
        await Promise.all(promises)
    }
    return await req.query(query)


    // const result = await req.query(query)
    //ปิด connection
    // closeAll()
    // closePool(pool_name)
    // return result
}

// run หลาย query ตามลำดับ (ส่วนใหญ่ใช้กับ insert) ถ้าอันใดไม่ผ่าน จะ rollback ทั้งหมด
function runTransactionQuery(db_config_name,queries) {
    const pool_name = db_config_name
    return new Promise(async (resolve, reject) => {
        const pool = await getPool(pool_name, config.database[db_config_name])
        // const pool = new sql.ConnectionPool(config.database[db_config_name])
        return pool.connect().then((p) => {
            const transaction = new sql.Transaction(p);
            return transaction.begin((err) => {
                const request = new sql.Request(transaction);
                if (err) {
                    reject(err);
                }
                return async.eachSeries(queries, async (query, callback) => {

                    if (query?.hasOwnProperty('chainValueArray')) {
                        let mapping_values = query.chainValueArray.mapping_value

                        let all_params = []
                        const mappingValue_promises = mapping_values.map(async (mapping_val,idx) => {
                            let each_params = []
                            const chainValue_promises = query.sqlParams.map(async (param,index) => {
                                let data_value = null
                                if(param.name==query.chainValueArray.mapping_input) {
                                    data_value = mapping_values[idx]
                                }else{
                                    if (param.value&&param.value?.hasOwnProperty('fnCall')) {
                                        data_value = await module.exports[param.value.fnCall.fnName](param.value.fnCall.fnParams)
                                    } else {
                                        data_value = param.value ? param.value:null
                                    }
                                }

                                const dynamic_input_name = param.name+`_idx_${idx}`
                                each_params[index] = {}
                                each_params[index].name = dynamic_input_name
                                each_params[index].value = data_value
                                each_params[index].type =  param.type

                            })

                            await Promise.all(chainValue_promises)

                            const extract_params = each_params.map((ei,i) => {
                                request.input(ei.name, ei.type,ei.value);
                                return '@'+ei.name
                            }).join(',')

                            // console.log(extract_params)

                            all_params.push('('+extract_params+')')

                        })

                        await Promise.all(mappingValue_promises)

                        Object.keys(all_params).map((o) => {
                            return o
                        }).join(',')

                        const qq = query.query+' '+all_params;
                        // console.log(qq)
                        // console.log(all_params)

                        return request.query(qq)
                    }else {
                        //ใส่ params
                        if (query.sqlParams) {

                            const promises = query.sqlParams.map(async (param) => {
                                    let data_value = null
                                    //ถ้ามีสร้าง value จาก Function อื่น
                                    if (param.value?.hasOwnProperty('fnCall')) {
                                        data_value = await module.exports[param.value.fnCall.fnName](param.value.fnCall.fnParams)
                                    } else {
                                        data_value = param.value
                                    }

                                    request.input(param.name, param.type, data_value)
                                }
                            )

                            await Promise.all(promises)

                            return request.query(query.query)
                        } else {
                            return request.query(query.query)
                        }
                    }
                }, async (err2) => {
                    if ( err2 ) {
                        await transaction.rollback(() => {
                            pool.close();
                            reject(err2);
                        });
                    } else {
                        await transaction.commit(() => {
                            pool.close();
                            resolve(true);
                        });
                    }
                });
            });
        });
    });
}

// run store
async function runStoredProcedure(db_config_name,res, proc, sqlParams) {
    const pool_name = db_config_name
    const pool = await getPool(pool_name, config.database[db_config_name])
    return pool.then((pool2) => {
        const req = pool2.request();
        sqlParams.forEach(function(param) {
            req.input(param.name, param.type, param.value);
        });
        req.execute(proc, (err, recordset) => {
            res.json(recordset[0]);
        });
    });
}

//gen runno
async function genRunno(fnParams)
{
    const db_config_name = fnParams.db_name
    const table = fnParams.table
    const col = fnParams.col
    const right_digit = fnParams.right_digit

    const current_date = new Date()
    const ym = current_date.getFullYear()+('0' + (current_date.getMonth()+1)).slice(-2)
    const sql_query	=	"select max(right("+col+","+right_digit+")) as "+col+" from "+ table +" (nolock) where "+col+" like '"+ym+"%' ";
    let result_runno = ym+(("1").padStart(right_digit, "0"))

    try {
        const result = await runQuery(
            db_config_name,
            sql_query
        )
        if(result.recordset[0][col]!=null) {
            result_runno = ym+(parseInt(result.recordset[0][col])+1).toString().padStart(right_digit, "0")
        }
    } catch (error) {
        result_runno = false
    }

    return result_runno
}


//get last insert Record
async function selectLastRunno(fnParams)
{
    const db_config_name = fnParams.db_name
    const table = fnParams.table
    const col = fnParams.col

    const sql_query	=	"SELECT TOP 1 "+col+" FROM "+table+" (nolock) ORDER BY "+col+" DESC";
    let result_runno = false
    try {
        const result = await runQuery(
            db_config_name,
            sql_query
        )
        if(result.recordset[0][col]!=null) {
            result_runno = result.recordset[0][col]
        }
    } catch (error) {
        result_runno = false
    }

    return result_runno
}

//create pool transaction from dbconfig
async function poolTransaction(db_config_name) {
    const pool_name = db_config_name
    const pool = await getPool(pool_name, config.database[db_config_name]);
    const poolTransaction = pool.transaction();

    return poolTransaction;
}
// run query transaction
async function runQueryWithTransaction(transaction,query,sqlParams) {
    const req = transaction.request(); //transaction request

    //เอา Query parameter มาทำป้องกัน SQL Injection
    if (sqlParams) {
        const promises = sqlParams.map(async (param) => {
                let data_value = null
                //ถ้ามีสร้าง value จาก Function อื่น
                if (param.value?.hasOwnProperty('fnCall')) {
                    data_value = await module.exports[param.value.fnCall.fnName](param.value.fnCall.fnParams)
                } else {
                    data_value = param.value
                }
                req.input(param.name, param.type, data_value)
            }
        )
        await Promise.all(promises)
    }
    return await req.query(query)


    // const result = await req.query(query)
    //ปิด connection
    // closeAll()
    // closePool(pool_name)
    // return result
}


//find
async function findBy(fnParams)
{
    const db_config_name = fnParams.db_name
    const table = fnParams.table
    let cols = ' * '
    let where = ''
    let whereAnd = ''
    let whereOr = ''
    let checkedValue = ''
    let checkedOperator = ''
    let finalParams = []
    let limitResult = ''
    let orders = ''

    if(fnParams.select && fnParams.select.length) {
        cols = fnParams.select.map((m) => {return m}).join(', ')
    }

    if(fnParams.order_by && fnParams.order_by.length) {
        orders += "\nORDER BY "
        orders += fnParams.order_by.map((m) => {
            return `${m[0]} ${m[1]}`
        }).join(', ')
    }

    if((fnParams.whereAnd && fnParams.whereAnd.length) || (fnParams.whereOr && fnParams.whereOr.length) ) {
        where += "\nWHERE "
        if(fnParams.whereAnd && fnParams.whereAnd.length) {
            whereAnd += "("
            whereAnd += fnParams.whereAnd.map((m) => {
                checkedValue = `@${m.name}`
                checkedOperator = m.operator
                if(m.operator === '%like') {
                    checkedValue = `'%'+@${m.name}`
                    checkedOperator = `LIKE`
                } else if (m.operator === 'like%') {
                    checkedValue = `@${m.name}+'%'`
                    checkedOperator = `LIKE`
                } else if (m.operator === 'like') {
                    checkedValue = `'%'+@${m.name}+'%'`
                    checkedOperator = `LIKE`
                }
                return `${m.field} ${checkedOperator} ${checkedValue}`
            }).join(' AND ')
            whereAnd += ")"
            finalParams = [...finalParams.concat(fnParams.whereAnd)]
        }
        if(fnParams.whereOr && fnParams.whereOr.length) {
            whereOr += "("
            whereOr += fnParams.whereOr.map((m) => {
                checkedValue = `@${m.name}`
                checkedOperator = m.operator
                if(m.operator === '%like') {
                    checkedValue = `'%'+@${m.name}`
                    checkedOperator = `LIKE`
                } else if (m.operator === 'like%') {
                    checkedValue = `@${m.name}+'%'`
                    checkedOperator = `LIKE`
                } else if (m.operator === 'like') {
                    checkedValue = `'%'+@${m.name}+'%'`
                    checkedOperator = `LIKE`
                }
                return `${m.field} ${checkedOperator} ${checkedValue}`
            }).join(' OR ')
            whereOr += ")"
            finalParams = [...finalParams.concat(fnParams.whereOr)]
        }

        where += whereAnd + (whereAnd&&whereOr ? ` AND `:``) + whereOr
    }

    if((fnParams.rowResult && fnParams.rowResult.length) && fnParams.rowResult === 'row') {
        limitResult = `TOP 1 `
    }
    
    const sql_query = `SELECT ${limitResult} ${cols} \nFROM ${table} (nolock) ${where} ${orders}`

    let finalResult = false
    try {
        const result = await runQuery(
            db_config_name,
            sql_query,
            finalParams
        )
        if((fnParams.rowResult && fnParams.rowResult.length) && fnParams.rowResult === 'row') {
            if(result.recordset[0]!=null) {
                finalResult = result.recordset[0]
            }
        } else {
            if(result.recordset!=null) {
                finalResult = result.recordset
            }
        }
    } catch (error) {
        // console.log(error)
        finalResult = false
    }

    // console.log(sql_query)
    // console.log(finalResult)

    return finalResult
}

module.exports = {
    runQuery,
    runTransactionQuery,
    runStoredProcedure,
    genRunno,
    selectLastRunno,
    selectLastId,
    poolTransaction,
    runQueryWithTransaction,
    findBy,
}
