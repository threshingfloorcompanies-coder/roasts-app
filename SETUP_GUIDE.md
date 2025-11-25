# Coffee Shop Setup Guide

## Admin Access
**Email:** admin@coffeeshop.com
**Password:** admin123

The admin can:
- View all coffees in a table
- Add new coffees
- Edit existing coffees
- Delete coffees

---

## Database Setup: Firebase (Recommended)

Firebase is recommended because it's easier to set up, has excellent documentation, and provides real-time updates with a generous free tier.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "coffee-shop")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Set Up Firestore Database

1. In Firebase Console, click "Firestore Database" in the left menu
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location close to your users
5. Click "Enable"

### Step 3: Set Up Security Rules

In Firestore Rules tab, replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coffees/{coffee} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

### Step 4: Enable Authentication

1. Click "Authentication" in left menu
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### Step 5: Add Admin User

1. Go to Authentication > Users tab
2. Click "Add user"
3. Email: `admin@coffeeshop.com`
4. Password: `admin123`
5. Click "Add user"

### Step 6: Get Firebase Config

1. Click the gear icon > Project settings
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app name: "coffee-shop"
5. Copy the firebaseConfig object

### Step 7: Install Firebase in Your Project

```bash
cd coffee-shop
npm install firebase
```

### Step 8: Create Firebase Config File

Create `src/firebase/config.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Step 9: Update Context Files

**Update `src/context/AuthContext.jsx`:**
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'admin@coffeeshop.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        });
        setIsAdmin(firebaseUser.email === ADMIN_EMAIL);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, isAdmin: email === ADMIN_EMAIL };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAdmin,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**Update `src/context/CoffeeContext.jsx`:**
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const CoffeeContext = createContext();

export const useCoffee = () => {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useCoffee must be used within a CoffeeProvider');
  }
  return context;
};

export const CoffeeProvider = ({ children }) => {
  const [coffees, setCoffees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coffees'));
      const coffeeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoffees(coffeeList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coffees:', error);
      setLoading(false);
    }
  };

  const addCoffee = async (coffee) => {
    try {
      const docRef = await addDoc(collection(db, 'coffees'), coffee);
      const newCoffee = { id: docRef.id, ...coffee };
      setCoffees([...coffees, newCoffee]);
      return newCoffee;
    } catch (error) {
      console.error('Error adding coffee:', error);
    }
  };

  const updateCoffee = async (id, updatedCoffee) => {
    try {
      await updateDoc(doc(db, 'coffees', id), updatedCoffee);
      setCoffees(coffees.map(coffee =>
        coffee.id === id ? { ...coffee, ...updatedCoffee } : coffee
      ));
    } catch (error) {
      console.error('Error updating coffee:', error);
    }
  };

  const deleteCoffee = async (id) => {
    try {
      await deleteDoc(doc(db, 'coffees', id));
      setCoffees(coffees.filter(coffee => coffee.id !== id));
    } catch (error) {
      console.error('Error deleting coffee:', error);
    }
  };

  const value = {
    coffees,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    loading
  };

  return <CoffeeContext.Provider value={value}>{children}</CoffeeContext.Provider>;
};
```

### Step 10: Add Initial Coffee Data

1. Go to Firestore Database in Firebase Console
2. Click "Start collection"
3. Collection ID: `coffees`
4. Add documents with these fields:
   - name (string): "Espresso"
   - description (string): "Rich and bold, our classic espresso shot"
   - price (number): 3.50
   - image (string): "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
5. Repeat for other coffees

---

## Deployment: Vercel (Recommended)

Vercel is recommended because it's specifically optimized for React apps, has automatic deployments from Git, and includes a generous free tier.

### Step 1: Prepare for Deployment

1. Make sure your code is in a Git repository
2. Push your code to GitHub:
```bash
cd coffee-shop
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/coffee-shop.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Vite
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### Step 3: Add Environment Variables (if using Firebase)

1. In Vercel project dashboard, go to Settings > Environment Variables
2. Add your Firebase config as environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - etc.

3. Update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

4. Redeploy the project

### Step 4: Set Up Custom Domain (Optional)

1. In Vercel project dashboard, go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

---

## Alternative: Supabase (If You Prefer)

Supabase is a great alternative if you prefer PostgreSQL over Firestore's NoSQL structure.

### Quick Supabase Setup

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Table Editor and create a `coffees` table:
   - id (int8, primary key, auto-increment)
   - name (text)
   - description (text)
   - price (numeric)
   - image (text)
   - created_at (timestamp with timezone)

4. Install Supabase:
```bash
npm install @supabase/supabase-js
```

5. Get your API keys from Settings > API
6. Create `src/supabase/config.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## Alternative: Netlify (If You Prefer)

Netlify is similar to Vercel and works great too.

### Quick Netlify Setup

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up with GitHub
3. Click "Add new site" > "Import an existing project"
4. Connect to your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

---

## Cost Comparison

### Firebase Free Tier:
- 10GB storage
- 50,000 reads/day
- 20,000 writes/day
- Perfect for small to medium sites

### Vercel Free Tier:
- Unlimited personal projects
- 100GB bandwidth/month
- Automatic HTTPS
- Perfect for most personal projects

### Supabase Free Tier:
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- Great for small apps

---

## Next Steps

1. Set up Firebase/Supabase following the guide above
2. Deploy to Vercel/Netlify
3. Share the admin credentials with your non-technical admin
4. The admin can manage coffees through the simple web interface

The admin interface is designed to be simple - they just need to:
1. Go to the website
2. Click "Login"
3. Use the admin credentials
4. Click "Admin" in the navigation
5. Add, edit, or delete coffees using the buttons

No technical knowledge required!
