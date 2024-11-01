from django.conf import settings

from plane.license.models import InstanceConfiguration
from plane.license.utils.encryption import decrypt_data
from plane.settings.common import env


def get_configuration_value(keys):
    environment_list = []
    if settings.SKIP_ENV_VAR:
        instance_configuration = InstanceConfiguration.objects.values(
            "key", "value", "is_encrypted"
        )

        for key in keys:
            for item in instance_configuration:
                if key.get('key') == item.get("key"):
                    if item.get("is_encrypted", False):
                        environment_list.append(
                            decrypt_data(item.get("value"))
                        )
                    else:
                        environment_list.append(item.get("value"))
                    break
            else:
                environment_list.append(key.get("default"))

    else:
        for key in keys:
            environment_list.append(
                env(key.get("key"), key.get('default'))
            )
    return tuple(environment_list)


def get_email_configuration():
    return get_configuration_value(
        [
            {
                "key": "EMAIL_HOST",
                "default": env("EMAIL_HOST"),
            },
            {
                "key": "EMAIL_HOST_USER",
                "default": env("EMAIL_HOST_USER"),
            },
            {
                "key": "EMAIL_HOST_PASSWORD",
                "default": env("EMAIL_HOST_PASSWORD"),
            },
            {
                "key": "EMAIL_PORT",
                "default": env("EMAIL_PORT", 587),
            },
            {
                "key": "EMAIL_USE_TLS",
                "default": env("EMAIL_USE_TLS", "1"),
            },
            {
                "key": "EMAIL_USE_SSL",
                "default": env("EMAIL_USE_SSL", "0"),
            },
            {
                "key": "EMAIL_FROM",
                "default": env(
                    "EMAIL_FROM", "Team Plane <team@mailer.plane.so>"
                ),
            },
        ]
    )
