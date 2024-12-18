from collections.abc import Sequence
import math
from rest_framework.response import Response
from rest_framework.exceptions import ParseError
# Django imports
from django.db.models import Count, F, Window
from django.db.models.functions import RowNumber

from plane.db.mixins import SoftDeletionQuerySet

MAX_LIMIT = 1000


class Cursor:
    def __init__(self, value, offset=0, is_prev=False, has_results=None):
        self.value = value
        self.offset = int(offset)
        self.is_prev = bool(is_prev)
        self.has_results = has_results

    def __str__(self):
        return f"{self.value}:{self.offset}:{int(self.is_prev)}"

    # Return the cursor value
    def __eq__(self, other):
        return all(
            getattr(self, attr) == getattr(other, attr)
            for attr in ("value", "offset", "is_prev", "has_results")
        )

    def __repr__(self):
        return f"{type(self).__name__,}: value={self.value} offset={self.offset}, is_prev={int(self.is_prev)}"

    def __bool__(self):
        return bool(self.has_results)

    @classmethod
    def from_string(cls, value):
        try:
            bits = value.split(":")
            if len(bits) != 3:
                raise ValueError(
                    "Cursor must be in the format 'value:offset:is_prev'")
            value = float(bits[0]) if "." in bits[0] else int(bits[0])
            return cls(value, int(bits[1]), bool(int(bits[2])))
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid cursor format: {e}")


class CursorResult(Sequence):
    def __init__(self, results, next, prev, hits=None, max_hits=None):
        self.results = results
        self.next = next
        self.prev = prev
        self.hits = hits
        self.max_hits = max_hits

    def __len__(self):
        return len(self.results)

    def __iter__(self):
        return iter(self.results)

    def __getitem__(self, key):
        return self.results[key]

    def __repr__(self):
        return f"<{type(self).__name__}: results={len(self.results)}>"


class BadPaginationError(Exception):
    pass


class OffsetPaginator:
    """
    The Offset paginator using the offset and limit
    with cursor controls
    http://example.com/api/users/?cursor=10.0.0&per_page=10
    cursor=limit,offset=page,
    """

    def __init__(self, queryset, order_by=None, max_limit=MAX_LIMIT, max_offset=None, on_results=None) -> None:
        self.key = (
            order_by
            if order_by is None or isinstance(order_by, (list, tuple, set))
            else (order_by[1::] if order_by.startswith("-") else order_by,)
        )
        # Set desc to true when `-` exists in the order by
        self.desc = True if order_by and order_by.startswith("-") else False
        self.queryset = queryset
        self.max_limit = max_limit
        self.max_offset = max_offset
        self.on_results = on_results

    def get_result(self, limit=1000, cursor: Cursor = None):
        if cursor is None:
            cursor = Cursor(0, 0, 0)

        # Get the min from limit and max limit
        limit = min(limit, self.max_limit)

        queryset = self.queryset
        if self.key:
            queryset = queryset.order_by(
                (
                    F(*self.key).desc(nulls_last=True)
                    if self.desc
                    else F(*self.key).asc(nulls_last=True)
                ),
                "-created_at",
            )
        # The current page
        page = cursor.offset

        # The offset
        offset = cursor.offset * cursor.value
        stop = offset + (cursor.value or limit) + 1

        if self.max_offset is not None and offset >= self.max_offset:
            raise BadPaginationError("Pagination offset too large")

        if offset < 0:
            raise BadPaginationError("Pagination offset cannot be negative")

        results = queryset[offset:stop]
        if cursor.value != limit:
            results = results[-(limit + 1):]

        next_cursor = Cursor(limit, page + 1, False, results.count() > limit)
        prev_cursor = Cursor(limit, page - 1, True, page > 0)

        # Process the results
        results = results[:limit]
        if self.on_results:
            results = self.on_results(results)

        # Count the queryset
        count = queryset.count()

        # Optionally, calculate the total count and max_hits if needed
        max_hits = math.ceil(count / limit)

        return CursorResult(results=results, next=next_cursor, prev=prev_cursor, max_hits=max_hits)

    def process_results(self, results):
        raise NotImplementedError


class BasePaginator:
    # cursor query parameter name

    cursor_name = "cursor"

    def get_per_page(self, request, default_per_page=100, max_per_page=100):
        try:
            per_page = int(request.GET.get("per_page", default_per_page))
        except ValueError:
            raise ParseError(detail="Invalid per_page parameter")

        max_per_page = max(max_per_page, default_per_page)
        if per_page > max_per_page:
            raise ParseError(
                detail=f"Invalid per_page value. Cannot exceed {max_per_page}")

        return per_page

    def paginate(
        self,
            request,
            on_results=None,
            paginator=None,
            paginator_cls=OffsetPaginator,
            default_per_page=1000,
            max_per_page=1000,
            cursor_cls=Cursor,
            extra_stats=None,
            controller=None,
            group_by_field_name=None,
            group_by_fields=None,
            sub_group_by_field_name=None,
            sub_group_by_fields=None,
            count_filter=None,
            **paginator_kwargs,
    ):
        """Paginate the request"""
        per_page = self.get_per_page(request, default_per_page, max_per_page)
        # Convert the cursor value to integer and float from string
        input_cursor = None
        try:
            input_cursor = cursor_cls.from_string(
                request.GET.get(self.cursor_name, f"{per_page}:0:0")
            )
        except ValueError:
            raise ParseError(detail="Invalid cursor parameter.")

        if not paginator:
            if group_by_field_name:
                paginator_kwargs["group_by_field_name"] = group_by_field_name
                paginator_kwargs["group_by_fields"] = group_by_fields
                paginator_kwargs["count_filter"] = count_filter

                if sub_group_by_field_name:
                    paginator_kwargs['sub_group_by_field_name'] = (
                        sub_group_by_field_name
                    )
                    paginator_kwargs["sub_group_by_fields"] = sub_group_by_fields

            paginator = paginator_cls(**paginator_kwargs)

        try:
            cursor_result = paginator.get_result(
                limit=per_page, cursor=input_cursor
            )
        except BadPaginationError:
            raise ParseError(detail="Error in parsing")

        # Serialize result according to the on_result function
        if on_results:
            results = on_results(cursor_result.results)
        else:
            results = cursor_result.results

        if group_by_field_name:
            results = paginator.process_results(results=results)

            # Add Manipulation functions to the response
        if controller is not None:
            results = controller(results)
        else:
            results = results
        # Return the response
        response = Response(
            {
                "grouped_by": group_by_field_name,
                "sub_grouped_by": sub_group_by_field_name,
                "total_count": (cursor_result.hits),
                "next_cursor": str(cursor_result.next),
                "prev_cursor": str(cursor_result.prev),
                "next_page_results": cursor_result.next.has_results,
                "prev_page_results": cursor_result.prev.has_results,
                "count": cursor_result.__len__(),
                "total_pages": cursor_result.max_hits,
                "total_results": cursor_result.hits,
                "extra_stats": extra_stats,
                "results": results,
            }
        )

        return response
