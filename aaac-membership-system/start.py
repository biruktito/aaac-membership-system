#!/usr/bin/env python3
import os
import sys
import subprocess
import webbrowser
from pathlib import Path

def main():
    print("🚀 Starting AAAC Membership System...")
    
    # Change to frontend pages directory
    project_dir = Path("frontend/pages")
    if not project_dir.exists():
        print("❌ Error: frontend/pages directory not found!")
        print("Please run this script from the aaac-membership-system directory")
        return
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
    main()