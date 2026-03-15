#!/usr/bin/env python3
"""Veloce Production DocType Initializer.

Creates or synchronizes the two Frappe DocTypes required by the Veloce API bridge:
  - Vehicle Inventory
  - Lead

This script is idempotent. Running it against an existing site will sync field
definitions without data loss.

Deployment:
    Copy this file into the running Frappe container:

        docker compose -f infra/local-dev/docker-compose.yml cp \\
          apps/api/scripts/init-production-db.py \\
          backend:/home/frappe/frappe-bench/apps/frappe/frappe/init_production_db.py

Execution:
    bench --site localhost execute frappe.init_production_db.run_from_bench

Post-run:
    bench --site localhost migrate
    bench --site localhost clear-cache
"""

from __future__ import annotations

from typing import Any, Dict, List

import frappe


DocTypeField = Dict[str, Any]
DocTypeSpec = Dict[str, Any]


# ---------------------------------------------------------------------------
# Field definitions
# ---------------------------------------------------------------------------

def _build_vehicle_fields() -> List[DocTypeField]:
    fields: List[DocTypeField] = [
        {"fieldname": "make",  "label": "Make",  "fieldtype": "Data", "reqd": 1},
        {"fieldname": "model", "label": "Model", "fieldtype": "Data", "reqd": 1},
        {"fieldname": "year",  "label": "Year",  "fieldtype": "Int",  "reqd": 1},
        {"fieldname": "color", "label": "Color", "fieldtype": "Data", "reqd": 1},
        {
            "fieldname": "thumbnail",
            "label": "Thumbnail",
            "fieldtype": "Attach Image",
            "reqd": 1,
            "description": "Primary image used for listing cards and the featured carousel.",
        },
    ]

    for index in range(1, 11):
        fields.append(
            {
                "fieldname": f"image_{index}",
                "label": f"Image {index}",
                "fieldtype": "Attach Image",
                "reqd": 0,
            }
        )

    fields.extend(
        [
            {"fieldname": "vin",         "label": "VIN",         "fieldtype": "Data"},
            {"fieldname": "mileage",     "label": "Mileage",     "fieldtype": "Float"},
            {"fieldname": "price",       "label": "Price",       "fieldtype": "Currency"},
            {"fieldname": "description", "label": "Description", "fieldtype": "Text"},
            {
                "fieldname": "status",
                "label": "Status",
                "fieldtype": "Select",
                "reqd": 1,
                "options": "Available\nSold",
            },
        ]
    )

    return fields


def _build_lead_fields() -> List[DocTypeField]:
    return [
        {"fieldname": "first_name", "label": "First Name", "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "last_name",  "label": "Last Name",  "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "email",      "label": "Email",      "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "phone",      "label": "Phone",      "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "message",    "label": "Message",    "fieldtype": "Long Text", "reqd": 1},
        {
            "fieldname": "vehicle_properties",
            "label": "Vehicle Properties",
            "fieldtype": "Data",
            "reqd": 1,
            "description": "Denormalized vehicle descriptor. Format: 'Color Make Model Year'",
        },
        {
            "fieldname": "status",
            "label": "Status",
            "fieldtype": "Select",
            "options": "New\nContacted",
        },
    ]


# ---------------------------------------------------------------------------
# DocType registry
# ---------------------------------------------------------------------------

DOC_TYPES: List[DocTypeSpec] = [
    {
        "name": "Vehicle Inventory",
        "module": "Custom",
        "fields": _build_vehicle_fields(),
    },
    {
        "name": "Lead",
        "module": "Custom",
        "fields": _build_lead_fields(),
    },
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _permissions() -> List[Dict[str, Any]]:
    return [
        {
            "role": "System Manager",
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 1,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
        }
    ]


def _doctype_payload(spec: DocTypeSpec) -> Dict[str, Any]:
    return {
        "module": spec.get("module", "Custom"),
        "custom": 1,
        "istable": 0,
        "track_changes": 1,
        "allow_import": 1,
        "fields": spec["fields"],
        "permissions": _permissions(),
    }


# ---------------------------------------------------------------------------
# Core operations
# ---------------------------------------------------------------------------

def _sync_doctype(spec: DocTypeSpec) -> str:
    """Update field definitions on an existing DocType."""
    name = spec["name"]
    doc = frappe.get_doc("DocType", name)
    payload = _doctype_payload(spec)

    doc.module = payload["module"]
    doc.custom = payload["custom"]
    doc.istable = payload["istable"]
    doc.track_changes = payload["track_changes"]
    doc.allow_import = payload["allow_import"]
    doc.set("fields", payload["fields"])
    doc.set("permissions", payload["permissions"])
    doc.save(ignore_permissions=True)

    frappe.clear_cache(doctype=name)
    frappe.db.updatedb(name)
    frappe.clear_cache(doctype=name)

    field_names = [f["fieldname"] for f in spec["fields"]]
    return f"SYNC  '{name}' -> [{', '.join(field_names)}]"


def _create_or_sync_doctype(spec: DocTypeSpec) -> str:
    """Create a new DocType, or sync it if it already exists."""
    name = spec["name"]

    if frappe.db.exists("DocType", name):
        return _sync_doctype(spec)

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": name,
            **_doctype_payload(spec),
        }
    )
    doc.insert(ignore_permissions=True)
    frappe.clear_cache(doctype=name)

    field_names = [f["fieldname"] for f in spec["fields"]]
    return f"CREATE '{name}' -> [{', '.join(field_names)}]"


def _verify_fields(spec: DocTypeSpec) -> str:
    """Confirm persisted fields match the expected definition."""
    name = spec["name"]
    expected = [f["fieldname"] for f in spec["fields"]]
    rows = frappe.get_all(
        "DocField",
        filters={"parent": name, "parenttype": "DocType"},
        fields=["fieldname"],
        order_by="idx asc",
    )
    actual = [row["fieldname"] for row in rows]

    if actual == expected:
        return f"VERIFY '{name}' OK  [{', '.join(actual)}]"

    return (
        f"VERIFY MISMATCH '{name}'\n"
        f"  expected : {expected}\n"
        f"  actual   : {actual}"
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run_from_bench() -> None:
    """Execute via: bench --site localhost execute frappe.init_production_db.run_from_bench"""
    separator = "-" * 70

    print(separator)
    print("Veloce — Production DocType Initializer")
    print(separator)

    for spec in DOC_TYPES:
        print(_create_or_sync_doctype(spec))

    frappe.db.commit()

    print()
    print(separator)
    print("DB committed. Running field verification...")
    print(separator)

    for spec in DOC_TYPES:
        print(_verify_fields(spec))

    print()
    print(separator)
    print("Done. Run the following to finalize:")
    print("  bench --site localhost migrate")
    print("  bench --site localhost clear-cache")
    print(separator)
