import csv
import io
import os
import uuid
import zipfile
from celery import shared_task
from openpyxl import Workbook
from plane.db.models import ExporterHistory, Issue
from plane.utils.exception_logger import log_exception
from django.conf import settings


def dateTimeConverter(time):
    if time:
        return time.strftime("%a, %d %b %Y %I:%M:%S %Z%z")


def dateConverter(time):
    if time:
        return time.strftime("%a, %d %b %Y")


def generate_table_row(issue):
    return [
        f"""{issue["project__identifier"]}-{issue["sequence_id"]}""",
        issue["project__name"],
        issue["name"],
        issue["description_stripped"],
        issue["state__name"],
        dateConverter(issue["start_date"]),
        dateConverter(issue["target_date"]),
        issue["priority"],
        (
            f"{issue['created_by__first_name']} {issue['created_by__last_name']}"
            if issue["created_by__first_name"]
            and issue["created_by__last_name"]
            else ""
        ),
        (
            f"{issue['assignees__first_name']} {issue['assignees__last_name']}"
            if issue["assignees__first_name"] and issue["assignees__last_name"]
            else ""
        ),
        issue["labels__name"] if issue["labels__name"] else "",
        issue["issue_cycle__cycle__name"],
        dateConverter(issue["issue_cycle__cycle__start_date"]),
        dateConverter(issue["issue_cycle__cycle__end_date"]),
        issue["issue_module__module__name"],
        dateConverter(issue["issue_module__module__start_date"]),
        dateConverter(issue["issue_module__module__target_date"]),
        dateTimeConverter(issue["created_at"]),
        dateTimeConverter(issue["updated_at"]),
        dateTimeConverter(issue["completed_at"]),
        dateTimeConverter(issue["archived_at"]),
    ]


def update_table_row(rows, row):
    matched_index = next(
        (index for index, existing_row in enumerate(
            rows) if existing_row[0] == row[0]),
        None,
    )

    if matched_index is not None:
        existing_assignees, existing_labels = rows[matched_index][7:9]
        assignee, label = row[7:9]

        if assignee is not None and (
            existing_assignees is None or label not in existing_assignees
        ):
            rows[matched_index][8] += f", {assignee}"
        if label is not None and (
            existing_labels is None or label not in existing_labels
        ):
            rows[matched_index][8] += f", {label}"
    else:
        rows.append(row)


def create_csv_file(data):
    csv_buffer = io.StringIO()
    csv_writer = csv.writer(csv_buffer, delimiter=',', quoting=csv.QUOTE_ALL)
    for row in data:
        csv_writer.writerow(row)

    csv_buffer.seek(0)
    return csv_buffer.getvalue()


def create_xlsx_file(data):
    workbook = Workbook()
    sheet = workbook.active

    for row in data:
        sheet.append(row)
    xlsx_buffer = io.BytesIO()
    workbook.save(xlsx_buffer)
    xlsx_buffer.seek(0)
    return xlsx_buffer.getvalue()


def generate_csv(header, project_id, issues, files: list):
    """
    Generate CSV export for all the passed issues.
    """
    rows = [header]
    for issue in issues:
        row = generate_table_row(issue)
        update_table_row(row)
    csv_file = create_csv_file(rows)
    files.append((f"{project_id}.csv", csv_file))


def generate_xlsx(header, project_id, issues, files):
    rows = [header]
    for issue in issues:
        row = generate_table_row(issue)
        update_table_row(rows, row)
    xlsx_file = create_xlsx_file(rows)
    files.append((f"{project_id}.xlsx", xlsx_file))


def create_zip_file(files):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for filename, file_content in files:
            zipf.writestr(filename, file_content)

    zip_buffer.seek(0)
    return zip_buffer


@shared_task
def issue_export_task(provider, workspace_id, project_ids, token_id, multiple, slug, req):
    try:
        exporter_instance = ExporterHistory.objects.get(token=token_id)
        exporter_instance.status = "processing"
        exporter_instance.save(update_fields=["status"])

        workspace_issues = (
            (
                Issue.objects.filter(
                    workspace__id=workspace_id,
                    project_id__in=project_ids,
                    project__project_projectmember__member=exporter_instance.initiated_by_id,
                    project__project_projectmember__is_active=True,
                    project__archived_at__isnull=True,
                ).select_related("project", "workspace", "state", "parent", "created_by")
                .prefetch_related("assignees", "labels", "issue_cycle__cycle", "issue_module__module")
                .values(
                    "id",
                    "project__identifier",
                    "project__name",
                    "project__id",
                    "sequence_id",
                    "name",
                    "description_stripped",
                    "priority",
                    "start_date",
                    "target_date",
                    "state__name",
                    "created_at",
                    "updated_at",
                    "completed_at",
                    "archived_at",
                    "issue_cycle__cycle__name",
                    "issue_cycle__cycle__start_date",
                    "issue_cycle__cycle__end_date",
                    "issue_module__module__name",
                    "issue_module__module__start_date",
                    "issue_module__module__target_date",
                    "created_by__first_name",
                    "created_by__last_name",
                    "assignees__first_name",
                    "assignees__last_name",
                    "labels__name",
                )
            )
            .order_by("project__identifier", "sequence_id")
            .distinct()
        )

        # CSV header
        header = [
            "ID",
            "Project",
            "Name",
            "Description",
            "State",
            "Start Date",
            "Target Date",
            "Priority",
            "Created By",
            "Assignee",
            "Labels",
            "Cycle Name",
            "Cycle Start Date",
            "Cycle End Date",
            "Module Name",
            "Module Start Date",
            "Module Target Date",
            "Created At",
            "Updated At",
            "Completed At",
            "Archived At",
        ]

        EXPORTER_MAPPER = {
            "csv": generate_csv,
            # "json": generate_json,
            "xlsx": generate_xlsx,
        }

        files = []
        exporter = EXPORTER_MAPPER.get(provider)
        if multiple:
            for project_id in project_ids:
                issues = workspace_issues.filter(project__id=project_id)

                if exporter is not None:
                    exporter(header, project_id, issues, files)
        else:
            if exporter is not None:
                exporter(header, workspace_id, workspace_issues, files)

        zip_buffer = create_zip_file(files)

        zipUrl = f'{settings.STATICFILES_DIRS[0]}{settings.MEDIA_URL}'
        zipName = f"{uuid.uuid4().hex}.zip"
        with open(f"{zipUrl}{zipName}", 'wb') as f:
            f.write(zip_buffer.getbuffer())
            f.close()

        backendUrl = f"""{"https" if req.is_secure() else "http"}://{req.get_host()}"""

        exporter_instance.status = 'completed'
        exporter_instance.url = f'{backendUrl}/statics/uploads/{zipName}'
        exporter_instance.save(update_fields=['status', 'url'])

    except Exception as e:
        exporter_instance = ExporterHistory.objects.get(token=token_id)
        exporter_instance.status = "failed"
        exporter_instance.reason = str(e)
        exporter_instance.save(update_fields=["status", "reason"])
        log_exception(e)
        return