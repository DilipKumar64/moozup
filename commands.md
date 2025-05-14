# ✅ Common Node Commands
npm install
npm run dev
nodemon index.js

# ✅ Git
git status
git add .
git commit -m "your message"
git push origin main

# ✅ VS Code Shortcuts
Ctrl + P → File Search
Ctrl + Shift + F → Global Search
Ctrl + ` → Open Terminal
Ctrl + B → Toggle Sidebar


# 🔃 Generate Prisma Client
npx prisma generate

# 🧱 Create new migration
npx prisma migrate dev --name init

# 🔄 Update existing schema (automatically applies migration)
npx prisma migrate dev

# 🏁 Deploy migration (production)
npx prisma migrate deploy

# 🧹 Reset DB and apply all migrations
npx prisma migrate reset

# 📂 Open Prisma Studio (DB UI)
npx prisma studio