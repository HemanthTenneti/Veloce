#!/usr/bin/env python3
"""Reignite V3 — Fresh creation of AutoCRM DocTypes in Frappe.

Based on HIGH_FIDELITY_REIGNITION_V3. Old DocTypes must be deleted before running.

Placement inside the Frappe container:
    /home/frappe/frappe-bench/apps/frappe/frappe/reignite_doctypes_v3.py

Execution:
    bench --site localhost execute frappe.reignite_doctypes_v3.run_from_bench
"""

from __future__ import annotations

from typing import Any, Dict, List

import frappe
from frappe.model.utils.rename_field import rename_field


DocTypeField = Dict[str, Any]
DocTypeSpec = Dict[str, Any]


def _build_vehicle_fields() -> List[DocTypeField]:
    fields: List[DocTypeField] = [
        {"fieldname": "make", "label": "Make", "fieldtype": "Data", "reqd": 1},
        {"fieldname": "model", "label": "Model", "fieldtype": "Data", "reqd": 1},
        {"fieldname": "year", "label": "Year", "fieldtype": "Int", "reqd": 1},
        {"fieldname": "color", "label": "Color", "fieldtype": "Data", "reqd": 1},
        {
            "fieldname": "thumbnail",
            "label": "Thumbnail",
            "fieldtype": "Data",
            "reqd": 1,
            "description": "Primary vehicle image used for listing and lazy-loading entry point.",
        },
    ]

    for index in range(1, 11):
        fields.append(
            {
                "fieldname": f"image_{index}",
                "label": f"Image {index}",
                "fieldtype": "Data",
            }
        )

    fields.extend(
        [
            {"fieldname": "vin", "label": "VIN", "fieldtype": "Data"},
            {"fieldname": "mileage", "label": "Mileage", "fieldtype": "Float"},
            {"fieldname": "price", "label": "Price", "fieldtype": "Currency"},
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


DOC_TYPES: List[DocTypeSpec] = [
    {
        "name": "Vehicle Inventory",
        "module": "Custom",
        "fields": _build_vehicle_fields(),
    },
    {
        "name": "Lead",
        "module": "Custom",
        "fields": [
            {"fieldname": "first_name", "label": "First Name", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "last_name", "label": "Last Name", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "email", "label": "Email", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "phone", "label": "Phone", "fieldtype": "Data", "reqd": 1},
            {
                "fieldname": "vehicle_properties",
                "label": "Vehicle Properties",
                "fieldtype": "Data",
                "reqd": 1,
                "description": "Format: Color Make Model Year",
            },
            {"fieldname": "message", "label": "Message", "fieldtype": "Long Text", "reqd": 1},
            {
                "fieldname": "status",
                "label": "Status",
                "fieldtype": "Select",
                "options": "New\nContacted",
            },
        ],
    },
]

FIELD_RENAMES: Dict[str, List[tuple[str, str]]] = {
    "Vehicle Inventory": [
        ("image1", "thumbnail"),
        ("image2", "image_1"),
        ("image3", "image_2"),
        ("image4", "image_3"),
    ],
}


def _doctype_payload(spec: DocTypeSpec) -> Dict[str, Any]:
    return {
        "module": spec.get("module", "Custom"),
        "custom": 1,
        "istable": 0,
        "track_changes": 1,
        "allow_import": 1,
        "fields": spec["fields"],
        "permissions": [
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
        ],
    }


def _rename_legacy_fields(doctype: str) -> None:
    for old_fieldname, new_fieldname in FIELD_RENAMES.get(doctype, []):
        if not frappe.db.has_column(doctype, old_fieldname):
            continue

        meta = frappe.get_meta(doctype, cached=False)
        if not meta.get_field(new_fieldname):
            continue

        rename_field(doctype, old_fieldname, new_fieldname)


def _sync_existing_doctype(spec: DocTypeSpec) -> str:
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
    _rename_legacy_fields(name)
    frappe.clear_cache(doctype=name)
    frappe.db.updatedb(name)

    field_names = [field["fieldname"] for field in spec["fields"]]
    return f"UPDATE: '{name}' -> [{', '.join(field_names)}]"


def _create_doctype(spec: DocTypeSpec) -> str:
    name = spec["name"]

    if frappe.db.exists("DocType", name):
        return _sync_existing_doctype(spec)

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": name,
            **_doctype_payload(spec),
        }
    )
    doc.insert(ignore_permissions=True)
    frappe.clear_cache(doctype=name)
    field_names = [field["fieldname"] for field in spec["fields"]]
    return f"CREATE: '{name}' -> [{', '.join(field_names)}]"


def _verify_fields(spec: DocTypeSpec) -> str:
    name = spec["name"]
    expected = [field["fieldname"] for field in spec["fields"]]
    rows = frappe.get_all(
        "DocField",
        filters={"parent": name, "parenttype": "DocType"},
        fields=["fieldname"],
        order_by="idx asc",
    )
    actual = [row["fieldname"] for row in rows]

    if actual == expected:
        return f"VERIFY: '{name}' OK — {', '.join(actual)}"

    return (
        f"VERIFY MISMATCH: '{name}'\n"
        f"  expected : {expected}\n"
        f"  actual   : {actual}"
    )


def run_from_bench() -> None:
    """Entrypoint for bench execute."""
    print("=" * 60)
    print("NEXUS Reignite V3 — DocType Creation")
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
    print("Run 'bench --site localhost migrate' and 'bench --site localhost clear-cache'.")
    print("=" * 60)