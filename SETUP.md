# SelfMemo3 - Production Setup Guide

This guide explains how to deploy SelfMemo3 on a Linux server using the automated [setup/setup.py](setup/setup.py) installation script.

## Overview

The setup script provides a comprehensive installation solution that can deploy:
- **SelfMemo3 Application** - The Next.js web application as a systemd service
- **Trigger Service** - Automated reminder checker that runs as a systemd service (replaces external cron services)
- **PostgreSQL Database** - Local database setup and configuration

## Prerequisites

- Linux server (Ubuntu, Debian, or similar distribution)
- Root/sudo access
- Python 3 installed

## Pre-Installation Steps

### 1. Prepare the Application

Clone the repository and configure your environment:

```bash
# Clone the repository
git clone <repository-url>
cd SelfMemo3

# Create your .env file from the example
# and edit it with your settings
cp .env.example .env
```

Configure all required variables (see [README.md](README.md) for details)

### 2. Configure Setup Parameters

Edit [setup/config.json](setup/config.json) to customize your installation:

Key configuration options:

```json
{
  "url": "http://localhost",           // Application URL
  "port": 3000,                         // Application port
  "endpoint": "/api/reminders/trigger", // Trigger endpoint
  "interval_seconds": 60,               // Trigger check interval
  "database": {
    "name": "selfmemo",                 // PostgreSQL database name
    "username": "selfmemo_user",        // PostgreSQL username
    "password": "your_secure_password", // PostgreSQL password
    "port": 5432                        // PostgreSQL port
  }
}
```

## Running the Setup Script

### 1. Execute the Setup

Run the setup script with root privileges:

```bash
cd setup
sudo python3 setup.py
```

### 2. Choose Installation Components

The script will prompt you to select what to install:

```
1) SelfMemo3 Application only
2) Trigger Service only
3) PostgreSQL Database setup only
4) Everything (Application + Trigger + Database)
```

**Option 4 (Everything)** is recommended for a fresh server installation.

### 3. Post-Installation

After successful installation:

1. **Update DATABASE_URL** (if you installed the database):
   Update the `DATABASE_URL` with the connection string shown by the setup script.

2. **Sync the database schema**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed the admin account**:
   ```bash
   curl http://localhost:3000/api/seed
   ```

4. **Enable and start services** (if not done during setup):
   ```bash
   sudo systemctl enable selfmemo.service
   sudo systemctl start selfmemo.service
   sudo systemctl enable trigger_service.service
   sudo systemctl start trigger_service.service
   ```

## Managing the Services

### Check Service Status

```bash
# Application status
sudo systemctl status selfmemo.service

# Trigger service status
sudo systemctl status trigger_service.service
```

### View Logs

```bash
# Application logs
sudo journalctl -u selfmemo.service -f

# Trigger service logs
sudo journalctl -u trigger_service.service -f
```

### Disable Services

```bash
sudo systemctl disable selfmemo.service
sudo systemctl disable trigger_service.service
```

## Uninstallation

To remove the installation:

1. Stop and disable services:
   ```bash
   sudo systemctl stop selfmemo.service trigger_service.service
   sudo systemctl disable selfmemo.service trigger_service.service
   ```

2. Remove service files:
   ```bash
   sudo rm /etc/systemd/system/selfmemo.service
   sudo rm /etc/systemd/system/trigger_service.service
   sudo systemctl daemon-reload
   ```

3. Remove application files:

4. Remove the system user:
   ```bash
   sudo userdel -r selfmemo
   ```

5. (Optional) Remove PostgreSQL database:
   ```bash
   sudo -u postgres psql -c "DROP DATABASE selfmemo;"
   sudo -u postgres psql -c "DROP USER selfmemo_user;"
   ```
### Permission Issues

Ensure the selfmemo user has proper permissions:
```bash
sudo chown -R selfmemo:selfmemo /path/to/selfmemo
```

### System User

The application runs as a dedicated `selfmemo` user with limited privileges for security.

## Additional Resources

- [Main README](README.md) - Application overview and local development
- [VERCEL.md](DEPLOYMENT_VERCEL.md) - Vercel deployment guide
- [Prisma Documentation](https://www.prisma.io/docs) - Database and ORM information
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
