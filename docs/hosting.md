# Self-Hosting Guide

## Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

## Deployment Options

### Apache
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

### Nginx
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

### Node.js Static Server
```javascript
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

## Build Steps

1. Build the project:
```sh
npm run build
```

2. Deploy the contents of the `dist` directory to your chosen hosting platform.

## Troubleshooting

1. **Authentication issues**
   - Verify environment variables
   - Check allowed domains in Supabase
   - Ensure SSL is enabled if required

2. **Database operations failing**
   - Check RLS policies
   - Verify table structures
   - Check network requests for errors

3. **Build failing**
   - Verify all dependencies are installed
   - Check Node.js version compatibility
   - Confirm environment variables are set