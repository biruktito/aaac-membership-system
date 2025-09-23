#!/usr/bin/env python3
"""
AAAC Membership System - Simple Deployment Script
"""

import os
import sys
import shutil
from pathlib import Path

def create_structure():
    """Create the new project structure"""
    print("📁 Creating project structure...")
    
    # Create main directories
    directories = [
        "aaac-membership-system",
        "aaac-membership-system/frontend",
        "aaac-membership-system/frontend/pages",
        "aaac-membership-system/frontend/assets/css",
        "aaac-membership-system/frontend/assets/js",
        "aaac-membership-system/backend",
        "aaac-membership-system/backend/data",
        "aaac-membership-system/backend/config",
        "aaac-membership-system/docs",
        "aaac-membership-system/legacy"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created {directory}")

def migrate_files():
    """Migrate existing files to new structure"""
    print("\n📊 Migrating existing files...")
    
    # Copy main files
    files_to_copy = [
        ("membership_status_tracker.html", "aaac-membership-system/frontend/pages/dashboard.html"),
        ("login.html", "aaac-membership-system/frontend/pages/login.html"),
        ("index.html", "aaac-membership-system/frontend/pages/index.html"),
        ("README.md", "aaac-membership-system/docs/README.md"),
        ("Accountant_Instructions.txt", "aaac-membership-system/docs/ACCOUNTANT_GUIDE.md")
    ]
    
    for src, dst in files_to_copy:
        if Path(src).exists():
            shutil.copy2(src, dst)
            print(f"✅ Migrated {src} to {dst}")
    
    # Copy CSV files
    csv_files = [
        "AAAC_Accountant_Database_20250826.csv",
        "AAAC_2022.csv",
        "AAAC_2023.csv",
        "AAAC_2024.csv",
        "AAAC_2025.csv",
        "AAAC_2026.csv"
    ]
    
    for csv_file in csv_files:
        if Path(csv_file).exists():
            shutil.copy2(csv_file, f"aaac-membership-system/backend/data/{csv_file}")
            print(f"✅ Migrated {csv_file}")

def create_start_script():
    """Create a simple start script"""
    print("\n🚀 Creating start script...")
    
    start_script = '''#!/usr/bin/env python3
import os
import sys
import subprocess
import webbrowser
from pathlib import Path

def main():
    print("🚀 Starting AAAC Membership System...")
    
    # Change to project directory
    project_dir = Path("aaac-membership-system/frontend/pages")
    os.chdir(project_dir)
    
    # Start HTTP server
    print("🌐 Starting server on http://localhost:8000")
    print("📱 Mobile-friendly interface ready")
    print("🔐 Authentication: member/member2025, board/board2025, admin/admin2025")
    
    # Open browser
    webbrowser.open("http://localhost:8000")
    
    # Start server
    subprocess.run([sys.executable, "-m", "http.server", "8000"])

if __name__ == "__main__":
    main()'''
    
    with open("aaac-membership-system/start.py", "w") as f:
        f.write(start_script)
    
    # Make executable
    os.chmod("aaac-membership-system/start.py", 0o755)
    print("✅ Start script created")

def create_requirements():
    """Create requirements.txt"""
    print("\n📦 Creating requirements file...")
    
    requirements = '''Flask==2.3.3
Flask-CORS==4.0.0
pandas==2.0.3
google-auth==2.23.4
google-auth-oauthlib==1.1.0
gmail-api-python-client==2.108.0'''
    
    with open("aaac-membership-system/requirements.txt", "w") as f:
        f.write(requirements)
    
    print("✅ Requirements file created")

def main():
    print("=" * 50)
    print("🚀 AAAC Membership System Deployment")
    print("=" * 50)
    
    create_structure()
    migrate_files()
    create_start_script()
    create_requirements()
    
    print("\n🎉 Deployment completed!")
    print("\n📋 To start the system:")
    print("1. cd aaac-membership-system")
    print("2. python start.py")
    print("3. Open http://localhost:8000")
    print("\n📱 Mobile-friendly and ready to use!")

if __name__ == "__main__":
    main()
