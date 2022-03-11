module.exports = {
  apps: [{
    name: 'BACKEND-CAMPAIGN',
    script: "./src/server.js",
    instances: "MAX",
    exec_mode: "cluster",
    // watch: true,
    // ------------------------------------ watch options - begin
    watch: ['./'],
    watch_delay: 1000,
    ignore_watch: ['node_modules', 'scratch', '.git', '.gitignore'],
    watch_options: {
      persistent    : true,
      ignoreInitial : true,
    },
    // ------------------------------------ watch options - end
    env_dev: {
      NODE_ENV: 'development'
    },
    env_staging: {
      NODE_ENV: 'staging'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};
