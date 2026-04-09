module.exports = {
  apps: [
    {
      name: 'ai-prompt-hub-api',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // Logging
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Environment — Development
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      
      // Environment — Production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // Health monitoring
      exp_backoff_restart_delay: 100,
    }
  ]
};
