#!/usr/bin/env python3
"""
Live Deployment Script for AAAC Membership System
Deploy to free hosting platforms
"""

import os
import shutil
import subprocess
from pathlib import Path

def deploy_to_netlify():
    """Deploy to Netlify (Free)"""
    print("🚀 Deploying to Netlify...")
    
    # Create netlify.toml configuration
    netlify_config = '''[build]
  publish = "frontend/pages"
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "16"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"'''
    
    with open("netlify.toml", "w") as f:
        f.write(netlify_config)
    
    print("✅ Netlify configuration created")
    print("📋 Next steps:")
    print("1. Go to https://netlify.com")
    print("2. Sign up for free account")
    print("3. Drag and drop the aaac-membership-system folder")
    print("4. Get your live URL!")

def deploy_to_github_pages():
    """Deploy to GitHub Pages (Free)"""
    print("🚀 Deploying to GitHub Pages...")
    
    # Create GitHub Pages configuration
    github_config = '''# GitHub Pages Configuration
# Deploy from /docs folder

# Create docs folder and copy files
mkdir -p docs
cp -r frontend/pages/* docs/
cp -r frontend/assets docs/assets

# Enable GitHub Pages in repository settings
# Source: Deploy from a branch
# Branch: main
# Folder: /docs'''
    
    with open("github-pages-setup.md", "w") as f:
        f.write(github_config)
    
    print("✅ GitHub Pages configuration created")
    print("📋 Next steps:")
    print("1. Create GitHub repository")
    print("2. Upload files to repository")
    print("3. Enable GitHub Pages in settings")
    print("4. Get your live URL!")

def create_deployment_package():
    """Create deployment package"""
    print("📦 Creating deployment package...")
    
    # Create deployment folder
    deploy_dir = Path("deployment-package")
    deploy_dir.mkdir(exist_ok=True)
    
    # Copy necessary files
    files_to_copy = [
        ("frontend/pages", "pages"),
        ("frontend/assets", "assets"),
        ("backend/data", "data"),
        ("README.md", "README.md"),
        ("DEPLOYMENT_GUIDE.md", "DEPLOYMENT_GUIDE.md")
    ]
    
    for src, dst in files_to_copy:
        src_path = Path(src)
        dst_path = deploy_dir / dst
        
        if src_path.exists():
            if src_path.is_dir():
                shutil.copytree(src_path, dst_path, dirs_exist_ok=True)
            else:
                shutil.copy2(src_path, dst_path)
            print(f"✅ Copied {src} to deployment package")
    
    print(f"✅ Deployment package created in: {deploy_dir}")
    return deploy_dir

def main():
    print("=" * 50)
    print("🌐 AAAC Membership System - Live Deployment")
    print("=" * 50)
    
    print("\n📋 Choose deployment option:")
    print("1. Netlify (Free, easiest)")
    print("2. GitHub Pages (Free, requires GitHub)")
    print("3. Create deployment package")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        deploy_to_netlify()
    elif choice == "2":
        deploy_to_github_pages()
    elif choice == "3":
        deploy_dir = create_deployment_package()
        print(f"\n📦 Deployment package ready in: {deploy_dir}")
        print("📋 You can upload this folder to any hosting service")
    else:
        print("❌ Invalid choice")
        return
    
    print("\n🎉 Deployment setup completed!")
    print("\n📱 Once deployed, share these links:")
    print("🌐 System: [Your deployed URL]")
    print("🔐 Admin: admin/admin2025")
    print("🔐 Board: board/board2025")
    print("🔐 Member: member/member2025")

if __name__ == "__main__":
    main()
