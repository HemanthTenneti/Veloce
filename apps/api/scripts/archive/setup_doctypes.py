#!/usr/bin/env python3
"""Programmatically create AutoCRM DocTypes in Frappe.

Usage inside Frappe container:
    python /tmp/setup_doctypes.py --site localhost
"""

from __future__ import annotations

import argparse
from typing import Any, Dict, List

import frappe


DocTypeField = Dict[str, Any]
DocTypeSpec = Dict[str, Any]


DOC_TYPES: List[DocTypeSpec] = [
    {
        "name": "Vehicle Inventory",
        "module": "Custom",
        "fields": [
            {"fieldname": "make", "label": "Make", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "model", "label": "Model", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "year", "label": "Year", "fieldtype": "Int", "reqd": 1},
            {"fieldname": "vin", "label": "VIN", "fieldtype": "Data"},
            {"fieldname": "mileage", "label": "Mileage", "fieldtype": "Float"},
            {"fieldname": "price", "label": "Price", "fieldtype": "Currency"},
            {"fieldname": "description", "label": "Description", "fieldtype": "Text"},
            {"fieldname": "images", "label": "Images", "fieldtype": "JSON"},
            {
                "fieldname": "status",
                "label": "Status",
                "fieldtype": "Select",
                "reqd": 1,
                "options": "Available\nSold",
            },
        ],
    },
    {
        "name": "Lead",
        "module": "Custom",
        "fields": [
            {
                "fieldname": "first_name",
                "label": "First Name",
                "fieldtype": "Data",
                "reqd": 1,
            },
            {
                "fieldname": "last_name",
                "label": "Last Name",
                "fieldtype": "Data",
                "reqd": 1,
            },
            {"fieldname": "email", "label": "Email", "fieldtype": "Data", "reqd": 1},
            {"fieldname": "phone", "label": "Phone", "fieldtype": "Data", "reqd": 1},
            {
                "fieldname": "vehicle_id",
                "label": "Vehicle ID",
                "fieldtype": "Data",
                "reqd": 1,
            },
            {
                "fieldname": "message",
                "label": "Message",
                "fieldtype": "Long Text",
                "reqd": 1,
            },
            {"fieldname": "source", "label": "Source", "fieldtype": "Data"},
            {
                "fieldname": "status",
                "label": "Status",
                "fieldtype": "Select",
                "options": "New\nContacted",
            },
        ],
    },
    {
        "name": "Payment",
        "module": "Custom",
        "fields": [
            {
                "fieldname": "vehicle_id",
                "label": "Vehicle ID",
                "fieldtype": "Data",
                "reqd": 1,
            },
            {"fieldname": "lead_id", "label": "Lead ID", "fieldtype": "Data", "reqd": 1},
            {
                "fieldname": "amount",
                "label": "Amount",
                "fieldtype": "Currency",
                "reqd": 1,
            },
            {
                "fieldname": "currency",
                "label": "Currency",
                "fieldtype": "Select",
                "reqd": 1,
                "options": "USD\nGBP",
            },
            {
                "fieldname": "payment_status",
                "label": "Payment Status",
                "fieldtype": "Select",
                "reqd": 1,
                "options": "Pending\nProcessing",
            },
            {
                "fieldname": "payment_method",
                "label": "Payment Method",
                "fieldtype": "Select",
                "reqd": 1,
                "options": "Credit Card\nDebit Card",
            },
            {
                "fieldname": "payment_link",
                "label": "Payment Link",
                "fieldtype": "Small Text",
            },
            {
                "fieldname": "transaction_id",
                "label": "Transaction ID",
                "fieldtype": "Data",
            },
            {
                "fieldname": "failure_reason",
                "label": "Failure Reason",
                "fieldtype": "Text",
            },
            {
                "fieldname": "reference_number",
                "label": "Reference Number",
                "fieldtype": "Data",
            },
        ],
    },
]


def create_doctype_if_missing(spec: DocTypeSpec) -> str:
    doctype_name = spec["name"]
    if frappe.db.exists("DocType", doctype_name):
        return f"SKIP: {doctype_name} already exists"

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": doctype_name,
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
    )
    doc.insert(ignore_permissions=True)
    frappe.clear_cache(doctype=doctype_name)
    return f"CREATE: {doctype_name}"


def verify_doctype_fields(spec: DocTypeSpec) -> str:
    doctype_name = spec["name"]
    expected = [field["fieldname"] for field in spec["fields"]]
    actual_rows = frappe.get_all(
        "DocField",
        filters={"parent": doctype_name, "parenttype": "DocType"},
        fields=["fieldname"],
        order_by="idx asc",
    )
    actual = [row["fieldname"] for row in actual_rows]

    if actual == expected:
        return f"VERIFY OK: {doctype_name} -> {', '.join(actual)}"

    return (
        f"VERIFY MISMATCH: {doctype_name}\n"
        f"  expected: {expected}\n"
        f"  actual:   {actual}"
    )


def run(site: str) -> None:
    frappe.init(site=site)
    frappe.connect()
    try:
        print(f"Connected to site: {site}")
        for spec in DOC_TYPES:
            print(create_doctype_if_missing(spec))

        frappe.db.commit()

        print("\nField verification:")
        for spec in DOC_TYPES:
            print(verify_doctype_fields(spec))
    finally:
        frappe.destroy()


def run_from_bench() -> None:
    """Entrypoint for `bench --site <site> execute frappe.setup_doctypes.run_from_bench`."""
    print("Running in bench context")
    for spec in DOC_TYPES:
        print(create_doctype_if_missing(spec))

    frappe.db.commit()

    print("\nField verification:")
    for spec in DOC_TYPES:
        print(verify_doctype_fields(spec))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create AutoCRM DocTypes in Frappe")
    parser.add_argument("--site", default="localhost", help="Frappe site name")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(site=args.site)