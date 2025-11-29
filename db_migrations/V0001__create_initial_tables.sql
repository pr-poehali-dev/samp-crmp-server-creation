-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create servers table
CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    template VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline',
    ip VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL,
    ftp_host VARCHAR(255) NOT NULL,
    ftp_port INTEGER DEFAULT 21,
    ftp_username VARCHAR(255) NOT NULL,
    ftp_password VARCHAR(255) NOT NULL,
    max_players INTEGER DEFAULT 50,
    cpu_usage DECIMAL(5, 2) DEFAULT 0.00,
    ram_usage DECIMAL(5, 2) DEFAULT 0.00,
    current_players INTEGER DEFAULT 0,
    auto_restart BOOLEAN DEFAULT true,
    backup_enabled BOOLEAN DEFAULT true,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);