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
