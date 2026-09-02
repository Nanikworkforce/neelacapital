"""
One-time OAuth setup for Gmail API sending.

Creates a Desktop OAuth flow, opens the browser, and prints the refresh token
to store as GMAIL_OAUTH_REFRESH_TOKEN (local .env + Render).

Prereqs (Google Cloud Console, ~5 min):
  1. Create/select a project
  2. Enable "Gmail API"
  3. OAuth consent screen → External (or Internal for Workspace) → add scope gmail.send
  4. Credentials → Create OAuth client ID → Application type: Desktop app
  5. Copy Client ID + Client Secret

Usage:
  set GMAIL_OAUTH_CLIENT_ID=...
  set GMAIL_OAUTH_CLIENT_SECRET=...
  python manage.py gmail_oauth_setup

Sign in as info@neelacapital.com when the browser opens.
"""
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from api.gmail_api_backend import GMAIL_SEND_SCOPE


class Command(BaseCommand):
    help = "Authorize Gmail API and print a refresh token for Render / .env"

    def add_arguments(self, parser):
        parser.add_argument(
            "--client-id",
            default="",
            help="OAuth client ID (or set GMAIL_OAUTH_CLIENT_ID)",
        )
        parser.add_argument(
            "--client-secret",
            default="",
            help="OAuth client secret (or set GMAIL_OAUTH_CLIENT_SECRET)",
        )
        parser.add_argument(
            "--test-to",
            default="",
            help="Optional address to send a test email after auth",
        )

    def handle(self, *args, **options):
        try:
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
        except ImportError as exc:
            raise CommandError(
                "Missing Google libraries. Run: pip install google-api-python-client "
                "google-auth google-auth-oauthlib google-auth-httplib2"
            ) from exc

        client_id = (
            (options.get("client_id") or "").strip()
            or (getattr(settings, "GMAIL_OAUTH_CLIENT_ID", None) or "").strip()
        )
        client_secret = (
            (options.get("client_secret") or "").strip()
            or (getattr(settings, "GMAIL_OAUTH_CLIENT_SECRET", None) or "").strip()
        )
        if not client_id or not client_secret:
            raise CommandError(
                "Provide --client-id and --client-secret, or set "
                "GMAIL_OAUTH_CLIENT_ID and GMAIL_OAUTH_CLIENT_SECRET in .env"
            )

        client_config = {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"],
            }
        }

        self.stdout.write(self.style.WARNING(
            "A browser window will open. Sign in as the mailbox that should send mail "
            "(info@neelacapital.com) and allow gmail.send."
        ))

        flow = InstalledAppFlow.from_client_config(client_config, scopes=[GMAIL_SEND_SCOPE])
        creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")

        if not creds.refresh_token:
            raise CommandError(
                "No refresh_token returned. Revoke prior access at "
                "https://myaccount.google.com/permissions then run this again with prompt=consent."
            )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=== Save these on Render and in backend/.env ==="))
        self.stdout.write(f"GMAIL_OAUTH_CLIENT_ID={client_id}")
        self.stdout.write(f"GMAIL_OAUTH_CLIENT_SECRET={client_secret}")
        self.stdout.write(f"GMAIL_OAUTH_REFRESH_TOKEN={creds.refresh_token}")
        self.stdout.write("EMAIL_BACKEND=api.gmail_api_backend.GmailApiEmailBackend")
        self.stdout.write("DEFAULT_FROM_EMAIL=Neela Capital <info@neelacapital.com>")
        self.stdout.write("")

        test_to = (options.get("test_to") or "").strip()
        if test_to:
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
            service = build("gmail", "v1", credentials=creds, cache_discovery=False)
            import base64
            from email.mime.text import MIMEText

            msg = MIMEText(
                "Neela Gmail API test — if you received this, production email will work on Render.",
                "plain",
                "utf-8",
            )
            msg["to"] = test_to
            msg["from"] = getattr(settings, "DEFAULT_FROM_EMAIL", "info@neelacapital.com")
            msg["subject"] = "Neela Gmail API test"
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("ascii").rstrip("=")
            service.users().messages().send(userId="me", body={"raw": raw}).execute()
            self.stdout.write(self.style.SUCCESS(f"Test email sent to {test_to}"))
