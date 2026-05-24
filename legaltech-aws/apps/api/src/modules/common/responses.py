from typing import Any


def success_response(data: Any, message: str | None = None) -> dict[str, Any]:
    response: dict[str, Any] = {
        "success": True,
        "data": data,
    }
    if message is not None:
        response["message"] = message

    return response


def error_response(
    *,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
        },
    }

