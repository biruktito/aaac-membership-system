#!/bin/bash

echo "🚀 GitHub Setup for AAAC Membership System"
echo "=========================================="

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    echo "🔐 Authenticating with GitHub..."
    gh auth login
    echo "📦 Creating repository..."
    gh repo create aaac-membership-system --public --description "የአዲስ አበባ ማሕበር በቺካጎ የአባልነት ገጽ"
    echo "🚀 Pushing code..."
    git push -u origin main
    echo "✅ Repository created and code pushed!"
    echo "🌐 Your live URL will be: https://biruktito.github.io/aaac-membership-system/"
else
    echo "❌ GitHub CLI not found. Let's set up manually..."
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: aaac-membership-system"
    echo "3. Description: የአዲስ አበባ ማሕበር በቺካጎ የአባልነት ገጽ"
    echo "4. Make it Public"
    echo "5. Click 'Create repository'"
    echo ""
    echo "🔐 Then create a Personal Access Token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Give it a name: 'AAAC Deployment'"
    echo "4. Select scopes: 'repo' and 'workflow'"
    echo "5. Copy the token"
    echo ""
    echo "💡 After creating the repository and token, run:"
    echo "git push -u origin main"
    echo ""
    echo "🌐 Your live URL will be: https://biruktito.github.io/aaac-membership-system/"
fi

echo ""
echo "🎉 Setup complete! Check the instructions above."
