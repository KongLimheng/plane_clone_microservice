from .user import urlpatterns as user_urls
from .workspace import urlpatterns as workspace_urls
from .external import urlpatterns as external_urls
from .notification import urlpatterns as notification_urls
from .dashboard import urlpatterns as dashboard_urls


urlpatterns = [
    *user_urls,
    *workspace_urls,
    *external_urls,
    *notification_urls,
    *dashboard_urls,
]
