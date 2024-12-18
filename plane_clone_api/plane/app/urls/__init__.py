from .user import urlpatterns as user_urls
from .workspace import urlpatterns as workspace_urls
from .external import urlpatterns as external_urls
from .notification import urlpatterns as notification_urls
from .dashboard import urlpatterns as dashboard_urls
from .search import urlpatterns as search_urls
from .project import urlpatterns as project_urls
from .asset import urlpatterns as asset_urls
from .api import urlpatterns as api_urls
from .issue import urlpatterns as issue_urls
from .page import urlpatterns as page_urls

urlpatterns = [
    *user_urls,
    *workspace_urls,
    *external_urls,
    *notification_urls,
    *dashboard_urls,
    *search_urls,
    *project_urls,
    *asset_urls,
    *api_urls,
    *issue_urls,
    *page_urls
]
