#!/usr/bin/env python3
"""Reignite V2 — Fresh creation of AutoCRM DocTypes in Frappe.

Based on DATA_CONTRACT.md (V2). Old DocTypes must be deleted before running.

Placement inside the Frappe container:
    /home/frappe/frappe-bench/apps/frappe/frappe/reignite_doctypes_v2.py

Execution:
    bench --site localhost execute frappe.reignite_doctypes_v2.run_from_bench
"""

from __future__ import annotations

from typing import Any, Dict, List

import frappe


DocTypeField = Dict[str, Any]
DocTypeSpec = Dict[str, Any]


# ---------------------------------------------------------------------------
# V2 Schema — Source of truth: .ai-workflow/DATA_CONTRACT.md
# ---------------------------------------------------------------------------

DOC_TYPES: List[DocTypeSpec] = [
    # ------------------------------------------------------------------
    # 1. Vehicle Inventory
    # ------------------------------------------------------------------
    {
        "name": "Vehicle Inventory",
        "module": "Custom",
        "fields": [
            {"fieldname": "make",        "label": "Make",        "fieldtype": "Data",      "reqd": 1},
            {"fieldname": "model",       "label": "Model",       "fieldtype": "Data",      "reqd": 1},
            {"fieldname": "year",        "label": "Year",        "fieldtype": "Int",       "reqd": 1},
            # color is mandatory (V2 addition — immediately after year)
            {"fieldname": "color",       "label": "Color",       "fieldtype": "Data",      "reqd": 1},
            {"fieldname": "vin",         "label": "VIN",         "fieldtype": "Data"},
            {"fieldname": "mileage",     "label": "Mileage",     "fieldtype": "Float"},
            {"fieldname": "price",       "label": "Price",       "fieldtype": "Currency"},
            {"fieldname": "description", "label": "Description", "fieldtype": "Text"},
            {"fieldname": "images",      "label": "Images",      "fieldtype": "JSON"},
            {
                "fieldname": "status",
                "label":     "Status",
                "fieldtype": "Select",
                "reqd":      1,
                "options":   "Available\nSold",
            },
        ],
    },
    # ------------------------------------------------------------------
    # 2. Lead  (vehicle_id removed; vehicle_properties added)
    # ------------------------------------------------------------------
    {
        "name": "Lead",
        "module": "Custom",
        "fields": [
            {"fieldname": "first_name", "label": "First Name", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "last_name",  "label": "Last Name",  "fieldtype": "Data", "reqd": 1},
            {"fieldname": "email",      "label": "Email",      "fieldtype": "Data", "reqd": 1},
            {"fieldname": "phone",      "label": "Phone",      "fieldtype": "Data", "reqd": 1},
            {
                "fieldname":   "vehicle_properties",
                "label":       "Vehicle Properties",
                "fieldtype":   "Data",
                "reqd":        1,
                "description": "Format: Color Make Model Year",
            },
            {"fieldname": "message", "label": "Message", "fieldtype": "Long Text", "reqd": 1},
            {"fieldname": "source",  "label": "Source",  "fieldtype": "Data"},
            {
                "fieldname": "status",
                "label":     "Status",
                "fieldtype": "Select",
                "options":   "New\nContacted",
            },
        ],
    },
    # ------------------------------------------------------------------
    # 3. Payment
    # ------------------------------------------------------------------
    {
        "name": "Payment",
        "module": "Custom",
        "fields": [
            {"fieldname": "vehicle_id", "label": "Vehicle ID", "fieldtype": "Data",     "reqd": 1},
            {"fieldname": "lead_id",    "label": "Lead ID",    "fieldtype": "Data",     "reqd": 1},
            {"fieldname": "amount",     "label": "Amount",     "fieldtype": "Currency", "reqd": 1},
            {
                "fieldname": "currency",
                "label":     "Currency",
                "fieldtype": "Select",
                "reqd":      1,
                "options":   "USD\nGBP",
            },
            {
                "fieldname": "payment_status",
                "label":     "Payment Status",
                "fieldtype": "Select",
                "reqd":      1,
                "options":   "Pending\nProcessing",
            },
            {
                "fieldname": "payment_method",
                "label":     "Payment Method",
                "fieldtype": "Select",
                "reqd":      1,
                "options":   "Credit Card\nDebit Card",
            },
            {"fieldname": "payment_link",     "label": "Payment Link",     "fieldtype": "Small Text"},
            {"fieldname": "transaction_id",   "label": "Transaction ID",   "fieldtype": "Data"},
            {"fieldname": "failure_reason",   "label": "Failure Reason",   "fieldtype": "Text"},
            {"fieldname": "reference_number", "label": "Reference Number", "fieldtype": "Data"},
        ],
    },
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _create_doctype(spec: DocTypeSpec) -> str:
    name = spec["name"]

    if frappe.db.exists("DocType", name):
        return f"SKIP  : '{name}' already exists — delete it first for a clean reignition"

    doc = frappe.get_doc(
        {
            "doctype":       "DocType",
            "name":          name,
            "module":        spec.get("module", "Custom"),
            "custom":        1,
            "istable":       0,
            "track_changes": 1,
            "allow_import":  1,
            "fields":        spec["fields"],
            "permissions": [
                {
                    "role":   "System Manager",
                    "read":   1,
                    "write":  1,
                    "create": 1,
                    "delete": 1,
                    "submit": 0,
                    "cancel": 0,
                    "amend":  0,
                }
            ],
        }
    )
    doc.insert(ignore_permissions=True)
    frappe.clear_cache(doctype=name)
    field_names = [f["fieldname"] for f in spec["fields"]]
    return f"CREATE: '{name}' -> [{', '.join(field_names)}]"


def _verify_fields(spec: DocTypeSpec) -> str:
    name = spec["name"]
    expected = [f["fieldname"] for f in spec["fields"]]
    rows = frappe.get_all(
        "DocField",
        filters={"parent": name, "parenttype": "DocType"},
        fields=["fieldname"],
        order_by="idx asc",
    )
    actual = [r["fieldname"] for r in rows]

    if actual == expected:
        return f"VERIFY: '{name}' OK — {', '.join(actual)}"

    return (
        f"VERIFY MISMATCH: '{name}'\n"
        f"  expected : {expected}\n"
        f"  actual   : {actual}"
    )


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


def run_from_bench() -> None:
    """
    Entrypoint:
        bench --site localhost execute frappe.reignite_doctypes_v2.run_from_bench
    """
    print("=" * 60)
    print("NEXUS Reignite V2 — DocType Creation")
    print("=" * 60)

    for spec in DOC_TYPES:
        print(_create_doctype(spec))

    frappe.db.commit()
    print("-" * 60)
    print("DB committed. Running field verification...")
    print("-" * 60)

    for spec in DOC_TYPES:
        print(_verify_fields(spec))

    print("=" * 60)
    print("Success — all DocTypes created and DB committed.")
    print("Run 'bench --site localhost migrate' to sync DB schema.")
    print("=" * 60)
