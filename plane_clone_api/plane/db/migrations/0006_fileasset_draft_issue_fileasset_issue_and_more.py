# Generated by Django 4.2.11 on 2024-11-20 08:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0005_apitoken_apiactivitylog'),
    ]

    operations = [
        migrations.AddField(
            model_name='fileasset',
            name='draft_issue',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assets', to='db.draftissue'),
        ),
        migrations.AddField(
            model_name='fileasset',
            name='issue',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assets', to='db.issue'),
        ),
        migrations.AddField(
            model_name='fileasset',
            name='project',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assets', to='db.project'),
        ),
        migrations.AddField(
            model_name='fileasset',
            name='workspace',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assets', to='db.workspace'),
        ),
    ]
