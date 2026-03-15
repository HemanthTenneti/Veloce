#!/usr/bin/env python3
"""Migration 01 — Update Vehicle Inventory and Lead DocTypes.

Changes applied:
  - Vehicle Inventory: add `color` (Data, Mandatory) field after `year`.
  - Lead: remove `vehicle_id` field, add `vehicle_properties` (Data, Mandatory) in its place.

Usage inside the Frappe container:
    bench --site localhost execute frappe.migrate_doctypes_01.run_from_bench
"""

from __future__ import annotations

import frappe


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _field_exists(doc: "frappe.Document", fieldname: str) -> bool:
    return any(f.fieldname == fieldname for f in doc.fields)


def _remove_field(doc: "frappe.Document", fieldname: str) -> bool:
    """Remove field by fieldname from doc.fields in-place.

    Returns True if a field was removed, False otherwise.
    """
    original_len = len(doc.fields)
    doc.fields = [f for f in doc.fields if f.fieldname != fieldname]
    return len(doc.fields) < original_len


# ---------------------------------------------------------------------------
# Vehicle Inventory — add `color` field
# ---------------------------------------------------------------------------


def migrate_vehicle_inventory() -> str:
    doctype_name = "Vehicle Inventory"

    if not frappe.db.exists("DocType", doctype_name):
        return f"SKIP: DocType '{doctype_name}' does not exist — run setup_doctypes.py first"

    doc = frappe.get_doc("DocType", doctype_name)

    if _field_exists(doc, "color"):
        return f"SKIP: '{doctype_name}'.color already exists — no changes made"

    # Insert `color` after `year` (idx 3). Determine insertion index.
    insert_after_idx = None
    for i, field in enumerate(doc.fields):
        if field.fieldname == "year":
            insert_after_idx = i + 1
            break

    color_field = frappe.new_doc("DocField")
    color_field.fieldname = "color"
    color_field.label = "Color"
    color_field.fieldtype = "Data"
    color_field.reqd = 1

    if insert_after_idx is not None:
        doc.fields.insert(insert_after_idx, color_field)
    else:
        # Fallback: append at the end before status
        doc.fields.append(color_field)

    doc.save(ignore_permissions=True)
    frappe.clear_cache(doctype=doctype_name)
    return f"MIGRATE: Added 'color' (Data, Mandatory) to '{doctype_name}'"


# ---------------------------------------------------------------------------
# Lead — replace `vehicle_id` with `vehicle_properties`
# ---------------------------------------------------------------------------


def migrate_lead() -> str:
    doctype_name = "Lead"

    if not frappe.db.exists("DocType", doctype_name):
        return f"SKIP: DocType '{doctype_name}' does not exist — run setup_doctypes.py first"

    doc = frappe.get_doc("DocType", doctype_name)

    messages: list[str] = []

    # --- Remove vehicle_id --------------------------------------------------
    if _field_exists(doc, "vehicle_id"):
        # Record the position of vehicle_id so we can insert in the same slot.
        insert_at: int | None = None
        for i, field in enumerate(doc.fields):
            if field.fieldname == "vehicle_id":
                insert_at = i
                break

        removed = _remove_field(doc, "vehicle_id")
        if removed:
            messages.append("  - removed field: vehicle_id")
    else:
        insert_at = None
        messages.append("  - NOTE: vehicle_id not found (already removed?)")

    # --- Add vehicle_properties (if not already present) --------------------
    if _field_exists(doc, "vehicle_properties"):
        messages.append("  - SKIP: vehicle_properties already exists")
    else:
        vp_field = frappe.new_doc("DocField")
        vp_field.fieldname = "vehicle_properties"
        vp_field.label = "Vehicle Properties"
        vp_field.fieldtype = "Data"
        vp_field.reqd = 1
        # Format expected: "Color Make Model Year"  e.g. "Red Porsche 911 GT3 Touring 2023"
        vp_field.description = (
            'Expected format: "Color Make Model Year" '
            '— e.g. "Red Porsche 911 GT3 Touring 2023"'
        )

        if insert_at is not None:
            doc.fields.insert(insert_at, vp_field)
        else:
            # Append before status/source fields — place after phone
            phone_idx = None
            for i, field in enumerate(doc.fields):
                if field.fieldname == "phone":
                    phone_idx = i + 1
                    break
            if phone_idx is not None:
                doc.fields.insert(phone_idx, vp_field)
            else:
                doc.fields.append(vp_field)

        messages.append("  - added field: vehicle_properties (Data, Mandatory)")

    doc.save(ignore_permissions=True)
    frappe.clear_cache(doctype=doctype_name)

    detail = "\n".join(messages)
    return f"MIGRATE: Updated '{doctype_name}':\n{detail}"


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


def run_from_bench() -> None:
    """Entrypoint for `bench --site <site> execute frappe.migrate_doctypes_01.run_from_bench`."""
    print("=== Migration 01: Vehicle Inventory + Lead ===")
    print(migrate_vehicle_inventory())
    print(migrate_lead())
    frappe.db.commit()
    print("=== Migration 01 complete. DB committed. ===")
