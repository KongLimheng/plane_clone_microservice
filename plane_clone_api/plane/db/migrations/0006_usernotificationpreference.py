# Generated by Django 4.2.11 on 2024-11-01 04:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0005_project_projectmemberinvite_projectmember_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserNotificationPreference',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('property_change', models.BooleanField(default=True)),
                ('state_change', models.BooleanField(default=True)),
                ('comment', models.BooleanField(default=True)),
                ('mention', models.BooleanField(default=True)),
                ('issue_completed', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('project', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='project_notification_preferences', to='db.project')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notification_preferences', to=settings.AUTH_USER_MODEL)),
                ('workspace', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='workspace_notification_preferences', to='db.workspace')),
            ],
            options={
                'verbose_name': 'UserNotificationPreference',
                'verbose_name_plural': 'UserNotificationPreferences',
                'db_table': 'user_notification_preferences',
                'ordering': ('-created_at',),
            },
        ),
    ]
