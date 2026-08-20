"""
WSGI config for Kalpanaaa project.

It exposes the WSGI callable as a module-level variable named ``application``.
For Vercel serverless deployment, ``app = application`` is exposed.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Kalpanaaa.settings')

application = get_wsgi_application()
app = application
