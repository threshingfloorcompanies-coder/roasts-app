# Coffee Shop Website

A responsive coffee shop website built with React that works on both mobile and desktop. Features a public-facing coffee menu and an admin panel for managing coffees.

## Features

- **Public Coffee Menu**: Browse coffees with images, descriptions, and prices
- **User Authentication**: Login and signup functionality
- **Admin Panel**: Manage coffees (add, edit, delete) with a simple interface
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Real-time Updates**: Changes made by admin are immediately visible

## Admin Credentials

**Email:** admin@coffeeshop.com
**Password:** admin123

## Local Development

### Prerequisites
- Node.js (v20.19+ or v22.12+ recommended, currently works with v20.13.1)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory:
```bash
cd coffee-shop
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
coffee-shop/
├── src/
│   ├── components/         # React components
│   │   ├── AdminDashboard.jsx
│   │   ├── CoffeeCard.jsx
│   │   ├── CoffeeForm.jsx
│   │   ├── CoffeeList.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Signup.jsx
│   ├── context/           # React Context for state management
│   │   ├── AuthContext.jsx
│   │   └── CoffeeContext.jsx
│   ├── App.jsx            # Main app component
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── SETUP_GUIDE.md         # Detailed setup instructions
├── package.json
└── README.md
```

## How It Works

### For Regular Users
1. Visit the homepage to see all available coffees
2. Optionally sign up/login to create an account
3. Browse coffee options with prices and descriptions

### For Admin
1. Login with admin credentials
2. Click "Admin" in the navigation bar
3. View all coffees in a table format
4. Click "Add New Coffee" to add a coffee
5. Click "Edit" to modify existing coffees
6. Click "Delete" to remove coffees
7. All changes are immediately reflected on the public menu

## Production Deployment

Currently, the app uses in-memory state (data resets on refresh). To make it production-ready:

1. **Set up a database** (Firebase or Supabase recommended)
2. **Deploy to hosting** (Vercel or Netlify recommended)

See `SETUP_GUIDE.md` for detailed instructions on:
- Setting up Firebase/Supabase
- Deploying to Vercel/Netlify
- Configuring authentication
- Managing environment variables

## Technologies Used

- **React** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Context API** - State management
- **CSS3** - Styling with responsive design

## Future Enhancements

When you're ready to add more features:
- Shopping cart functionality
- Order processing
- Payment integration (Stripe)
- Email notifications
- Customer order history
- Admin analytics dashboard
- Product categories and filtering
- Customer reviews

## License

MIT
