#!/usr/bin/env python3
"""
Gmail API Setup for AAAC Membership System
This script sets up Gmail OAuth2 authentication without storing passwords
"""

import os
import json
import webbrowser
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import pickle

class GmailSetup:
    def __init__(self):
        self.project_dir = Path("aaac-membership-system")
        self.credentials_dir = self.project_dir / "backend" / "config"
        self.scopes = ['https://www.googleapis.com/auth/gmail.send']
        
    def print_instructions(self):
        """Print setup instructions"""
        print("=" * 60)
        print("📧 Gmail API Setup for AAAC Membership System")
        print("=" * 60)
        print("This setup will allow the system to send emails via Gmail API")
        print("No passwords will be stored - uses secure OAuth2 authentication")
        print("=" * 60)
        
    def create_client_config(self):
        """Create client configuration file"""
        print("\n🔧 Step 1: Create Gmail API Client Configuration")
        print("Follow these steps:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Create a new project or select existing project")
        print("3. Enable Gmail API")
        print("4. Create OAuth 2.0 credentials")
        print("5. Download the JSON credentials file")
        print("6. Save it as 'client_secret.json' in the config folder")
        
        # Create sample client config
        sample_config = {
            "installed": {
                "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
                "project_id": "aaac-membership-system",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": "YOUR_CLIENT_SECRET",
                "redirect_uris": ["http://localhost"]
            }
        }
        
        config_path = self.credentials_dir / "client_secret.json"
        with open(config_path, 'w') as f:
            json.dump(sample_config, f, indent=2)
        
        print(f"\n✅ Sample config created at: {config_path}")
        print("⚠️  Please replace with your actual Gmail API credentials")
        
    def setup_oauth_flow(self):
        """Set up OAuth2 flow"""
        print("\n🔐 Step 2: OAuth2 Authentication Setup")
        
        client_secret_path = self.credentials_dir / "client_secret.json"
        
        if not client_secret_path.exists():
            print("❌ client_secret.json not found!")
            print("Please complete Step 1 first")
            return False
        
        try:
            # Create OAuth flow
            flow = InstalledAppFlow.from_client_secrets_file(
                str(client_secret_path), 
                self.scopes
            )
            
            # Run the OAuth flow
            print("🌐 Opening browser for Gmail authentication...")
            credentials = flow.run_local_server(port=0)
            
            # Save credentials
            creds_path = self.credentials_dir / "token.pickle"
            with open(creds_path, 'wb') as token:
                pickle.dump(credentials, token)
            
            print(f"✅ Authentication successful! Credentials saved to: {creds_path}")
            return True
            
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            return False
    
    def create_gmail_service(self):
        """Create Gmail service configuration"""
        print("\n📧 Step 3: Creating Gmail Service Configuration")
        
        gmail_config = '''import pickle
import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

class GmailService:
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/gmail.send']
        self.credentials_path = 'backend/config/token.pickle'
        self.client_secret_path = 'backend/config/client_secret.json'
        self.service = None
        self.setup_service()
    
    def setup_service(self):
        """Set up Gmail service with OAuth2"""
        creds = None
        
        # Load existing credentials
        if os.path.exists(self.credentials_path):
            with open(self.credentials_path, 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.client_secret_path, self.scopes
                )
                creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open(self.credentials_path, 'wb') as token:
                pickle.dump(creds, token)
        
        # Build service
        self.service = build('gmail', 'v1', credentials=creds)
    
    def send_email(self, to_email, subject, body):
        """Send email using Gmail API"""
        try:
            import base64
            from email.mime.text import MIMEText
            
            # Create message
            message = MIMEText(body, 'plain', 'utf-8')
            message['to'] = to_email
            message['subject'] = subject
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send message
            self.service.users().messages().send(
                userId='me', body={'raw': raw_message}
            ).execute()
            
            return True
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

# Usage example:
# gmail_service = GmailService()
# gmail_service.send_email("recipient@example.com", "Subject", "Body")'''
        
        gmail_service_path = self.credentials_dir / "gmail_service.py"
        with open(gmail_service_path, 'w') as f:
            f.write(gmail_config)
        
        print(f"✅ Gmail service configuration created: {gmail_service_path}")
    
    def create_simple_email_script(self):
        """Create a simple email sending script"""
        print("\n📤 Step 4: Creating Simple Email Script")
        
        email_script = '''#!/usr/bin/env python3
"""
Simple Email Sender for AAAC Membership System
Uses Gmail API with OAuth2 authentication
"""

import sys
import os
sys.path.append('backend/config')

from gmail_service import GmailService

def send_receipt(member_name, phone_number, balance):
    """Send receipt to member"""
    gmail = GmailService()
    
    if balance >= 0:
        subject = "የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ደረሰኝ"
        body = f"""የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ደረሰኝ

ውድ {member_name}

የአዲስ አበባ ማሕበር በቺካጎ  አባልነትዎ ቀሪ ሂሳብ ${abs(balance)} ነው።

ክፍያውን በ Zelle  ለመላክ: aaaichicago@gmail.com ይጠቀሙና ሒሳቦትን ይከፍሉ ዘንድ በትሕትና እንጠይቃለን።

ከምስጋና ጋር
የአዲስ አበባ ማሕበር በቺካጎ ቦርድ"""
    else:
        subject = "የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ማስታወሻ"
        body = f"""የአዲስ አበባ ማሕበር በቺካጎ ክፍያ ማስታወሻ

ውድ {member_name}

የአዲስ አበባ ማሕበር በቺካጎ  አባልነትዎ ቀሪ ሂሳብ ${abs(balance)} ነው።

ክፍያውን በ Zelle  ለመላክ: aaaichicago@gmail.com ይጠቀሙና ሒሳቦትን ይከፍሉ ዘንድ በትሕትና እንጠይቃለን።

ከምስጋና ጋር
የአዲስ አበባ ማሕበር በቺካጎ ቦርድ"""
    
    # Send email
    success = gmail.send_email(phone_number, subject, body)
    
    if success:
        print(f"✅ Email sent successfully to {member_name}")
    else:
        print(f"❌ Failed to send email to {member_name}")
    
    return success

if __name__ == "__main__":
    # Example usage
    send_receipt("Test Member", "test@example.com", 50)'''
        
        email_script_path = self.project_dir / "send_email.py"
        with open(email_script_path, 'w') as f:
            f.write(email_script)
        
        # Make executable
        os.chmod(email_script_path, 0o755)
        
        print(f"✅ Email script created: {email_script_path}")
    
    def setup(self):
        """Complete Gmail setup"""
        self.print_instructions()
        
        # Create config directory
        self.credentials_dir.mkdir(parents=True, exist_ok=True)
        
        # Step 1: Create client config
        self.create_client_config()
        
        # Step 2: OAuth2 setup
        if self.setup_oauth_flow():
            # Step 3: Create service
            self.create_gmail_service()
            
            # Step 4: Create email script
            self.create_simple_email_script()
            
            print("\n🎉 Gmail setup completed successfully!")
            print("\n📧 To send an email:")
            print("python send_email.py")
            print("\n🔐 No passwords stored - uses secure OAuth2!")
        else:
            print("\n❌ Gmail setup failed. Please try again.")

def main():
    setup = GmailSetup()
    setup.setup()

if __name__ == "__main__":
    main()
