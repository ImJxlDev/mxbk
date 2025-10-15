#!/bin/bash

# Top-Margin Trading - Automated Setup Script

echo "🚀 Top-Margin Trading - Backend Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Create project structure
echo "📁 Creating project structure..."
mkdir -p public/css public/js public/img

echo "✅ Folders created"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=3000

# JWT Secret (CHANGE THIS!)
JWT_SECRET=$(openssl rand -hex 32)

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EOF
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env and add your email credentials"
else
    echo "✅ .env file already exists"
fi
echo ""

# Check for Firebase service account
if [ ! -f serviceAccountKey.json ]; then
    echo "⚠️  Firebase service account key not found"
    echo ""
    echo "📋 To get your Firebase service account key:"
    echo "   1. Go to https://console.firebase.google.com/"
    echo "   2. Select your project"
    echo "   3. Click gear icon → Project settings"
    echo "   4. Go to 'Service accounts' tab"
    echo "   5. Click 'Generate new private key'"
    echo "   6. Save as 'serviceAccountKey.json' in this folder"
    echo ""
else
    echo "✅ Firebase service account key found"
fi

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Edit .env file with your credentials:"
echo "   - Add your Gmail email and app password"
echo ""
echo "2. Get Firebase service account key (if not done):"
echo "   - Follow instructions above"
echo ""
echo "3. Move your frontend files to public/ folder:"
echo "   mv *.html public/"
echo "   mv css public/"
echo "   mv js public/"
echo ""
echo "4. Update your HTML files to use auth-client.js"
echo "   (See SETUP_GUIDE.md for details)"
echo ""
echo "5. Start the server:"
echo "   npm start"
echo ""
echo "6. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "======================================"
