#!/usr/bin/env python3
"""Veloce Production DocType Initializer.

Creates or synchronizes the two Frappe DocTypes required by the Veloce API bridge:
  - Vehicle Inventory
  - Lead

This script runs against a vanilla Frappe installation (no ERPNext required).
Both DocTypes are created as custom modules and their SQL tables are physically
materialized inline — no separate `bench migrate` is needed for the schema, though
running migrate afterwards is still recommended to finalize any Frappe housekeeping.

This script is idempotent. Running it against an existing site will sync field
definitions without data loss.

Deployment:
    Copy this file into the running Frappe container:

        docker cp apps/api/scripts/init-production-db.py \\
          veloce-engine-backend-1:/home/frappe/frappe-bench/apps/frappe/frappe/init_production_db.py

Execution:
    docker exec -w /home/frappe/frappe-bench veloce-engine-backend-1 \\
      bench --site localhost execute frappe.init_production_db.run_from_bench

Post-run:
    bench --site localhost migrate
    bench --site localhost clear-cache
"""

from __future__ import annotations

from typing import Any, Dict, List

import frappe


DocTypeField = Dict[str, Any]


# ---------------------------------------------------------------------------
# Field definitions
# ---------------------------------------------------------------------------

def _build_vehicle_fields() -> List[DocTypeField]:
    """Complete Vehicle Inventory field list per DATA_CONTRACT.md.

    Includes thumbnail (reqd) + image_1 through image_10 (optional) so all
    11 Attach Image columns are physically present in the database table.
    """
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
    """Complete Lead field list per DATA_CONTRACT.md."""
    return [
        {"fieldname": "first_name",         "label": "First Name",         "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "last_name",          "label": "Last Name",          "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "email",              "label": "Email",              "fieldtype": "Data",      "reqd": 1},
        {"fieldname": "phone",              "label": "Phone",              "fieldtype": "Data",      "reqd": 1},
        {
            "fieldname": "vehicle_properties",
            "label": "Vehicle Properties",
            "fieldtype": "Data",
            "reqd": 1,
            "description": "Denormalized vehicle descriptor. Format: 'Color Make Model Year'",
        },
        {"fieldname": "message",            "label": "Message",            "fieldtype": "Long Text", "reqd": 1},
        {"fieldname": "source",             "label": "Source",             "fieldtype": "Data",      "reqd": 0},
        {
            "fieldname": "status",
            "label": "Status",
            "fieldtype": "Select",
            "reqd": 0,
            "options": "New\nContacted",
        },
    ]


# ---------------------------------------------------------------------------
# Permissions helper
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


# ---------------------------------------------------------------------------
# Core create / sync — shared by both DocTypes
# ---------------------------------------------------------------------------

def _create_or_sync_doctype(name: str, fields: List[DocTypeField]) -> str:
    """Create a new custom DocType or sync an existing one.

    Physical table materialization sequence for a NEW DocType:
        1. doc.insert()         — writes the DocType metadata row to tabDocType
        2. frappe.db.commit()   — persists metadata before any DDL is issued
        3. frappe.db.updatedb() — issues CREATE TABLE `tab<name>`
        4. frappe.db.commit()   — commits the CREATE TABLE DDL transaction

    For an EXISTING DocType (sync path):
        doc.save() -> commit -> updatedb (ALTER TABLE for added/changed columns) -> commit
    """
    if frappe.db.exists("DocType", name):
        doc = frappe.get_doc("DocType", name)
        doc.module = "Custom"
        doc.custom = 1
        doc.istable = 0
        doc.track_changes = 1
        doc.allow_import = 1
        doc.set("fields", fields)
        doc.set("permissions", _permissions())
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        frappe.db.updatedb(name)
        frappe.db.commit()
        frappe.clear_cache(doctype=name)
        field_names = [f["fieldname"] for f in fields]
        return f"SYNC  '{name}' -> [{', '.join(field_names)}]"

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": name,
            "module": "Custom",
            "custom": 1,
            "istable": 0,
            "track_changes": 1,
            "allow_import": 1,
            "fields": fields,
            "permissions": _permissions(),
        }
    )
    doc.insert(ignore_permissions=True)
    frappe.db.commit()          # lock in metadata row before DDL
    frappe.db.updatedb(name)    # CREATE TABLE `tab<name>`
    frappe.db.commit()          # commit the DDL transaction
    frappe.clear_cache(doctype=name)

    field_names = [f["fieldname"] for f in fields]
    return f"CREATE '{name}' -> [{', '.join(field_names)}]"


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------

def _verify_doctype(name: str, fields: List[DocTypeField]) -> str:
    """Confirm persisted DocField rows match the expected field list."""
    expected = [f["fieldname"] for f in fields]
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

    print(_create_or_sync_doctype("Vehicle Inventory", _build_vehicle_fields()))
    print(_create_or_sync_doctype("Lead", _build_lead_fields()))

    frappe.db.commit()

    print()
    print(separator)
    print("DB committed. Running field verification...")
    print(separator)

    print(_verify_doctype("Vehicle Inventory", _build_vehicle_fields()))
    print(_verify_doctype("Lead",              _build_lead_fields()))

    print()
    print(separator)
    print("Done. Run the following to finalize:")
    print("  bench --site localhost migrate")
    print("  bench --site localhost clear-cache")
    print(separator)
