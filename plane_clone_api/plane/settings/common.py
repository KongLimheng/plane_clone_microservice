import os
from pathlib import Path
import ssl
import dj_database_url
from dotenv import load_dotenv
import certifi

# Load environment variables from .env file
load_dotenv()

env = os.getenv
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-*-hlg0v@y2a)48)m*!qyj(ajt4!u=x5(xw4rq@4!@up6v902$+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = int(env("DEBUG", "0"))

ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Inhouse apps
    "plane.authentication",
    "plane.db",
    "plane.middleware",
    "plane.license",
    "plane.space",
    "plane.app",

    # Third-party things
    "rest_framework",
    "corsheaders",
    "django_celery_beat",
    "storages",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "crum.CurrentRequestUserMiddleware",
    "django.middleware.gzip.GZipMiddleware",
]

# Rest Framework settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    # "EXCEPTION_HANDLER": "plane.authentication.adapter.exception.auth_exception_handler",
}

# Django Auth Backend
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
)  # default

ROOT_URLCONF = 'plane.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ["templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
# CORS Settings
CORS_ALLOW_CREDENTIALS = True
cors_origins_raw = env("CORS_ALLOWED_ORIGINS", "")
# filter out empty strings
cors_allowed_origins = [
    origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()
]

if cors_allowed_origins:
    CORS_ALLOWED_ORIGINS = cors_allowed_origins
    secure_origins = (
        False
        if [origin for origin in cors_allowed_origins if "http:" in origin]
        else True
    )
else:
    CORS_ALLOW_ALL_ORIGINS = True
    secure_origins = False

WSGI_APPLICATION = 'plane.wsgi.application'
ASGI_APPLICATION = "plane.asgi.application"

# Django Sites
SITE_ID = 1

# User Model
AUTH_USER_MODEL = "db.User"

# Database
if bool(env("DATABASE_URL")):
    # Parse database configuration from $DATABASE_URL
    DATABASES = {
        "default": dj_database_url.config(),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("POSTGRES_DB"),
            "USER": env("POSTGRES_USER"),
            "PASSWORD": env("POSTGRES_PASSWORD"),
            "HOST": env("POSTGRES_HOST"),
            "PORT": env("POSTGRES_PORT", "5432"),
        }
    }

# Redis Config
REDIS_URL = env("REDIS_URL")
REDIS_SSL = REDIS_URL and "rediss" in REDIS_URL

if REDIS_SSL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "CONNECTION_POOL_KWARGS": {"ssl_cert_reqs": False},
            },
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
# Password reset time the number of seconds the uniquely generated uid will be valid
PASSWORD_RESET_TIMEOUT = 3600

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static-assets", "collected-static")
STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)

# Media Settings
MEDIA_ROOT = "mediafiles"
MEDIA_URL = "/media/"
# Internationalization

# Internationalization
LANGUAGE_CODE = "en-us"
USE_I18N = True
USE_L10N = True

# Timezones
USE_TZ = True
TIME_ZONE = "UTC"
# Default primary key field type

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Storage Settings
# Use Minio settings
USE_MINIO = int(env("USE_MINIO", 0)) == 1

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

STORAGES["default"] = {
    "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
}

# AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "access-key")
# AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "secret-key")
# AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_S3_BUCKET_NAME", "uploads")
# AWS_REGION = os.environ.get("AWS_REGION", "")
# AWS_DEFAULT_ACL = "public-read"
# AWS_QUERYSTRING_AUTH = False
# AWS_S3_FILE_OVERWRITE = False
# AWS_S3_ENDPOINT_URL = os.environ.get(
#     "AWS_S3_ENDPOINT_URL", None
# ) or os.environ.get("MINIO_ENDPOINT_URL", None)
# if AWS_S3_ENDPOINT_URL and USE_MINIO:
#     parsed_url = urlparse(os.environ.get("WEB_URL", "http://localhost"))
#     AWS_S3_CUSTOM_DOMAIN = f"{parsed_url.netloc}/{AWS_STORAGE_BUCKET_NAME}"
#     AWS_S3_URL_PROTOCOL = f"{parsed_url.scheme}:"

# Celery Configuration
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["application/json"]

if REDIS_SSL:
    redis_url = env("REDIS_URL")
    broker_url = f"{redis_url}?ssl_cert_reqs={ssl.CERT_NONE.name}&ssl_ca_certs={certifi.where()}"
    CELERY_BROKER_URL = broker_url
else:
    CELERY_BROKER_URL = REDIS_URL

# CELERY_IMPORTS = (
#     # scheduled tasks
#     "plane.bgtasks.issue_automation_task",
#     "plane.bgtasks.exporter_expired_task",
#     "plane.bgtasks.file_asset_task",
#     "plane.bgtasks.email_notification_task",
#     "plane.bgtasks.api_logs_task",
#     # management tasks
#     "plane.bgtasks.dummy_data_task",
# )

# Sentry Settings
# Enable Sentry Settings
# if bool(os.environ.get("SENTRY_DSN", False)) and os.environ.get(
#     "SENTRY_DSN"
# ).startswith("https://"):
#     sentry_sdk.init(
#         dsn=os.environ.get("SENTRY_DSN", ""),
#         integrations=[
#             DjangoIntegration(),
#             RedisIntegration(),
#             CeleryIntegration(monitor_beat_tasks=True),
#         ],
#         traces_sample_rate=1,
#         send_default_pii=True,
#         environment=os.environ.get("SENTRY_ENVIRONMENT", "development"),
#         profiles_sample_rate=float(
#             os.environ.get("SENTRY_PROFILE_SAMPLE_RATE", 0.5)
#         ),
#     )


# Application Envs
PROXY_BASE_URL = env("PROXY_BASE_URL", False)  # For External
FILE_SIZE_LIMIT = int(env("FILE_SIZE_LIMIT", 5242880))  # 5m

# Unsplash Access key
UNSPLASH_ACCESS_KEY = env("UNSPLASH_ACCESS_KEY")
# Github Access Token
GITHUB_ACCESS_TOKEN = env("GITHUB_ACCESS_TOKEN", False)

# # Analytics
# ANALYTICS_SECRET_KEY = env("ANALYTICS_SECRET_KEY", False)
# ANALYTICS_BASE_API = env("ANALYTICS_BASE_API", False)

# instance key
INSTANCE_KEY = env(
    "INSTANCE_KEY",
    "ae6517d563dfc13d8270bd45cf17b08f70b37d989128a9dab46ff687603333c3",
)

# Skip environment variable configuration
SKIP_ENV_VAR = env("SKIP_ENV_VAR", "1") == "1"

DATA_UPLOAD_MAX_MEMORY_SIZE = FILE_SIZE_LIMIT

# Cookie Settings
SESSION_COOKIE_SECURE = secure_origins
SESSION_COOKIE_HTTPONLY = True
SESSION_ENGINE = "plane.db.models.session"
SESSION_COOKIE_AGE = env("SESSION_COOKIE_AGE", 604800)
SESSION_COOKIE_NAME = "plane-session-id"
SESSION_COOKIE_DOMAIN = env("COOKIE_DOMAIN", None)
SESSION_SAVE_EVERY_REQUEST = (
    env("SESSION_SAVE_EVERY_REQUEST", "0") == "1"
)

# Admin Cookie
ADMIN_SESSION_COOKIE_NAME = "plane-admin-session-id"
ADMIN_SESSION_COOKIE_AGE = env("ADMIN_SESSION_COOKIE_AGE", 3600)

# CSRF cookies
CSRF_COOKIE_SECURE = secure_origins
CSRF_COOKIE_HTTPONLY = True
CSRF_TRUSTED_ORIGINS = cors_allowed_origins
CSRF_COOKIE_DOMAIN = env("COOKIE_DOMAIN", None)
# CSRF_FAILURE_VIEW = "plane.authentication.views.common.csrf_failure"

# Base URLs
ADMIN_BASE_URL = os.environ.get("ADMIN_BASE_URL", None)
SPACE_BASE_URL = os.environ.get("SPACE_BASE_URL", None)
APP_BASE_URL = os.environ.get("APP_BASE_URL")
