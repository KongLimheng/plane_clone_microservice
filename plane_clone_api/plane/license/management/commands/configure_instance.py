# Python imports
import os
# Django imports
from django.core.management.base import BaseCommand
from plane.license.utils.encryption import encrypt_data
from plane.license.utils.instance_value import get_configuration_value
from plane.settings.common import env
# Module imports
from plane.license.models import InstanceConfiguration


class Command(BaseCommand):
    help = "Configure instance variables"

    def handle(self, *args, **options) -> str | None:
        config_keys = [
            # Authentication Settings
            {
                "key": "ENABLE_SIGNUP",
                "value": env("ENABLE_SIGNUP", "1"),
                "category": "AUTHENTICATION",
                "is_encrypted": False,
            },
            {
                "key": "ENABLE_EMAIL_PASSWORD",
                "value": env("ENABLE_EMAIL_PASSWORD", "1"),
                "category": "AUTHENTICATION",
                "is_encrypted": False,
            },
            {
                "key": "ENABLE_MAGIC_LINK_LOGIN",
                "value": env("ENABLE_MAGIC_LINK_LOGIN", "0"),
                "category": "AUTHENTICATION",
                "is_encrypted": False,
            },
            {
                "key": "GOOGLE_CLIENT_ID",
                "value": env("GOOGLE_CLIENT_ID"),
                "category": "GOOGLE",
                "is_encrypted": False,
            },
            {
                "key": "GOOGLE_CLIENT_SECRET",
                "value": env("GOOGLE_CLIENT_SECRET"),
                "category": "GOOGLE",
                "is_encrypted": True,
            },
            {
                "key": "GITHUB_CLIENT_ID",
                "value": env("GITHUB_CLIENT_ID"),
                "category": "GITHUB",
                "is_encrypted": False,
            },
            {
                "key": "GITHUB_CLIENT_SECRET",
                "value": env("GITHUB_CLIENT_SECRET"),
                "category": "GITHUB",
                "is_encrypted": True,
            },
            {
                "key": "EMAIL_HOST",
                "value": env("EMAIL_HOST", ""),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "EMAIL_HOST_USER",
                "value": env("EMAIL_HOST_USER", ""),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "EMAIL_HOST_PASSWORD",
                "value": env("EMAIL_HOST_PASSWORD", ""),
                "category": "SMTP",
                "is_encrypted": True,
            },
            {
                "key": "EMAIL_PORT",
                "value": env("EMAIL_PORT", "587"),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "EMAIL_FROM",
                "value": env("EMAIL_FROM", ""),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "EMAIL_USE_TLS",
                "value": env("EMAIL_USE_TLS", "1"),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "EMAIL_USE_SSL",
                "value": env("EMAIL_USE_SSL", "0"),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "OPENAI_API_KEY",
                "value": env("OPENAI_API_KEY"),
                "category": "OPENAI",
                "is_encrypted": True,
            },
            {
                "key": "GPT_ENGINE",
                "value": env("GPT_ENGINE", "gpt-3.5-turbo"),
                "category": "SMTP",
                "is_encrypted": False,
            },
            {
                "key": "UNSPLASH_ACCESS_KEY",
                "value": env("UNSPLASH_ACESS_KEY", ""),
                "category": "UNSPLASH",
                "is_encrypted": True,
            },
        ]

        for item in config_keys:
            obj, created = InstanceConfiguration.objects.get_or_create(
                key=item.get("key")
            )
            if created:
                obj.category = item.get('category')
                obj.is_encrypted = item.get("is_encrypted", False)
                if item.get("is_encrypted", False):
                    obj.value = encrypt_data(item.get('value'))
                else:
                    obj.value = item.get('value')
                obj.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{obj.key} loaded with value from environment variable."
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"{obj.key} configuration already exists"
                    )
                )

        keys = ["IS_GOOGLE_ENABLED", "IS_GITHUB_ENABLED"]
        if not InstanceConfiguration.objects.filter(key__in=keys).exists():
            for key in keys:
                if key == "IS_GOOGLE_ENABLED":
                    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET = (
                        get_configuration_value(
                            [
                                {
                                    "key": "GOOGLE_CLIENT_ID",
                                    "default": env(
                                        "GOOGLE_CLIENT_ID", ""
                                    ),
                                },
                                {
                                    "key": "GOOGLE_CLIENT_SECRET",
                                    "default": env(
                                        "GOOGLE_CLIENT_SECRET", "0"
                                    ),
                                },
                            ]
                        )
                    )

                    value = '1' if bool(GOOGLE_CLIENT_ID) and bool(
                        GOOGLE_CLIENT_SECRET) else "0"

                    InstanceConfiguration.objects.create(
                        key=key,
                        value=value,
                        category="AUTHENTICATION",
                        is_encrypted=False
                    )

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"{key} loaded with value from environment variable."
                        )
                    )

                if key == "IS_GITHUB_ENABLED":
                    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET = (
                        get_configuration_value(
                            [
                                {
                                    "key": "GITHUB_CLIENT_ID",
                                    "default": env(
                                        "GITHUB_CLIENT_ID", ""
                                    ),
                                },
                                {
                                    "key": "GITHUB_CLIENT_SECRET",
                                    "default": env(
                                        "GITHUB_CLIENT_SECRET", "0"
                                    ),
                                },
                            ]
                        )
                    )
                    if bool(GITHUB_CLIENT_ID) and bool(GITHUB_CLIENT_SECRET):
                        value = "1"
                    else:
                        value = "0"
                    InstanceConfiguration.objects.create(
                        key="IS_GITHUB_ENABLED",
                        value=value,
                        category="AUTHENTICATION",
                        is_encrypted=False,
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"{key} loaded with value from environment variable."
                        )
                    )
        else:
            for key in keys:
                self.stdout.write(
                    self.style.WARNING(f"{key} configuration already exists")
                )
