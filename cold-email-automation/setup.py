#!/usr/bin/env python3
"""
Setup script for EasyDock Email Automation
Creates .env file with user credentials
"""

import os
from pathlib import Path


def main():
    print("=" * 60)
    print("EasyDock Email Automation - Setup")
    print("=" * 60)
    print()
    print("This script will help you configure the email automation.")
    print()
    print("You'll need:")
    print("1. Your Gmail address (easydockinfo@gmail.com)")
    print("2. A Gmail App Password (16-character code)")
    print()
    print("📖 To get an App Password:")
    print("   1. Enable 2-Factor Authentication on your Google Account")
    print("   2. Go to: https://myaccount.google.com/apppasswords")
    print("   3. Generate a password for 'Mail' on 'Other device'")
    print()
    print("-" * 60)
    
    # Get user input
    sender_email = input("\nGmail address [easydockinfo@gmail.com]: ").strip()
    if not sender_email:
        sender_email = "easydockinfo@gmail.com"
    
    sender_password = input("Gmail App Password (16 characters): ").strip()
    if not sender_password:
        print("❌ App Password is required!")
        return
    
    sender_name = input("Sender Name [EasyDock Team]: ").strip()
    if not sender_name:
        sender_name = "EasyDock Team"
    
    # Create .env file
    env_content = f"""# Gmail Configuration
SENDER_EMAIL={sender_email}
SENDER_PASSWORD={sender_password}
SENDER_NAME={sender_name}
"""
    
    env_file = Path(".env")
    
    if env_file.exists():
        overwrite = input("\n⚠️  .env file already exists. Overwrite? (yes/no): ").strip().lower()
        if overwrite not in ['yes', 'y']:
            print("Setup cancelled.")
            return
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print()
    print("✅ Configuration saved to .env file")
    print()
    print("Next steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Review your CSV file: easydock.co - Cold Email List.csv")
    print("3. Run the automation: python email_automation.py")
    print()
    print("=" * 60)


if __name__ == "__main__":
    main()

