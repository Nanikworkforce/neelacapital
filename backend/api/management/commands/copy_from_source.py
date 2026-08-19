import os
import subprocess
import sys
import tempfile
from pathlib import Path

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Copy rows from SOURCE_DATABASE_URL (Neon) into the current DB (Hostinger)."

    def handle(self, *args, **options):
        if os.environ.get("RUN_SOURCE_COPY") != "1":
            self.stdout.write("RUN_SOURCE_COPY is not 1 — skipping.")
            return

        source = os.environ.get("SOURCE_DATABASE_URL")
        if not source:
            self.stderr.write("SOURCE_DATABASE_URL is missing.")
            return

        dump_path = Path(tempfile.gettempdir()) / "neela_neon_dump.json"
        env = os.environ.copy()
        env["DATABASE_URL"] = source

        self.stdout.write("Dumping Neon...")
        subprocess.check_call(
            [
                sys.executable,
                "manage.py",
                "dumpdata",
                "--natural-foreign",
                "--natural-primary",
                "--exclude",
                "contenttypes",
                "--exclude",
                "auth.permission",
                "--exclude",
                "sessions",
                "--exclude",
                "admin.logentry",
                "--exclude",
                "django_celery_results",
                "-o",
                str(dump_path),
            ],
            env=env,
        )

        self.stdout.write("Flushing Hostinger tables...")
        call_command("flush", "--no-input")

        self.stdout.write("Loading dump into Hostinger...")
        call_command("loaddata", str(dump_path))
        dump_path.unlink(missing_ok=True)
        self.stdout.write(self.style.SUCCESS("Copy finished."))
