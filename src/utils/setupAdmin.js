// Run this in browser console to create admin user document
// Make sure you're logged in as admin first!

import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const setupAdminUser = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.error('No user logged in! Please login first.');
    return;
  }

  console.log('Setting up admin user for:', user.email);

  try {
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      isAdmin: true, // Force admin to true
      createdAt: new Date().toISOString()
    });

    console.log('✅ Admin user document created successfully!');
    console.log('Please refresh the page.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Automatically run when imported
if (typeof window !== 'undefined') {
  window.setupAdminUser = setupAdminUser;
  console.log('Run setupAdminUser() to create admin document');
}
