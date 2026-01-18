# SelfMemo 3.0

This repository contains the work for VU Information and Web-Architecture 25/26.

SelfMemo 3.0 is an E-Mail reminder service where you can create reminders for different events (daily, weekly, monthly, yearly, ...).

![SelfMemo 3.0 Screenshot](app-screenshot.png "SelfMemo 3.0 Screenshot")

It is the enhancement of the previous project: https://github.com/selfmemo2/SelfMemo2

## Getting Started

### Quick Start with run_local.py (Recommended for Local Development)

The easiest way to run SelfMemo3 locally is using the automated [setup/run_local.py](setup/run_local.py) script:

```bash
# Clone the repository
git clone <repository-url>
cd SelfMemo3

# Create your .env file from the example
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section below)

# Install dependencies
npm install

# Run Prisma migrations for Postgre database
npx prisma migrate dev
# or for local JSON file storage:
npx prisma generate

# Start the application with trigger service
python3 setup/run_local.py
```

The `run_local.py` script will:
- Check prerequisites (Node.js, npm, Python dependencies)
- Build the Next.js application
- Start the application server
- Start the trigger service (replaces cron-job.org for local development)
- Automatically seed the database with the admin account

### Manual Local Setup

#### Prerequisites
- Node.js and npm installed
- PostgreSQL database (or leave DATABASE_URL empty for JSON file storage)
- SMTP account for sending emails

#### Environment Variables

Copy the [.env.example](.env.example) file to create your own `.env` file:

```bash
cp .env.example .env
```

Then configure the following variables:

**Database:**
- `DATABASE_URL`: PostgreSQL connection string (leave empty for local JSON file storage)
  - Example: `postgresql://user:password@localhost:5432/selfmemo`
  - See [Prisma PostgreSQL docs](https://www.prisma.io/docs/orm/overview/databases/postgresql#connection-url)

**Authentication:**
- `AUTH_URL`: The URL where your application runs (e.g., `http://localhost:3000`)
- `AUTH_TRUST_HOST`: Whether to trust the host header (e.g., `true` or `false`)
- `AUTH_SECRET`: Generate a secret at [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

**SMTP Configuration** (for sending reminder emails):
- `SMTP_USER`: Your SMTP username
- `SMTP_PASS`: Your SMTP password
- `SMTP_PORT`: SMTP port (default: 465 for secure connections)
- `SMTP_MAIL`: Email address to send from
- `SMTP_HOST`: SMTP server hostname

**Admin Account:**
- `ADMIN_EMAIL`: Email for the initial admin account
- `ADMIN_PASSWORD`: Password for the admin account

#### Installation Steps

1. **Install npm dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```
   This creates the database schema based on [prisma/schema.prisma](prisma/schema.prisma)

   Note: If you are using local JSON file storage, use:
   ```bash
   npx prisma generate
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Seed the database:**
   
   Once the application is running, create the admin account by calling:
   ```bash
   curl http://localhost:3000/api/seed
   ```
   You should see "Admin user created"

5. **Set up periodic reminder checks:**
   
   For local development, you can either:
   - Use `python3 setup/run_local.py` (recommended - includes automatic trigger service)
   - Manually trigger reminders: `curl http://localhost:3000/api/reminders/trigger`
   - Set up a local cron job to call the trigger endpoint every minute

Your application should now be running on [http://localhost:3000](http://localhost:3000) and you can login with your admin credentials.

### Deployment

For deployment on Linux servers, see [SETUP.md](SETUP.md) for using the automated setup script.



## License
The MIT License (MIT)

Copyright (c) 2026 Celine Florian, Stephan Robinig, Piotr Siewiera, Nina Tschikof

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.