"""
Adobe PDF Services — fill/prep for leases.

Signing stays in Neela until Acrobat Sign API is licensed.
Uses Import PDF Form Data on an AcroForm lease template.
"""
from __future__ import annotations

import logging
import time
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)

_TOKEN_URL = "https://pdf-services.adobe.io/token"
_BASE = "https://pdf-services.adobe.io"


def pdf_services_configured() -> bool:
    return bool(
        getattr(settings, "ADOBE_PDF_SERVICES_CLIENT_ID", None)
        and getattr(settings, "ADOBE_PDF_SERVICES_CLIENT_SECRET", None)
    )


def get_access_token() -> str | None:
    if not pdf_services_configured():
        return None
    try:
        import requests
    except ImportError:
        logger.warning("requests not available for Adobe PDF Services")
        return None

    try:
        resp = requests.post(
            _TOKEN_URL,
            data={
                "client_id": settings.ADOBE_PDF_SERVICES_CLIENT_ID,
                "client_secret": settings.ADOBE_PDF_SERVICES_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        resp.raise_for_status()
        return (resp.json() or {}).get("access_token") or None
    except Exception as e:
        logger.error("Adobe PDF Services token failed: %s", e)
        return None


def _headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "x-api-key": settings.ADOBE_PDF_SERVICES_CLIENT_ID,
    }


def _upload_pdf(token: str, pdf_bytes: bytes) -> str:
    import requests

    # 1) get upload URI
    r = requests.post(
        f"{_BASE}/assets",
        json={"mediaType": "application/pdf"},
        headers={**_headers(token), "Content-Type": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json() or {}
    upload_uri = data.get("uploadUri")
    asset_id = data.get("assetID") or data.get("assetId")
    if not upload_uri or not asset_id:
        raise RuntimeError(f"Adobe asset create missing uri/id: {data}")

    put = requests.put(
        upload_uri,
        data=pdf_bytes,
        headers={"Content-Type": "application/pdf"},
        timeout=120,
    )
    put.raise_for_status()
    return asset_id


def _poll_job(token: str, location: str, timeout_s: float = 90.0) -> dict[str, Any]:
    import requests

    deadline = time.time() + timeout_s
    while time.time() < deadline:
        r = requests.get(location, headers=_headers(token), timeout=30)
        r.raise_for_status()
        body = r.json() or {}
        status = (body.get("status") or "").upper()
        if status in ("DONE", "COMPLETED", "SUCCESS"):
            return body
        if status in ("FAILED", "ERROR"):
            raise RuntimeError(f"Adobe job failed: {body}")
        time.sleep(1.5)
    raise TimeoutError("Adobe PDF Services job timed out")


def _download_asset(token: str, asset_id: str) -> bytes:
    import requests

    r = requests.get(
        f"{_BASE}/assets/{asset_id}/download",
        headers=_headers(token),
        timeout=120,
        allow_redirects=True,
    )
    # Some responses return JSON with downloadUri
    ctype = (r.headers.get("Content-Type") or "").lower()
    if "application/pdf" in ctype or r.content[:4] == b"%PDF":
        r.raise_for_status()
        return r.content
    r.raise_for_status()
    data = r.json() if "json" in ctype else {}
    download_uri = (data or {}).get("downloadUri") or (data or {}).get("downloadURI")
    if not download_uri:
        # try result shape from job
        raise RuntimeError(f"No download URI for asset {asset_id}: {data}")
    d = requests.get(download_uri, timeout=120)
    d.raise_for_status()
    return d.content


def replacements_to_form_data(replacements: dict[str, Any]) -> dict[str, str]:
    """Map {{key}} / checkbox tokens to Adobe form field JSON values."""
    form: dict[str, str] = {}
    for raw_key, raw_val in (replacements or {}).items():
        name = str(raw_key).replace("{{", "").replace("}}", "").strip()
        if not name:
            continue
        if raw_val is None:
            continue
        s = str(raw_val).strip()
        if not s or s.startswith("[_") or s == "__________":
            continue
        # Checkboxes: Adobe expects Yes / Off style for many forms
        low = s.lower()
        if low in ("[x]", "x", "true", "1", "yes", "on", "☑", "✓"):
            form[name] = "Yes"
            continue
        if low in ("[ ]", "false", "0", "no", "off"):
            form[name] = "Off"
            continue
        if s.startswith("$"):
            s = s.lstrip("$").strip()
        form[name] = s
    return form


def import_form_data(pdf_bytes: bytes, form_data: dict[str, str]) -> bytes:
    """
    Fill AcroForm fields via Adobe PDF Services Import Form Data.
    Raises on failure — caller should fall back to Neela fill.
    """
    import requests

    if not form_data:
        raise ValueError("form_data empty")
    token = get_access_token()
    if not token:
        raise RuntimeError("Adobe PDF Services not configured")

    asset_id = _upload_pdf(token, pdf_bytes)

    payload = {
        "assetID": asset_id,
        "jsonFormFieldsData": form_data,
    }
    r = requests.post(
        f"{_BASE}/operation/setformdata",
        json=payload,
        headers={**_headers(token), "Content-Type": "application/json"},
        timeout=60,
    )
    if r.status_code not in (200, 201, 202):
        raise RuntimeError(f"setformdata failed {r.status_code}: {r.text[:500]}")

    location = r.headers.get("location") or r.headers.get("Location")
    if location:
        body = _poll_job(token, location)
        result = (body.get("asset") or body.get("result") or {})
        out_id = result.get("assetID") or result.get("assetId")
        if not out_id and isinstance(body.get("asset"), dict):
            out_id = body["asset"].get("assetID")
        # Newer shapes nest under result.asset
        if not out_id:
            nested = ((body.get("result") or {}).get("asset") or {})
            out_id = nested.get("assetID") or nested.get("assetId")
        if not out_id:
            raise RuntimeError(f"Adobe job done but no asset id: {body}")
        return _download_result(token, body, out_id)

    # Synchronous rare case
    if r.content[:4] == b"%PDF":
        return r.content
    data = r.json() if r.content else {}
    out_id = (data.get("asset") or {}).get("assetID") or data.get("assetID")
    if not out_id:
        raise RuntimeError(f"Unexpected setformdata response: {data}")
    return _download_asset(token, out_id)


def _download_result(token: str, job_body: dict[str, Any], asset_id: str) -> bytes:
    import requests

    # Prefer downloadUri on job result if present
    asset = job_body.get("asset") or (job_body.get("result") or {}).get("asset") or {}
    download_uri = asset.get("downloadUri") or asset.get("downloadURI")
    if download_uri:
        d = requests.get(download_uri, timeout=120)
        d.raise_for_status()
        return d.content
    return _download_asset(token, asset_id)


def fill_lease_pdf_with_adobe(fillable_pdf_bytes: bytes, replacements: dict[str, Any]) -> bytes:
    """Public entry: fillable PDF + lease replacements → filled PDF bytes."""
    form_data = replacements_to_form_data(replacements)
    return import_form_data(fillable_pdf_bytes, form_data)


def fill_status() -> dict[str, Any]:
    return {
        "pdf_services_configured": pdf_services_configured(),
        "sign_api": "blocked_until_licensed",
        "active_fill_engine": (
            "adobe_pdf_services" if pdf_services_configured() else "neela_lease_pdf_template_fallback"
        ),
        "note": (
            "Adobe PDF Services owns fill when credentials + fillable AcroForm exist. "
            "Signing stays Neela until Acrobat Sign API is licensed."
        ),
    }
