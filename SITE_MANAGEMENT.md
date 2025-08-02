# 🏗️ Site Management Feature

## 🎯 **Overview**

The site management feature allows you to create, manage, and organize work sites, making the daily log workflow more structured by tagging employees and their work days to specific sites.

## ✅ **Key Features**

### **1. Site Creation & Management**
- **Create Sites**: Add new work sites with name, code, location, and description
- **Edit Sites**: Modify existing site information
- **Delete Sites**: Remove sites when no longer needed
- **Site Status**: Track sites as Active, Inactive, or Completed

### **2. Structured Site Organization**
- **Unique Site Codes**: Each site has a unique identifier (e.g., WS#91, SITE-A, ILS#175)
- **Location Tracking**: Record physical location of each site
- **Description**: Add detailed descriptions for site activities
- **Status Management**: Track site lifecycle (active/inactive/completed)

### **3. Enhanced Daily Log Workflow**
- **Site Dropdown**: Select sites from a dropdown instead of free-text entry
- **Validation**: Ensures only valid sites are selected
- **Consistency**: Standardized site references across all logs
- **Organization**: Better tracking of where employees work

## 🗄️ **Database Schema**

### **Sites Table**
```sql
CREATE TABLE sites (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **Updated Relationships**
- **Employees**: Now linked to sites via `site_id` foreign key
- **Daily Logs**: Include `site_id` for better tracking
- **Monthly Summaries**: Show site information in reports

## 📱 **User Interface**

### **Sites Management Page**
- **Grid Layout**: Visual cards showing all sites
- **Search & Filter**: Find sites by name, code, location, or status
- **Site Statistics**: Show employee count, total hours, and total pay per site
- **Quick Actions**: Edit and delete sites directly from cards

### **Site Modal**
- **Form Validation**: Ensures required fields are filled
- **Code Format**: Enforces uppercase letters, numbers, #, and - only
- **Status Selection**: Active, Inactive, or Completed
- **Location & Description**: Optional detailed information

### **Daily Logs Enhancement**
- **Site Dropdown**: Replace text input with structured dropdown
- **Site Validation**: Only valid sites can be selected
- **Bulk Import**: Updated to work with site codes
- **Export Template**: Includes site code format

## 🔄 **Workflow Improvements**

### **Before (Free Text)**
```
Site Reference: "WS#91" (user types manually)
Site Reference: "Workshop Site 91" (inconsistent)
Site Reference: "Site A" (ambiguous)
```

### **After (Structured)**
```
Site: WS#91 - Workshop Site #91 (dropdown selection)
Site: SITE-A - Site A - Construction (structured)
Site: ILS#175 - ILS Project #175 (consistent)
```

## 📊 **Benefits**

### **1. Data Consistency**
- **Standardized Codes**: All sites use consistent naming
- **No Typos**: Dropdown prevents manual entry errors
- **Unique Identifiers**: Each site has a unique code

### **2. Better Organization**
- **Site Tracking**: Know exactly where employees work
- **Project Management**: Track work by specific sites
- **Reporting**: Generate reports by site

### **3. Improved Workflow**
- **Faster Entry**: Dropdown selection vs. typing
- **Validation**: Prevents invalid site references
- **Bulk Operations**: Import/export with site codes

### **4. Enhanced Reporting**
- **Site-based Reports**: Filter by specific sites
- **Employee Assignment**: Track which employees work where
- **Cost Analysis**: Analyze costs per site

## 🎯 **Usage Examples**

### **Creating a New Site**
1. Navigate to **Sites** page
2. Click **"Add Site"** button
3. Fill in:
   - **Name**: "Workshop Site #91"
   - **Code**: "WS#91"
   - **Location**: "Industrial Area, Manama"
   - **Description**: "Main workshop facility for mechanical work"
   - **Status**: "Active"
4. Click **"Create"**

### **Daily Log Entry**
1. Go to **Daily Logs** page
2. Click **"Add Daily Log"**
3. Select employee from dropdown
4. **Select site from dropdown** (instead of typing)
5. Enter hours and other details
6. Save the log

### **Bulk Import**
1. Download CSV template
2. Fill in data with site codes (e.g., "WS#91", "SITE-A")
3. Import and validate
4. System matches site codes to actual sites

## 🔧 **Technical Implementation**

### **Frontend Components**
- **Sites.js**: Main sites management page
- **SiteModal.js**: Add/edit site modal
- **Updated DailyLogs.js**: Site dropdown integration
- **Updated Layout.js**: Navigation menu

### **Database Changes**
- **New sites table**: Store site information
- **Updated employees table**: Link to sites
- **Updated daily_logs table**: Include site_id
- **Updated views**: Include site information in reports

### **API Endpoints**
- `GET /api/sites` - Get all sites
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site

## 📈 **Sample Data**

### **Site Examples**
```javascript
{
  id: 'site-1',
  name: 'Workshop Site #91',
  code: 'WS#91',
  location: 'Industrial Area, Manama',
  description: 'Main workshop facility for mechanical work',
  status: 'active'
},
{
  id: 'site-2',
  name: 'Site A - Construction',
  code: 'SITE-A',
  location: 'Seef District, Manama',
  description: 'High-rise construction project',
  status: 'active'
}
```

### **Daily Log with Site**
```javascript
{
  id: 'log-1',
  employeeId: 'emp-1',
  employeeName: 'DEEPAK KUMAR',
  date: '2025-03-01',
  siteId: 'site-1',
  siteRef: 'WS#91',
  ntHours: 8,
  rotHours: 2,
  hotHours: 0
}
```

## 🚀 **Future Enhancements**

### **Planned Features**
- **Site Analytics**: Detailed site performance metrics
- **Site Budgets**: Track budget vs. actual costs per site
- **Site Timeline**: Track site start/end dates
- **Site Photos**: Upload site images
- **Site Contacts**: Store site-specific contact information

### **Advanced Reporting**
- **Site Comparison**: Compare performance across sites
- **Site Productivity**: Analyze efficiency by site
- **Cost per Site**: Detailed cost breakdown by site
- **Employee Distribution**: See how employees are distributed across sites

---

**🎯 The site management feature provides a structured, organized approach to tracking work locations and improving the overall workflow efficiency!** 