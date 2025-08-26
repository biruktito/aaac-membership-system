# GitHub Pages Configuration
# Deploy from /docs folder

# Create docs folder and copy files
mkdir -p docs
cp -r frontend/pages/* docs/
cp -r frontend/assets docs/assets

# Enable GitHub Pages in repository settings
# Source: Deploy from a branch
# Branch: main
# Folder: /docs