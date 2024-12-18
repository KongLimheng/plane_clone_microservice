import uuid
import re
from datetime import timedelta
from django.utils import timezone


# The date from pattern
pattern = re.compile(r"\d+_(weeks|months)$")
# check the valid uuids


def date_filter(issue_filter, date_term, queries):
    """
    Handle all date filters
    """
    for query in queries:
        date_query = query.split(";")
        if date_query:
            if len(date_query) >= 2:
                match = pattern.match(date_query[0])
                if match:
                    if len(date_query) == 3:
                        ...
                else:
                    if "after" in date_query:
                        issue_filter[f"{date_term}__gte"] = date_query[0]
                    else:
                        issue_filter[f"{date_term}__lte"] = date_query[0]
            else:
                issue_filter[f"{date_term}__contains"] = date_query[0]


# check the valid uuids
def filter_valid_uuids(uuid_list):
    valid_uuids = []
    for uuid_str in uuid_list:
        try:
            uuid_obj = uuid.UUID(uuid_str)
            valid_uuids.append(uuid_obj)
        except ValueError:
            # ignore the invalid uuids
            pass
    return valid_uuids


def filter_state(params, issue_filter, method, prefix=""):
    if method == "GET":
        states = [
            item for item in params.get("state").split(",") if item != "null"
        ]
        states = filter_valid_uuids(states)
        if len(states) and "" not in states:
            issue_filter[f"{prefix}state__in"] = states

    else:
        if (
            params.get("state", None)
            and len(params.get("state"))
            and params.get("state") != "null"
        ):
            issue_filter[f"{prefix}state__in"] = params.get("state")
    return issue_filter


def filter_target_date(params, issue_filter, method, prefix=""):
    if method == "GET":
        target_dates = params.get("target_date").split(',')
        if len(target_dates) and "" not in target_dates:
            date_filter(
                issue_filter,
                date_term=f"{prefix}target_date",
                queries=target_dates
            )

    else:
        if params.get("target_date", None) and len(params.get("target_date")):
            issue_filter[f"{prefix}target_date"] = params.get("target_date")

    return issue_filter


def issue_filters(query_params, method, prefix=""):
    issue_filter = {}

    ISSUE_FILTER = {
        "state": filter_state,
        # "state_group": filter_state_group,
        # "estimate_point": filter_estimate_point,
        # "priority": filter_priority,
        # "parent": filter_parent,
        # "labels": filter_labels,
        # "assignees": filter_assignees,
        # "mentions": filter_mentions,
        # "created_by": filter_created_by,
        # "logged_by": filter_logged_by,
        # "name": filter_name,
        # "created_at": filter_created_at,
        # "updated_at": filter_updated_at,
        # "start_date": filter_start_date,
        "target_date": filter_target_date,
        # "completed_at": filter_completed_at,
        # "type": filter_issue_state_type,
        # "project": filter_project,
        # "cycle": filter_cycle,
        # "module": filter_module,
        # "intake_status": filter_intake_status,
        # "inbox_status": filter_inbox_status,
        # "sub_issue": filter_sub_issue_toggle,
        # "subscriber": filter_subscribed_issues,
        # "start_target_date": filter_start_target_date_issues,
    }

    for key, value in ISSUE_FILTER.items():
        if key in query_params:
            func = value
            func(query_params, issue_filter, method, prefix)

    return issue_filter
