# EasyDock Cold Email Automation

Automated email campaign system for reaching out to marina owners and managers.

## Features

- ✉️ Personalized email generation from CSV data
- 📝 Multiple subject line options
- 🔄 Automatic tracking of sent emails
- ⚡ Gmail SMTP integration
- 🛡️ Rate limiting to avoid spam filters
- 📊 Detailed campaign summary reports

## Prerequisites

- Python 3.7 or higher
- Gmail account with App Password enabled

## Gmail Setup

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Under "How you sign in to Google", select **2-Step Verification**
4. Follow the prompts to enable 2FA

### Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Under "How you sign in to Google", select **App passwords**
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: `EasyDock Email Automation`
6. Click **Generate**
7. Copy the 16-character password (you'll need this for the `.env` file)

**Important:** App passwords can only be used with accounts that have 2-Step Verification enabled.

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd cold-email-automation
   ```

2. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your credentials:**
   
   Open `.env` and replace `your_app_password_here` with the App Password you generated:
   ```
   SENDER_EMAIL=easydockinfo@gmail.com
   SENDER_PASSWORD=abcd efgh ijkl mnop  # Your 16-char app password
   SENDER_NAME=EasyDock Team
   ```

## Usage

### Running the Script

```bash
python email_automation.py
```

The script will:
1. Display a summary of the campaign settings
2. Ask for confirmation before sending
3. Process each row in the CSV file
4. Send personalized emails to valid contacts
5. Update the CSV with timestamps for sent emails
6. Display a final summary report

### CSV File Format

The script reads from `easydock.co - Cold Email List.csv` with the following columns:

- **Marina Name**: Name of the marina (required)
- **Region**: Geographic region (defaults to "Florida" if empty)
- **Manager/Contact Name (if available)**: Contact person's name
- **Email**: Email address(es) - can be multiple separated by semicolons
- **Phone (if available)**: Phone number (not used in automation)
- **Time Sent**: Timestamp (auto-filled by script when email is sent)
- **Subject Line Choice**: Number 1-5 for subject line selection

### Subject Line Options

1. `[Marina Name]: Stop Leaving Money On The Dock (EasyDock Can Fix It)`
2. `How To 2X Your Slip Occupancy (Without Lifting A Finger)`
3. `The 1 Simple Shift To Get More Boaters (And More Profit)`
4. `Warning: Your Empty Slips Are Costing You Thousands (We Have The Cure)`
5. `[Free] System To Fill Your Marina (Even During Off-Peak)`

### Email Personalization

The script automatically personalizes each email with:
- Marina name
- Contact's first name (or "Team" for general contacts)
- Region/location
- Selected subject line

### Smart Features

- **Skip Already Sent**: Automatically skips contacts with a timestamp in "Time Sent" column
- **Email Validation**: Validates email addresses before sending
- **Multiple Emails**: Handles multiple email addresses separated by semicolons
- **Rate Limiting**: Waits 2 seconds between emails to avoid spam filters
- **Error Handling**: Continues processing even if individual emails fail

## Testing

Before running a full campaign, test with a small batch:

1. Create a test CSV with 2-3 contacts
2. Run the script
3. Verify emails are received correctly
4. Check personalization and formatting

## Safety Features

- **Confirmation Required**: Script asks for confirmation before sending
- **Already Sent Protection**: Won't re-send to contacts marked as sent
- **Error Reporting**: Displays detailed error messages for failed sends
- **CSV Backup**: Consider backing up your CSV before running large campaigns

## Troubleshooting

### "535 Authentication failed" Error

- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Factor Authentication is enabled on your Google account
- Check that the password in `.env` matches the App Password (no spaces)

### "SMTPServerDisconnected" Error

- Check your internet connection
- Verify SMTP settings (should be `smtp.gmail.com:587`)
- Try again after a few minutes

### Emails Going to Spam

- Ensure you're not sending too many emails too quickly (rate limiting is built-in)
- Consider warming up your email account with manual sends first
- Check email content for spam triggers
- Verify your domain reputation

### CSV Not Updating

- Make sure the CSV file isn't open in Excel or another program
- Check file permissions
- Verify the CSV file path is correct

## Best Practices

1. **Start Small**: Test with 5-10 contacts before running full campaign
2. **Daily Limits**: Gmail limits sending to ~500 emails/day for free accounts
3. **Timing**: Send during business hours in recipient's timezone
4. **Follow-ups**: Wait at least 3-5 business days before follow-up emails
5. **Compliance**: Ensure compliance with CAN-SPAM Act and GDPR
6. **Opt-out**: Honor all unsubscribe requests immediately

## File Structure

```
cold-email-automation/
├── email_automation.py                    # Main automation script
├── requirements.txt                       # Python dependencies
├── .env                                   # Your credentials (DO NOT COMMIT)
├── .env.example                          # Example environment file
├── easydock.co - Cold Email List.csv     # Contact database
├── easydock.co - cold email template.txt # Email templates
└── README.md                             # This file
```

## Security Notes

- **Never commit `.env` file** to version control
- Keep your App Password secure
- Use environment variables for sensitive data
- Regularly rotate App Passwords

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review Gmail's SMTP documentation
- Verify your CSV file format matches the expected columns

## Legal Disclaimer

This tool is for legitimate business outreach only. Users are responsible for:
- Compliance with anti-spam laws (CAN-SPAM, GDPR, etc.)
- Obtaining appropriate consent where required
- Honoring opt-out requests
- Maintaining accurate contact lists

---

**Version:** 1.0.0  
**Last Updated:** October 2025

