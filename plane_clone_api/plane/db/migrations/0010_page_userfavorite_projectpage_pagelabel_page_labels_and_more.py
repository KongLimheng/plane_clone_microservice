# Generated by Django 4.2.11 on 2024-12-11 04:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import plane.db.models.page
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0009_issuecomment_issueactivity'),
    ]

    operations = [
        migrations.CreateModel(
            name='Page',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(blank=True, max_length=255)),
                ('description', models.JSONField(blank=True, default=dict)),
                ('description_binary', models.BinaryField(null=True)),
                ('description_html', models.TextField(blank=True, default='<p></p>')),
                ('description_stripped', models.TextField(blank=True, null=True)),
                ('access', models.PositiveSmallIntegerField(choices=[(0, 'Public'), (1, 'Private')], default=0)),
                ('color', models.CharField(blank=True, max_length=255)),
                ('archived_at', models.DateField(null=True)),
                ('is_locked', models.BooleanField(default=False)),
                ('view_props', models.JSONField(default=plane.db.models.page.get_view_props)),
                ('logo_props', models.JSONField(default=dict)),
                ('is_global', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
            ],
            options={
                'verbose_name': 'Page',
                'verbose_name_plural': 'Pages',
                'db_table': 'pages',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='UserFavorite',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('entity_type', models.CharField(max_length=100)),
                ('entity_identifier', models.UUIDField(blank=True, null=True)),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
                ('is_folder', models.BooleanField(default=False)),
                ('sequence', models.FloatField(default=65535)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='parent_folder', to='db.userfavorite')),
                ('project', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='project_%(class)s', to='db.project')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorites', to=settings.AUTH_USER_MODEL)),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workspace_%(class)s', to='db.workspace')),
            ],
            options={
                'verbose_name': 'User Favorite',
                'verbose_name_plural': 'User Favorites',
                'db_table': 'user_favorites',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='ProjectPage',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_pages', to='db.page')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_pages', to='db.project')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_pages', to='db.workspace')),
            ],
            options={
                'verbose_name': 'Project Page',
                'verbose_name_plural': 'Project Pages',
                'db_table': 'project_pages',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='PageLabel',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('label', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='page_labels', to='db.label')),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='page_labels', to='db.page')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workspace_page_label', to='db.workspace')),
            ],
            options={
                'verbose_name': 'Page Label',
                'verbose_name_plural': 'Page Labels',
                'db_table': 'page_labels',
                'ordering': ('-created_at',),
            },
        ),
        migrations.AddField(
            model_name='page',
            name='labels',
            field=models.ManyToManyField(blank=True, related_name='pages', through='db.PageLabel', to='db.label'),
        ),
        migrations.AddField(
            model_name='page',
            name='owned_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pages', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='page',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='child_page', to='db.page'),
        ),
        migrations.AddField(
            model_name='page',
            name='projects',
            field=models.ManyToManyField(related_name='pages', through='db.ProjectPage', to='db.project'),
        ),
        migrations.AddField(
            model_name='page',
            name='updated_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By'),
        ),
        migrations.AddField(
            model_name='page',
            name='workspace',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pages', to='db.workspace'),
        ),
        migrations.AddConstraint(
            model_name='userfavorite',
            constraint=models.UniqueConstraint(condition=models.Q(('deleted_at__isnull', True)), fields=('entity_type', 'entity_identifier', 'user'), name='user_favorite_unique_entity_type_entity_identifier_user_when_deleted_at_null'),
        ),
        migrations.AlterUniqueTogether(
            name='userfavorite',
            unique_together={('entity_type', 'user', 'entity_identifier', 'deleted_at')},
        ),
        migrations.AddConstraint(
            model_name='projectpage',
            constraint=models.UniqueConstraint(condition=models.Q(('deleted_at__isnull', True)), fields=('project', 'page'), name='project_page_unique_project_page_when_deleted_at_null'),
        ),
        migrations.AlterUniqueTogether(
            name='projectpage',
            unique_together={('project', 'page', 'deleted_at')},
        ),
    ]
