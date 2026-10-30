# User, Installation & Deployment Manual
## Smart Campus Management System

---

## 1. Prerequisites & Environment Requirements

- **Node.js:** v18.0.0 or higher (v20+ LTS recommended)
- **NPM:** v9.0.0 or higher
- **Database:** MySQL Server 8.0+ (InnoDB engine enabled)

---

## 2. Step-by-Step Installation

### Step 1: Clone or Open Workspace
Ensure your shell is positioned in the project root:
```bash
cd smart-campus-management-system
```

### Step 2: Install Workspace Dependencies
Install dependencies for root, server, and client:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
cp .env.example server/.env
```

Review and adjust variables:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Session Security
SESSION_SECRET=super-secret-smart-campus-session-key-change-in-production-2026
SESSION_MAX_AGE_MS=86400000

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=campus_app
DB_PASSWORD=SecureCampusPass!2026
DB_NAME=smart_campus_db
DB_CONNECTION_LIMIT=10

# Test Database
DB_NAME_TEST=smart_campus_test
DB_USER_TEST=campus_app
DB_PASSWORD_TEST=SecureCampusPass!2026
DB_HOST_TEST=localhost
DB_PORT_TEST=3306
```

---

## 3. Least-Privilege MySQL User Setup

To follow security best practices, avoid using the MySQL `root` superuser in application configurations. Execute the following SQL script as MySQL administrator:

```sql
-- 1. Create dedicated application user
CREATE USER IF NOT EXISTS 'campus_app'@'localhost' IDENTIFIED BY 'SecureCampusPass!2026';

-- 2. Create production and test databases
CREATE DATABASE IF NOT EXISTS `smart_campus_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `smart_campus_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Grant least-privilege DML and DDL permissions
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, REFERENCES, INDEX, ALTER, CREATE VIEW, SHOW VIEW 
ON `smart_campus_db`.* TO 'campus_app'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, REFERENCES, INDEX, ALTER, CREATE VIEW, SHOW VIEW 
ON `smart_campus_test`.* TO 'campus_app'@'localhost';

FLUSH PRIVILEGES;
```

---

## 4. Automated Database Initialization & Seeding

Run the automated Node.js initialization script:
```bash
npm run db:init
```
This script executes:
1. `database/schema.sql` (Creates 11 tables with constraints and indexes)
2. `database/views.sql` (Builds aggregation views)
3. `database/seed.sql` (Inserts initial departments, users, courses, attendance, and exam marks)
4. Dynamically computes fresh bcrypt password hashes for `Campus@123`.

To re-seed only without dropping tables:
```bash
npm run db:seed
```

---

## 5. Running the Application

### Development Mode (Concurrent Server & Client)
```bash
npm run dev
```
- **Backend API:** `http://localhost:5000/api`
- **Frontend SPA:** `http://localhost:5173`
- **Health Check:** `http://localhost:5000/api/health`

### Seeded Demonstration Accounts (Password: `Campus@123`)
| Role | Email | Features Available |
| :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | Full CRUD, curricula, enrollment, reports & CSV exports, audit trail |
| **Faculty Member** | `faculty1@campus.edu` | Assigned course rosters, bulk daily attendance, examination grading |
| **Faculty Member** | `faculty2@campus.edu` | ECE course rosters, attendance & marks |
| **Student** | `student1@campus.edu` | Personal academic dossier, attendance %, GPA, results |

---

## 6. Running Automated Tests

Run the full automated test suite (38 tests covering unit calculations and all 22 required scenarios):
```bash
npm test
```

---

## 7. Database Backup & Disaster Recovery (`mysqldump`)

### Creating a Complete Database Backup
```bash
mysqldump -u campus_app -p --routines --triggers --single-transaction smart_campus_db > smart_campus_backup.sql
```

### Restoring from Backup
```bash
mysql -u campus_app -p smart_campus_db < smart_campus_backup.sql
```

---

## 8. Production Deployment Guide (NGINX & PM2)

1. **Build Frontend Bundle:**
   ```bash
   npm run build
   ```
   Generates optimized assets in `client/dist/`.

2. **Serve Backend with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server/src/server.js --name "smart-campus-api" -i max
   pm2 save
   ```

3. **Sample NGINX Reverse Proxy Configuration:**
   ```nginx
   server {
       listen 80;
       server_name campus.university.edu;

       # Serve React static frontend
       location / {
           root /var/www/smart-campus/client/dist;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to Node.js backend
       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

