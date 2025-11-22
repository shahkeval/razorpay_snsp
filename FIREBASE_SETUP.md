# Firebase Setup Guide for Audience Poll

## 📋 Prerequisites
1. A Google account
2. A Firebase account (create one at https://firebase.google.com/ if you don't have one)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Audience Poll" or "SNSP Poll")
4. Click **"Continue"**
5. (Optional) Enable Google Analytics - you can skip this for now
6. Click **"Create project"**
7. Wait for the project to be created, then click **"Continue"**

### Step 2: Enable Firestore Database

1. In your Firebase project dashboard, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development) - This allows read/write access for 30 days
   - ⚠️ **Note**: For production, you'll need to set up proper security rules
4. Select a **location** for your database (choose the closest to your users)
5. Click **"Enable"**
6. Wait for the database to be created

### Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon (⚙️)** next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. Click the **web icon (`</>`)** to add a web app
5. Register your app:
   - Enter an app nickname (e.g., "SNSP Web App")
   - (Optional) Check "Also set up Firebase Hosting"
   - Click **"Register app"**
6. **Copy the configuration object** - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 4: Configure Environment Variables

1. In your project root directory, create a `.env` file (if it doesn't exist)
2. Add the following environment variables with your Firebase config values:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Important Notes:**
- Replace all the placeholder values with your actual Firebase config values
- Do NOT commit the `.env` file to git (it should be in `.gitignore`)
- Make sure each variable starts with `REACT_APP_` (required for Create React App)

### Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to **"Firestore Database"** > **"Rules"** tab
2. Replace the default rules with the following:

#### For Development/Testing:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write votes (for testing)
    match /pollVotes/{voteId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
    
    // Allow anyone to read/write poll results (for testing)
    match /pollResults/{personId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Click **"Publish"** to save the rules

⚠️ **Security Warning**: The above rules allow anyone to read/write. For production, use the rules below:

#### For Production (Recommended):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Votes collection - prevent duplicate votes
    match /pollVotes/{voteId} {
      // Anyone can read (to check if they've voted)
      allow read: if true;
      // Anyone can create a vote (but only once per device)
      allow create: if !exists(/databases/$(database)/documents/pollVotes/$(request.resource.data.deviceId));
      // No updates or deletes allowed
      allow update, delete: if false;
    }
    
    // Poll results collection
    match /pollResults/{personId} {
      // Anyone can read results
      allow read: if true;
      // Only allow incrementing votes (server-side would be better, but this works)
      allow write: if request.resource.data.votes is int && 
                     request.resource.data.votes > resource.data.votes;
    }
  }
}
```

### Step 6: Customize the Poll Contestants

1. Open `src/pages/AudiencePoll.jsx`
2. Find the `persons` array (around line 35-40)
3. Replace with your actual contestants:

```javascript
const [persons] = useState([
  { id: 'contestant1', name: 'Contestant Name 1' },
  { id: 'contestant2', name: 'Contestant Name 2' },
  { id: 'contestant3', name: 'Contestant Name 3' },
  // Add more contestants as needed
]);
```

**Important:**
- Each `id` must be unique
- The `id` is used as the document ID in Firestore
- The `name` is what users will see

### Step 7: Test the Setup

1. Make sure your `.env` file is configured correctly
2. Restart your development server:
   ```bash
   npm start
   ```
3. Navigate to: `http://localhost:3000/poll`
4. You should see the poll page with your contestants
5. Try voting - check Firebase Console > Firestore Database to see if data is being saved

---

## 📊 Database Structure

### Collection: `pollVotes`
Stores individual votes to prevent duplicate voting.

**Document ID**: Device fingerprint (e.g., `device_1234567890_1234567890`)

**Document Structure:**
```json
{
  "personId": "contestant1",
  "deviceId": "device_1234567890_1234567890",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "votedAt": "2024-01-15T10:30:00.000Z"
}
```

### Collection: `pollResults`
Stores vote counts for each contestant.

**Document ID**: Contestant ID (e.g., `contestant1`)

**Document Structure:**
```json
{
  "personId": "contestant1",
  "personName": "Contestant Name 1",
  "votes": 42,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Troubleshooting

### Error: "Failed to initialize poll"
- **Check**: Verify your Firebase config values in `.env` file
- **Check**: Make sure all environment variables start with `REACT_APP_`
- **Check**: Restart your development server after changing `.env`
- **Check**: Verify Firestore is enabled in Firebase Console

### Error: "Permission denied" when voting
- **Check**: Go to Firestore > Rules and verify rules allow create operations
- **Check**: Make sure you published the rules (click "Publish" button)

### Votes not updating in real-time
- **Check**: Firestore rules allow read operations
- **Check**: Browser console for any errors
- **Check**: Internet connection

### Multiple votes allowed from same device
- **Check**: Device fingerprinting is working (check localStorage for `deviceFingerprint`)
- **Check**: Firestore rules prevent duplicate device IDs
- **Check**: Clear browser cache and localStorage if testing

### Environment variables not loading
- **Solution**: Restart the development server after adding/changing `.env` file
- **Check**: Variables must start with `REACT_APP_`
- **Check**: No spaces around the `=` sign in `.env` file

---

## 🎯 Quick Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Firebase config values copied
- [ ] `.env` file created with all `REACT_APP_FIREBASE_*` variables
- [ ] Firestore security rules configured
- [ ] Contestants list updated in `AudiencePoll.jsx`
- [ ] Development server restarted
- [ ] Tested voting functionality
- [ ] Verified data appears in Firestore Console

---

## 📱 Accessing the Poll

Once everything is set up:
- **Development**: `http://localhost:3000/poll`
- **Production**: `https://your-domain.com/poll`

---

## 🔒 Security Best Practices

1. **For Production:**
   - Use production Firestore rules (see Step 5)
   - Consider implementing server-side vote validation
   - Monitor for suspicious voting patterns
   - Set up Firebase App Check for additional security

2. **Rate Limiting:**
   - Consider adding rate limiting on the backend
   - Monitor vote frequency per device

3. **Data Privacy:**
   - Device fingerprints are stored - ensure compliance with privacy regulations
   - Consider adding a privacy policy

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Firebase Console > Firestore Database for data
3. Verify all environment variables are set correctly
4. Make sure Firestore is enabled and rules are published

---

## 🎉 You're All Set!

Your audience poll is now ready to use! Users can vote, and you'll see real-time results updating in the Firebase Console.
