# Generated by Django 4.2.11 on 2024-12-12 09:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0010_page_userfavorite_projectpage_pagelabel_page_labels_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='PageLog',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('transaction', models.UUIDField(default=uuid.uuid4)),
                ('entity_identifier', models.UUIDField(null=True)),
                ('entity_name', models.CharField(choices=[('to_do', 'To Do'), ('issue', 'issue'), ('image', 'Image'), ('video', 'Video'), ('file', 'File'), ('link', 'Link'), ('cycle', 'Cycle'), ('module', 'Module'), ('back_link', 'Back Link'), ('forward_link', 'Forward Link'), ('page_mention', 'Page Mention'), ('user_mention', 'User Mention')], max_length=30, verbose_name='Transaction Type')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='page_log', to='db.page')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workspace_page_log', to='db.workspace')),
            ],
            options={
                'verbose_name': 'Page Log',
                'verbose_name_plural': 'Page Logs',
                'db_table': 'page_logs',
                'ordering': ('-created_at',),
                'unique_together': {('page', 'transaction')},
            },
        ),
    ]
