# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/13324c81-c490-4308-9998-3154aae5b0a4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/13324c81-c490-4308-9998-3154aae5b0a4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Self-Hosting Guide

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

### Step 1: Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Once created, go to Project Settings > Database and run these SQL commands:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  is_admin boolean DEFAULT false,
  last_username_change timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create posts table
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Create comments table
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id),
  author_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Create likes table
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id),
  user_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Create follows table
CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id),
  following_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (follower_id, following_id)
);

-- Create notifications table
CREATE TYPE notification_type AS ENUM ('like_post', 'like_comment', 'follow', 'comment');

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type notification_type NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  reference_id uuid,
  notification_group_id uuid,
  PRIMARY KEY (id)
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  post_id uuid NOT NULL REFERENCES public.posts(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Set up RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Create triggers for notifications
CREATE OR REPLACE FUNCTION public.handle_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_content TEXT;
    v_type notification_type;
    v_reference_id uuid;
    v_group_id uuid;
    v_user_id uuid;
BEGIN
    -- Handle likes
    IF TG_TABLE_NAME = 'likes' THEN
        IF NEW.post_id IS NOT NULL THEN
            SELECT author_id, id INTO v_user_id, v_reference_id FROM posts WHERE id = NEW.post_id;
            v_type := 'like_post'::notification_type;
            v_content := 'liked your post';
        ELSE
            SELECT author_id, id INTO v_user_id, v_reference_id FROM comments WHERE id = NEW.comment_id;
            v_type := 'like_comment'::notification_type;
            v_content := 'liked your comment';
        END IF;
    
    -- Handle follows
    ELSIF TG_TABLE_NAME = 'follows' THEN
        v_user_id := NEW.following_id;
        v_type := 'follow'::notification_type;
        v_content := 'started following you';
        v_reference_id := NEW.follower_id;
    
    -- Handle comments
    ELSIF TG_TABLE_NAME = 'comments' THEN
        -- Get post author
        SELECT author_id, id INTO v_user_id, v_reference_id FROM posts WHERE id = NEW.post_id;
        v_type := 'comment'::notification_type;
        v_content := 'commented on your post';
        
        -- Also notify subscribers
        INSERT INTO notifications (user_id, type, content, reference_id, notification_group_id)
        SELECT 
            s.user_id,
            'comment'::notification_type,
            'New comment on a post you''re following',
            NEW.id,
            NEW.post_id
        FROM subscriptions s
        WHERE s.post_id = NEW.post_id
        AND s.user_id != NEW.author_id
        AND s.user_id != v_user_id;
    END IF;

    -- Don't notify yourself
    IF v_user_id = NEW.author_id OR v_user_id = NEW.user_id THEN
        RETURN NEW;
    END IF;

    -- Insert the notification
    INSERT INTO notifications (
        user_id,
        type,
        content,
        reference_id,
        notification_group_id
    ) VALUES (
        v_user_id,
        v_type,
        v_content,
        v_reference_id,
        COALESCE(v_group_id, v_reference_id)
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION handle_notification();

CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION handle_notification();

CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION handle_notification();

-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function and trigger for username changes
CREATE OR REPLACE FUNCTION public.check_username_change_cooldown()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.username != NEW.username AND 
     (OLD.last_username_change + INTERVAL '1 week') > NOW() THEN
    RAISE EXCEPTION 'Username can only be changed once per week';
  END IF;
  
  IF OLD.username != NEW.username THEN
    NEW.last_username_change = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_username_cooldown
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION check_username_change_cooldown();
```

3. Set up authentication:
   - Go to Authentication > Settings
   - Configure your desired auth providers (Email, GitHub, etc)
   - Note down your project URL and anon key from Project Settings > API

### Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Build and Deploy

1. Build the project:
```sh
npm run build
```

2. The built files will be in the `dist` directory. You can deploy these files to any static hosting service:

**Option 1: Apache**
```apache
# .htaccess file
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Option 2: Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Option 3: Node.js static server**
```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Step 4: Post-Deployment

1. Update your Supabase project settings:
   - Add your deployment URL to the allowed domains in Authentication > URL Configuration
   - Configure any additional security policies in Database > Policies

2. Test the deployment:
   - Try signing up/logging in
   - Verify database operations work
   - Check real-time updates if used

### Troubleshooting

Common issues and solutions:

1. **Authentication not working**
   - Verify your environment variables are correct
   - Check allowed domains in Supabase
   - Ensure SSL is enabled if required

2. **Database operations failing**
   - Check Row Level Security (RLS) policies
   - Verify table structures match expected schema
   - Check network requests for specific error messages

3. **Build failing**
   - Make sure all dependencies are installed
   - Check Node.js version compatibility
   - Verify environment variables are set correctly

For additional help, check the [Supabase documentation](https://supabase.com/docs) or open an issue in the project repository.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase for backend services

## How can I deploy this project?

You can either:
1. Use Lovable's built-in deployment: Open [Lovable](https://lovable.dev/projects/13324c81-c490-4308-9998-3154aae5b0a4) and click on Share -> Publish
2. Follow the self-hosting guide above to deploy it yourself

## I want to use a custom domain - is that possible?

Yes! You can:
1. Use Lovable's deployment with a custom domain by following our docs: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
2. When self-hosting, configure your domain with your chosen hosting provider