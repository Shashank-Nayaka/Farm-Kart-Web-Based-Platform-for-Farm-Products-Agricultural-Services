# FarmKart – MongoDB Login / Signup / Logout Setup

This version adds a real authentication flow to the existing FarmKart Next.js project:

- `/login` contains **Login** and **Create account** forms.
- New accounts are stored in MongoDB Atlas.
- Passwords are stored as bcrypt hashes, not plain text.
- A random session token is stored in an HTTP-only cookie.
- Sessions are stored in MongoDB in the `sessions` collection.
- The navbar shows **Login** when logged out and **Logout** when logged in.
- `/profile` and `/orders` require a logged-in user.

## 1. Install Node.js

Install Node.js LTS if it is not already installed.

Check in Command Prompt:

```bat
node -v
npm -v
```

Open the project folder in VS Code and open the terminal there.

## 2. Create your MongoDB Atlas account

Open MongoDB Atlas and create/sign in to your account.

Create a project called `FarmKart`.

In the project, create a **Free (M0)** cluster. MongoDB's current Atlas instructions say Free clusters are intended for development/small projects and do not expire. Atlas also requires a database user and an IP access-list entry before your application can connect.

## 3. Create the MongoDB database user

In Atlas:

1. Open your FarmKart project.
2. Open the cluster.
3. Click **Connect** if Atlas is showing the connection setup.
4. Create a MongoDB database user.
5. Username example: `farmkart_admin`
6. Password example: create a strong password and save it safely.

Important: this is the **MongoDB database user**, not necessarily the same thing as your Atlas website login.

## 4. Add your IP address

In Atlas:

1. Open **Network Access**.
2. Add your current IP address.
3. Save the entry.

For local development, adding your current IP is preferable to opening access to everyone.

## 5. Copy the MongoDB connection string

In your cluster:

1. Click **Connect**.
2. Select **Drivers**.
3. Select Node.js.
4. Copy the connection string.

It looks similar to:

```text
mongodb+srv://farmkart_admin:<PASSWORD>@your-cluster.mongodb.net/?retryWrites=true&w=majority
```

Replace `<PASSWORD>` with the database user's password. If the password contains special characters, encode them correctly for a MongoDB connection string.

## 6. Create `.env.local`

In the root of the FarmKart project, create:

```text
.env.local
```

Put this inside:

```env
MONGODB_URI=mongodb+srv://farmkart_admin:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=farmkart
```

Do not upload `.env.local` to GitHub. This project already ignores `.env*.local`.

## 7. Install the new packages

From the FarmKart project folder:

### npm

```bat
npm install
```

### pnpm

```bat
pnpm install
```

The project now uses:

- `mongodb` – connection to MongoDB Atlas
- `bcryptjs` – password hashing

## 8. Start FarmKart

Run:

```bat
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 9. Test the complete login flow

Open:

```text
http://localhost:3000/login
```

### First-time user

Click **Create account** and enter:

- Full name
- Email
- Phone (optional)
- Password
- Confirm password

Click **Create account**.

The server will:

1. Validate the data.
2. Check whether the email already exists.
3. Hash the password.
4. Save the user in MongoDB.
5. Create a session in MongoDB.
6. Set a secure HTTP-only session cookie.
7. Log the user into FarmKart.

### Existing user

Enter the email and password and click **Login**.

### Logout

After login, the navbar shows **Logout**.

Click it. The current session is removed from MongoDB and the browser cookie is cleared.

## 10. Verify the data in MongoDB Atlas

After creating an account:

1. Open Atlas.
2. Open your cluster.
3. Choose **Browse Collections** / Data Explorer.
4. Open the `farmkart` database.
5. You should see a `users` collection.
6. You should also see a `sessions` collection.

A user document is similar to:

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "phone": "9876543210",
  "passwordHash": "$2b$12$...",
  "createdAt": "..."
}
```

The password itself is not stored.

A session document contains a hashed session token and an expiry date.

## 11. Project files added/changed

### New

```text
app/login/page.tsx
app/api/auth/login/route.ts
app/api/auth/signup/route.ts
app/api/auth/logout/route.ts
app/api/auth/me/route.ts
components/auth-guard.tsx
lib/auth.ts
lib/auth-context.tsx
lib/mongodb.ts
.env.example
```

### Updated

```text
app/layout.tsx
components/navbar.tsx
app/profile/page.tsx
app/orders/page.tsx
package.json
```

## 12. How the architecture works

```text
Browser
   |
   | Login / Signup
   v
Next.js Route Handler
   |
   +---- bcryptjs ---> password hash
   |
   +---- MongoDB Atlas ---> users collection
   |
   +---- MongoDB Atlas ---> sessions collection
   |
   +---- HTTP-only cookie ---> browser
```

For a request to a protected area:

```text
Browser
   |
   | session cookie
   v
Next.js
   |
   v
sessions collection
   |
   v
users collection
   |
   v
Authenticated user
```

## 13. Important security notes

Do not put `MONGODB_URI` into client-side React code.

Do not store the user's password in localStorage, sessionStorage, or a normal browser cookie.

Do not commit `.env.local`.

For production, use HTTPS and a properly restricted MongoDB Atlas Network Access configuration.

## 14. Common problems

### Error: `Please add MONGODB_URI to .env.local`

Make sure:

- `.env.local` is in the project root.
- The variable is exactly `MONGODB_URI`.
- You restarted `npm run dev` after creating/editing `.env.local`.

### Error: MongoServerSelectionError

Check:

- Atlas Network Access includes your current IP.
- The cluster is running.
- The MongoDB username and password are correct.
- The connection string was copied correctly.

### Error: authentication failed

Check the **MongoDB database user** credentials in Atlas, not your Atlas website password.

### Error: password has special characters

A password such as `My@Pass#123` can require URL encoding inside the connection string. The simplest beginner approach is to create a strong database password using letters and numbers only.

### Existing email error

The application intentionally prevents duplicate accounts using the same email. Log in with the existing account instead.

## 15. Important distinction

The MongoDB database user is used by the **FarmKart server to connect to Atlas**.

Your FarmKart customer accounts are stored separately in the `users` collection.

So you will have:

```text
MongoDB Atlas login
      |
      +--- database user
              |
              +--- FarmKart database
                     |
                     +--- users
                     +--- sessions
```

## 16. Optional next authentication features

The current implementation uses email + password and an optional phone field.

Google Sign-In, OTP login by phone, Forgot Password email, email verification, and Razorpay-linked authenticated orders can be added later without changing the basic MongoDB structure.

## Razorpay Payment Setup

FarmKart now supports Razorpay Standard Checkout for product orders and vehicle bookings.

Add these values to `.env.local` (use Razorpay Test Mode first):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

The Key ID can be used by the browser; the Key Secret must remain server-side. The application creates the Razorpay Order on the server, opens Standard Checkout in the browser, then verifies the returned payment signature before creating the FarmKart order. See the official Razorpay Standard Checkout guide for the required flow. 

For production, configure an HTTPS webhook endpoint at `/api/payment/webhook` in Razorpay Dashboard → Account & Settings → Webhooks and subscribe to payment captured/order paid events.
