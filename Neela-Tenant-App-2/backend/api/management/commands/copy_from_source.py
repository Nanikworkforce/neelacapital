import json
import os
import uuid
from datetime import date, datetime
from decimal import Decimal

import psycopg2
from django.core.management.base import BaseCommand
from django.db import connection


SKIP_TABLES = {
    "django_migrations",
    "django_session",
    "django_celery_results_taskresult",
    "django_celery_results_groupresult",
    "django_celery_results_chordcounter",
}


def convert(value):
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, memoryview):
        return bytes(value)
    if isinstance(value, (datetime, date)):
        return value
    if isinstance(value, bool):
        return int(value)
    return value


class Command(BaseCommand):
    help = "Copy rows from SOURCE_DATABASE_URL (Neon Postgres) into Hostinger MySQL."

    def handle(self, *args, **options):
        if os.environ.get("RUN_SOURCE_COPY") != "1":
            self.stdout.write("RUN_SOURCE_COPY is not 1 — skipping.")
            return

        source = os.environ.get("SOURCE_DATABASE_URL")
        if not source:
            self.stderr.write("SOURCE_DATABASE_URL is missing.")
            return

        self.stdout.write("Connecting to Neon...")
        pg = psycopg2.connect(source)
        pg_cur = pg.cursor()
        pg_cur.execute(
            """
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
            """
        )
        tables = [row[0] for row in pg_cur.fetchall()]

        mysql = connection.cursor()
        mysql.execute("SET FOREIGN_KEY_CHECKS=0")
        copied = 0
        for table in tables:
            if table in SKIP_TABLES:
                continue
            pg_cur.execute(f'SELECT * FROM "{table}"')
            cols = [col[0] for col in pg_cur.description]
            rows = pg_cur.fetchall()
            mysql.execute(f"DELETE FROM `{table}`")
            if not rows:
                self.stdout.write(f"{table}: 0")
                continue
            placeholders = ",".join(["%s"] * len(cols))
            colsql = ",".join(f"`{c}`" for c in cols)
            payload = [tuple(convert(v) for v in row) for row in rows]
            mysql.executemany(
                f"INSERT INTO `{table}` ({colsql}) VALUES ({placeholders})",
                payload,
            )
            copied += len(payload)
            self.stdout.write(f"{table}: {len(payload)}")

        mysql.execute("SET FOREIGN_KEY_CHECKS=1")
        mysql.close()
        pg_cur.close()
        pg.close()
        self.stdout.write(self.style.SUCCESS(f"Copy finished. {copied} rows."))
