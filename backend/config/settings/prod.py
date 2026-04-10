from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import BASE_DIR, env, env_bool, env_list

SECRET_KEY = env("SECRET_KEY", required=True)
DEBUG = False

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS")
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("ALLOWED_HOSTS must not be empty in production.")

db_engine = env("DB_ENGINE", "django.db.backends.sqlite3")

if db_engine == "django.db.backends.sqlite3":
    db_name = env("DB_NAME", str(BASE_DIR / "db.sqlite3"))
else:
    db_name = env("DB_NAME", required=True)

DATABASES = {
    "default": {
        "ENGINE": db_engine,
        "NAME": db_name,
        "USER": env("DB_USER", ""),
        "PASSWORD": env("DB_PASSWORD", ""),
        "HOST": env("DB_HOST", ""),
        "PORT": env("DB_PORT", ""),
        "CONN_MAX_AGE": int(env("CONN_MAX_AGE", "60")),
    }
}

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SAMESITE = env("SESSION_COOKIE_SAMESITE", "Lax")
CSRF_COOKIE_SAMESITE = env("CSRF_COOKIE_SAMESITE", "Lax")

USE_HTTPS = env_bool("USE_HTTPS", True)

SESSION_COOKIE_SECURE = USE_HTTPS
CSRF_COOKIE_SECURE = USE_HTTPS
SECURE_SSL_REDIRECT = USE_HTTPS
SECURE_CONTENT_TYPE_NOSNIFF = True

if USE_HTTPS:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_HSTS_SECONDS = int(env("SECURE_HSTS_SECONDS", "3600"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool(
        "SECURE_HSTS_INCLUDE_SUBDOMAINS",
        False,
    )
    SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", False)
