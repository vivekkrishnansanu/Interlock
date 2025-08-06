// Script to add Vivek as a real user using the backend API
// This script uses the secure backend endpoints we created

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://interlock-bahrain.vercel.app/api';

async function addVivekUser() {
  try {
    console.log('🔧 Adding Vivek as a real user...');
    
    // You'll need to get an admin token first
    // This would typically be done by logging in as an admin user
    const adminToken = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual admin token
    
    const userData = {
      name: 'Vivek',
      email: 'vivekkrishnansanu@gmail.com',
      role: 'admin',
      password: 'VivekSecure123!' // Choose a secure password
    };
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ User created successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addVivekUser };
}

// Instructions for manual execution:
console.log(`
🔧 To add Vivek as a real user:

OPTION 1 - Via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Fill in:
   - Email: vivekkrishnansanu@gmail.com
   - Password: (choose secure password)
   - Email Confirm: Yes
5. Copy the generated User ID
6. Run the SQL script: database/add-vivek-user.sql
7. Update the profile with the correct user ID

OPTION 2 - Via Backend API (Recommended):
1. Login as an admin user to get a token
2. Use the token to call POST /api/users with Vivek's details
3. The backend will create both auth user and profile automatically

OPTION 3 - Via SQL + Manual Auth:
1. Run: database/add-vivek-user.sql in your database
2. Manually create auth user in Supabase dashboard
3. Update profile table with correct user ID
`);