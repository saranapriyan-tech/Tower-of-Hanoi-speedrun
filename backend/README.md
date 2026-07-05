# Hanoi Backend

## 1. Fill in your password
Open `.env` and replace `YOUR_PASSWORD_HERE` with your actual MongoDB Atlas
database user password.

## 2. Test it locally
```
npm install
npm start
```
You should see in the terminal:
```
Connected to MongoDB
Server running on port 5000
```

If you see a MongoDB connection error instead, check:
- password is correct (no angle brackets left in it)
- your current IP is allowed in Atlas -> Network Access
  (or you set it to allow access from anywhere: 0.0.0.0/0)

## 3. Test the routes (before touching the frontend)
With the server running, open a new terminal and run:

Save a fake score:
```
curl -X POST http://localhost:5000/api/scores ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"diskCount\":5,\"timeTaken\":45230,\"moveCount\":31}"
```
(On Mac/Linux terminal, replace `^` line breaks with `\` or put it on one line.)

Fetch the leaderboard:
```
curl http://localhost:5000/api/scores?category=apprentice
```

If both of these work, the backend is done and correct.

## 4. Deploy to Render
1. Push this folder to a new GitHub repo (`.env` will NOT be pushed, .gitignore handles that)
2. On Render.com: New -> Web Service -> connect this repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add Environment Variables in Render's dashboard (NOT in a file):
   - `MONGO_URI` = your full connection string with real password
   - `PORT` = 5000 (Render usually overrides this automatically, that's fine)
6. Deploy. Once live, Render gives you a URL like `https://hanoi-backend.onrender.com`

That URL is what your frontend's `fetch()` calls will point to.
