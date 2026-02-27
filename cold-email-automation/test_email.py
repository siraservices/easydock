#!/usr/bin/env python3
"""
EasyDock Cold Email Automation - TEST VERSION
Sends a test email to verify the setup works.
"""

import csv
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "easydockinfo@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
SENDER_NAME = os.getenv("SENDER_NAME", "EasyDock Team")

# File paths
CSV_FILE = "test-email-list.csv"

# Subject line options (indexed 1-5)
SUBJECT_LINES = {
    1: "[Marina Name]: Stop Leaving Money On The Dock (EasyDock Can Fix It)",
    2: "How To 2X Your Slip Occupancy (Without Lifting A Finger)",
    3: "The 1 Simple Shift To Get More Boaters (And More Profit)",
    4: "Warning: Your Empty Slips Are Costing You Thousands (We Have The Cure)",
    5: "[Free] System To Fill Your Marina (Even During Off-Peak)"
}

# Email body template
EMAIL_TEMPLATE = """Hi {contact_name},

We're reaching out regarding a new opportunity that could help {marina_name} maximize dock utilization and generate additional recurring revenue.

The Pain Point We're Solving: Many marinas have fluctuating occupancy rates, while boat owners struggle to find available docking spaces when they need them most.

Our Solution: EasyDock is a marina platform that connects boat owners directly with available marina spaces in real-time. We're building a network of premium marinas to offer boat owners instant access to docking availability at competitive rates.

What This Means for {marina_name}:
• Increased Revenue: Fill vacant slips during off-peak periods
• Higher Utilization: Optimize your dock capacity year-round
• Quality Clientele: Connect with verified boat owners actively seeking marina services
• Professional Platform: Streamlined booking and management tools

Why We're Reaching Out: {marina_name} has an excellent reputation in the {region} boating community, and we believe your marina would be a valuable addition to our growing network. We're currently onboarding select marinas for our launch phase.

Next Steps: I'd love to show you how EasyDock works and discuss how we can help optimize your marina's revenue potential. You can get a preview of our platform at:

👉 https://easydock.co

If you're interested in learning more, simply reply 'YES' and we'll send you additional details.

Looking forward to hearing from you.

Warmly,
EasyDock Dev Team

P.S. We're working with marinas across the east coast and are seeing excellent early results. Happy to share some initial success stories on our call.
"""

DISCLAIMER = """
---
This message, including any hypothetical scenarios, is for informational and illustrative purposes only and does not constitute professional advice. These scenarios are hypothetical and do not guarantee any specific outcome or past performance. Individual results will vary based on effort and external factors.

We make no promises or guarantees regarding your success or income. Individual successes are influenced by personal abilities, market conditions, and other external factors. We assume no responsibility for decisions or actions taken based on this email's content. Always consult qualified professionals before making significant business decisions.
"""


def validate_email(email):
    """Basic email validation."""
    if not email or email.strip() == "" or email.strip() == "-":
        return False
    if "No email" in email or "No direct email" in email:
        return False
    if "@" not in email or "." not in email:
        return False
    return True


def parse_contact_name(contact_field):
    """Extract a clean contact name from the contact field."""
    if not contact_field or contact_field.strip() == "":
        return "Team"
    
    # Handle cases like "McLayne Sisk (General Manager)"
    if "(" in contact_field:
        name_part = contact_field.split("(")[0].strip()
        if name_part and not name_part.startswith("General Contact"):
            return name_part.split()[0] if name_part else "Team"
    
    # If it starts with "General Contact", return "Team"
    if contact_field.startswith("General Contact"):
        return "Team"
    
    # Try to get first name
    parts = contact_field.strip().split()
    return parts[0] if parts else "Team"


def personalize_email(marina_name, contact_name, region, subject_choice):
    """Generate personalized subject and body for the email."""
    # Get subject line based on choice (default to option 1 if not specified)
    subject_choice = int(subject_choice) if subject_choice and str(subject_choice).strip().isdigit() else 1
    subject_template = SUBJECT_LINES.get(subject_choice, SUBJECT_LINES[1])
    
    # Replace [Marina Name] placeholder in subject
    subject = subject_template.replace("[Marina Name]", marina_name)
    
    # Determine region for body (default to "Florida" if not specified)
    if not region or region.strip() == "":
        region = "Florida"
    
    # Create email body
    body = EMAIL_TEMPLATE.format(
        contact_name=contact_name,
        marina_name=marina_name,
        region=region
    )
    
    # Add disclaimer
    body += DISCLAIMER
    
    return subject, body


def send_email(to_email, subject, body):
    """Send an email via Gmail SMTP."""
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message["To"] = to_email
        
        # Add plain text version
        text_part = MIMEText(body, "plain")
        message.attach(text_part)
        
        # Create secure SSL context
        context = ssl.create_default_context()
        
        # Connect to Gmail SMTP server
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(message)
        
        return True, None
    except Exception as e:
        return False, str(e)


def main():
    """Main function to run the test email."""
    # Check if password is set
    if not SENDER_PASSWORD:
        print("ERROR: SENDER_PASSWORD not set in environment variables!")
        print("Please create a .env file with your Gmail app password.")
        print("See README.md for instructions.")
        sys.exit(1)
    
    # Check if files exist
    csv_path = Path(CSV_FILE)
    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {CSV_FILE}")
        sys.exit(1)
    
    print("=" * 60)
    print("EasyDock Cold Email Automation - TEST MODE")
    print("=" * 60)
    print(f"Sender: {SENDER_EMAIL}")
    print(f"CSV File: {CSV_FILE}")
    print("=" * 60)
    
    # Read CSV and send test email
    with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
        
        for row in rows:
            marina_name = row.get('Marina Name', '').strip()
            region = row.get('Region', '').strip()
            contact_field = row.get('Manager/Contact Name (if available)', '').strip()
            email_field = row.get('Email', '').strip()
            subject_choice = row.get('Subject Line Choice', '').strip()
            
            # Handle multiple emails separated by semicolons
            email_addresses = [e.strip() for e in email_field.split(';')]
            
            for email_addr in email_addresses:
                # Validate email
                if not validate_email(email_addr):
                    print(f"⚠️  Skipping - Invalid email: {email_addr}")
                    continue
                
                # Parse contact name
                contact_name = parse_contact_name(contact_field)
                
                # Generate personalized email
                subject, body = personalize_email(marina_name, contact_name, region, subject_choice)
                
                print(f"\n[TEST EMAIL DETAILS]")
                print(f"   To: {email_addr}")
                print(f"   Marina: {marina_name}")
                print(f"   Contact: {contact_name}")
                print(f"   Subject: {subject}")
                print(f"\n[Email Preview - first 200 chars]:")
                print(f"   {body[:200]}...")
                print(f"\n{'=' * 60}")
                
                # Send email
                print(f"\n[Sending test email...]")
                success, error = send_email(email_addr, subject, body)
                
                if success:
                    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M %p")
                    print(f"   SUCCESS! Test email sent at {timestamp}!")
                    print(f"\nCheck your inbox at {email_addr}")
                else:
                    print(f"   FAILED to send: {error}")
    
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()

