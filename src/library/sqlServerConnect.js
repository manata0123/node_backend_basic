const { ConnectionPool } = require('mssql')

const pools = {}

// manage a set of pools by name (config will be required to create the pool)
// a pool will be removed when it is closed
async function getPool(name, config) {
    if (!Object.prototype.hasOwnProperty.call(pools, name)) {
        const pool = new ConnectionPool(config)
        const close = pool.close.bind(pool)
        pool.close = (...args) => {
            delete pools[name]
            return close(...args)
        }
        await pool.connect()
        pools[name] = pool
    }
    return pools[name]
}

function closePool(name) {
    if (Object.prototype.hasOwnProperty.call(pools, name)) {
        const pool = pools[name];
        // console.log(pools)
        delete pools[name];
        return pool.close()
    }
}

// close all pools
function closeAll() {
    return Promise.all(Object.values(pools).map((pool) => {
        return pool.close()
    }))
}

module.exports = {
    closeAll,
    closePool,
    getPool
}