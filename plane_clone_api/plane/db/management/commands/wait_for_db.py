import time
from typing import Any
from django.core.management import BaseCommand
from django.db import DEFAULT_DB_ALIAS, OperationalError, connections
from django.apps import apps


class Command(BaseCommand):
    def handle(self, *app_labels: Any, **options: Any) -> str | None:
        self.stdout.write("Waiting for database....")
        consistency_check_labels = {
            config.label for config in apps.get_app_configs()}

        print(consistency_check_labels)
        db_conn = None
        while not db_conn:
            try:
                db_conn = connections[DEFAULT_DB_ALIAS]
            except OperationalError:
                self.stdout.write("Database unavailable, waiting 1 second...")
                time.sleep(1)
        self.stdout.write(self.style.SUCCESS("Database available!"))
