# Kanban Task Board

A Kanban board I built for the Next Play Games internship assessment. It's inspired by Notion and Linear: soft pastel columns, clean cards, and small animations so it feels nice to use.

Everyone who opens the app gets their own private guest workspace automatically, so there's no signup and nobody can see anyone else's tasks.

**Live demo:** https://kanban-board-self-mu.vercel.app/

## What it does

- Guest sign-in happens automatically the first time you open the app, using Supabase anonymous auth
- Four columns: To Do, In Progress, In Review, and Done. Drag a card to another column and the change is saved right away
- Add tasks with a title, an optional description, a priority, and a due date
- Delete a task with a quick inline "are you sure?" check
- Cards get a badge when a task is due soon or overdue
- Search by title and filter by priority
- A small stats row shows total, completed, and overdue tasks
- Loading skeletons, error messages, and empty states so the app never just looks broken
- Works on phones with touch drag, and the layout adjusts from one column on mobile to four on desktop
- Cards fade in, lift a little on hover, and tilt while you drag them (animations turn off if your device is set to reduce motion)

## Built with

React, TypeScript, Vite, Tailwind CSS, dnd-kit for drag and drop, Supabase for the database and auth, and Vercel for hosting.

## Running it locally

1. Clone the repo and install packages:
   ```bash
   git clone https://github.com/Aditya510730/kanban-board.git
   cd kanban-board
   npm install
   ```

2. Create a free project at [supabase.com](https://supabase.com).

3. Turn on anonymous sign-ins. In the Supabase dashboard go to **Authentication**, then **Sign In / Providers**, and enable **Anonymous Sign-Ins**.

4. Create the table. Open the **SQL Editor**, paste in everything from [`schema.sql`](./schema.sql), and run it.

5. Create a file called `.env` in the project root with your project's details (you can find both in **Project Settings → API**):
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```
   Only use the publishable (anon) key here. Never put the service role key in the frontend.

6. Start the app:
   ```bash
   npm run dev
   ```
   Then open http://localhost:5173.

## Database

There's one table, `tasks`, with these columns: `id`, `title`, `description`, `status`, `priority`, `due_date`, `user_id`, and `created_at`. The full SQL, including the security policies, is in [`schema.sql`](./schema.sql).

## Security

Row Level Security is turned on for the `tasks` table. The select, insert, update, and delete policies all check that `auth.uid()` matches the row's `user_id`, so a guest can only ever read or change their own tasks. The `user_id` column fills itself in from the logged-in guest, so the frontend can't set it to someone else's id. The frontend only uses the public key, and `.env` is in `.gitignore`, so no secrets are committed.

## How the code is organized

```
src/
  App.tsx          main board: loads tasks, handles dragging and deleting
  supabase.ts      Supabase client and the guest sign-in helper
  types.ts         task types and column definitions
  utils.ts         due date and priority helpers
  components/
    Column.tsx     one board column (a drop target)
    TaskCard.tsx   a draggable task card with delete
    TaskForm.tsx   the new task form
```

Moves and deletes update the screen immediately and then save to Supabase. If the save fails, the card goes back where it was and an error message shows up.

## What I'd do next

- Let people edit tasks (right now you can create, move, and delete)
- Sync live across tabs with Supabase Realtime
- Add team members and assignees, labels, comments, and an activity log
- Make drag and drop work with the keyboard
- Add some automated tests
