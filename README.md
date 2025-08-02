# Interlock Wage Tracker

A full-stack web application for monthly manpower wage tracking and calculation, designed to replace Excel-based systems with an intuitive web interface.

## 🚀 Features

### Core Functionality
- **Employee Management**: Add, edit, and manage employee records with wage rates
- **Daily Log Entry**: Record work hours (Normal Time, Regular OT, Holiday OT) for each employee
- **Automatic Calculations**: Monthly wage calculations based on Excel logic
- **Role-Based Access**: Admin, Editor, and Viewer roles with appropriate permissions
- **Reports & Export**: Generate monthly summaries and export to CSV

### Wage Calculation Logic
1. **Normal Pay** = N.T Hours × N.T Rate
2. **Regular OT Pay** = R.O.T Hours × R.O.T Rate  
3. **Holiday OT Pay** = H.O.T Hours × H.O.T Rate
4. **Total Pay** = Normal Pay + R.O.T Pay + H.O.T Pay
5. **Final Pay** = Total Pay + Allowance
6. **Rounded Pay** = Round Final Pay to 1 decimal place

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and authorization
- **JWT** - Token-based authentication

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Lucide React** - Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd interlock-wage-tracker
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and API keys
3. Run the database schema:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script

### 3. Environment Configuration

1. Copy the environment example file:
```bash
cp env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

### 4. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 5. Start the Application

```bash
# Start backend server (from root directory)
npm run dev

# Start frontend (in a new terminal, from root directory)
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- Can create/edit/delete employees and daily logs
- Can manage user accounts and roles
- Can view all reports and export data

### Editor
- Can create/edit/delete employees and daily logs
- Can view reports and export data
- Cannot manage user accounts

### Viewer
- Read-only access to all data
- Can view reports and export data
- Cannot modify any data

## 📊 Database Schema

### Employees Table
```sql
- id (UUID, Primary Key)
- name (Text, Required)
- cpr (Text, Unique, Required)
- designation (Text, Required)
- site (Text, Required)
- category (Text, Default: 'General')
- nt_rate (Decimal, Required)
- rot_rate (Decimal, Required)
- hot_rate (Decimal, Required)
- allowance (Decimal, Default: 0)
- notes (Text, Optional)
- created_by (UUID, Foreign Key)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Daily Logs Table
```sql
- id (UUID, Primary Key)
- employee_id (UUID, Foreign Key, Required)
- date (Date, Required)
- is_holiday (Boolean, Default: false)
- is_friday (Boolean, Default: false)
- nt_hours (Decimal, Default: 0)
- rot_hours (Decimal, Default: 0)
- hot_hours (Decimal, Default: 0)
- created_by (UUID, Foreign Key)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (Admin only)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Employees
- `GET /api/employees` - Get all employees (with filters)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/:id/wage-history` - Get employee wage history

### Daily Logs
- `GET /api/daily-logs` - Get daily logs (with filters)
- `GET /api/daily-logs/:id` - Get daily log by ID
- `POST /api/daily-logs` - Create new daily log
- `PUT /api/daily-logs/:id` - Update daily log
- `DELETE /api/daily-logs/:id` - Delete daily log
- `POST /api/daily-logs/bulk` - Bulk create daily logs

### Monthly Summaries
- `GET /api/monthly-summaries/generate` - Generate monthly summary
- `GET /api/monthly-summaries/employee/:id` - Get employee monthly summary
- `GET /api/monthly-summaries/employee/:id/history` - Get employee history
- `GET /api/monthly-summaries/export/csv` - Export to CSV
- `GET /api/monthly-summaries/stats` - Get summary statistics

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd client && npm run build`
2. Deploy the `build` folder to your preferred hosting service
3. Update the API base URL in production

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Fine-grained permissions
- **Input Validation** - Server-side data validation
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin request security

## 📈 Future Enhancements

- [ ] Leave/Absence logging
- [ ] Site productivity analytics
- [ ] Bulk import via CSV
- [ ] Payroll integration
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Advanced reporting dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Built with ❤️ for Interlock Team** 