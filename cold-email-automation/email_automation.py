#!/usr/bin/env python3
"""
EasyDock Cold Email Automation Script
Sends personalized cold emails to marina contacts from a CSV file.
"""

import csv
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys
import time
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
CSV_FILE = "easydock.co - Cold Email List.csv"
TEMPLATE_FILE = "easydock.co - cold email template.txt"

# Subject line options (indexed 1-5)
SUBJECT_LINES = {
    1: "[Marina Name]: Stop Leaving Money On The Dock (EasyDock Can Fix It)",
    2: "How To 2X Your Slip Occupancy (Without Lifting A Finger)",
    3: "The 1 Simple Shift To Get More Boaters (And More Profit)",
    4: "Warning: Your Empty Slips Are Costing You Thousands (We Have The Cure)",
    5: "[Free] System To Fill Your Marina (Even During Off-Peak)"
}

# Email body template (lines 7-24 from template file)
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


def update_csv_with_timestamp(csv_file, row_index, timestamp):
    """Update the CSV file with timestamp for sent email."""
    try:
        # Read all rows
        with open(csv_file, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        # Update the specific row's "Time Sent" column (index 5)
        if row_index < len(rows):
            rows[row_index][5] = timestamp
        
        # Write back to file
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        
        return True
    except Exception as e:
        print(f"Error updating CSV: {e}")
        return False


def main():
    """Main function to run the email automation."""
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
    print("EasyDock Cold Email Automation")
    print("=" * 60)
    print(f"Sender: {SENDER_EMAIL}")
    print(f"CSV File: {CSV_FILE}")
    print("=" * 60)
    
    # Confirmation prompt
    response = input("\nDo you want to start sending emails? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("Aborted.")
        sys.exit(0)
    
    # Read CSV and send emails
    sent_count = 0
    skipped_count = 0
    error_count = 0
    
    with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
        
        for idx, row in enumerate(rows, start=2):  # Start at 2 because row 1 is header
            marina_name = row.get('Marina Name', '').strip()
            region = row.get('Region', '').strip()
            contact_field = row.get('Manager/Contact Name (if available)', '').strip()
            email_field = row.get('Email', '').strip()
            time_sent = row.get('Time Sent ', '').strip()  # Note: there's a space in the column name
            subject_choice = row.get('Subject Line Choice', '').strip()
            
            # Skip if already sent
            if time_sent and time_sent != "":
                print(f"⏭️  Skipping {marina_name} - Already sent at {time_sent}")
                skipped_count += 1
                continue
            
            # Handle multiple emails separated by semicolons
            email_addresses = [e.strip() for e in email_field.split(';')]
            
            for email_addr in email_addresses:
                # Validate email
                if not validate_email(email_addr):
                    print(f"⚠️  Skipping {marina_name} - Invalid email: {email_addr}")
                    skipped_count += 1
                    continue
                
                # Parse contact name
                contact_name = parse_contact_name(contact_field)
                
                # Generate personalized email
                subject, body = personalize_email(marina_name, contact_name, region, subject_choice)
                
                print(f"\n📧 Sending to: {email_addr}")
                print(f"   Marina: {marina_name}")
                print(f"   Contact: {contact_name}")
                print(f"   Subject: {subject}")
                
                # Send email
                success, error = send_email(email_addr, subject, body)
                
                if success:
                    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M %p %Z")
                    print(f"   ✅ Sent successfully at {timestamp}")
                    
                    # Update CSV with timestamp (only on first email if multiple)
                    if email_addr == email_addresses[0]:
                        update_csv_with_timestamp(csv_path, idx, timestamp)
                    
                    sent_count += 1
                    
                    # Rate limiting: wait 2 seconds between emails to avoid being flagged as spam
                    time.sleep(2)
                else:
                    print(f"   ❌ Failed to send: {error}")
                    error_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("Email Campaign Summary")
    print("=" * 60)
    print(f"✅ Sent: {sent_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"❌ Errors: {error_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()

