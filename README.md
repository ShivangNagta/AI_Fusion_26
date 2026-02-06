<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aos1o5NiELQYPLIGHsmO0EvKvYFc15be

## Run Locally

**Prerequisites:**  Node.js


1. Install frontend dependencies:
   `npm install`
2. Install backend dependencies:
   `cd server && npm install`
3. (Optional) Set `GEMINI_API_KEY` and `JWT_SECRET` in `server/.env`.
4. Run the backend API:
   `cd server && npm run dev`
5. Run the frontend:
   `npm run dev`

Demo credentials:
- admin@campus.edu / pass123
- student@campus.edu / pass123
