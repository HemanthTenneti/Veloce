#!/usr/bin/env python3
"""Veloce Vehicle Seed Script.

Seeds the Vehicle Inventory DocType with 9 demo vehicles using local images
stored in apps/api/scripts/seed-assets/ (deployed to Frappe public/files/).

Images cycle c1 → c2 → c3 → c4 → c1 ... across vehicles.
Gallery slots image_1 through image_10 cycle the same four images per record.

Deployment of images (run once from repo root):
    for f in c1 c2 c3 c4; do
      docker cp apps/api/scripts/seed-assets/${f}.jpg \\
        veloce-engine-backend-1:/home/frappe/frappe-bench/sites/localhost/public/files/${f}.jpg
    done

Execution:
    docker cp apps/api/scripts/seed-vehicles.py \\
      veloce-engine-backend-1:/home/frappe/frappe-bench/apps/frappe/frappe/seed_vehicles.py

    docker exec -w /home/frappe/frappe-bench veloce-engine-backend-1 \\
      bench --site localhost execute frappe.seed_vehicles.run_from_bench
"""

from __future__ import annotations

from typing import Any, Dict, List

import frappe


# ---------------------------------------------------------------------------
# Image assets — served from Frappe public/files/
# ---------------------------------------------------------------------------

SEED_IMAGES = ["/files/c1.jpg", "/files/c2.jpg", "/files/c3.jpg", "/files/c4.jpg"]

# 10 gallery slots (image_1 … image_10), each assigned a cycling image
GALLERY_FIELDS = [f"image_{i}" for i in range(1, 11)]


def _gallery(thumbnail_index: int) -> Dict[str, str]:
    """Build image_1 … image_10 cycling from SEED_IMAGES starting at thumbnail_index."""
    return {
        field: SEED_IMAGES[(thumbnail_index + slot) % len(SEED_IMAGES)]
        for slot, field in enumerate(GALLERY_FIELDS)
    }


# ---------------------------------------------------------------------------
# Vehicle data — matches DATA_CONTRACT.md
# ---------------------------------------------------------------------------

COLOR_PALETTE = [
    "Guards Red",
    "Midnight Black",
    "Obsidian",
    "Pangea Green",
    "Nardo Grey",
    "Satin Titanium",
    "Frozen Marina Bay Blue",
    "Blu Roma",
    "Launch Green",
]

SOURCE_VEHICLES: List[Dict[str, Any]] = [
    {"year": 2023, "make": "PORSCHE",       "model": "911 GT3 Touring",    "desc": "The purest distillation of driving.",         "price": 145000, "mileage": 2400},
    {"year": 2022, "make": "TOYOTA",        "model": "Land Cruiser 300",   "desc": "The road ends where you decide it does.",     "price": 78500,  "mileage": 42000},
    {"year": 2022, "make": "MERCEDES-BENZ", "model": "G63 AMG",            "desc": "Presence that demands absolute attention.",   "price": 162000, "mileage": 12500},
    {"year": 2024, "make": "LAND ROVER",    "model": "Defender 110 V8",    "desc": "Unstoppable capability meets modern luxury.", "price": 95500,  "mileage": 1200},
    {"year": 2021, "make": "AUDI",          "model": "RS6 Avant",          "desc": "Pace and space in perfect harmony.",          "price": 88900,  "mileage": 28000},
    {"year": 2023, "make": "ASTON MARTIN",  "model": "DBX 707",            "desc": "The sports car of SUVs.",                     "price": 185000, "mileage": 4500},
    {"year": 2022, "make": "BMW",           "model": "M5 Competition",     "desc": "Executive express redefined.",                "price": 82000,  "mileage": 18000},
    {"year": 2020, "make": "FERRARI",       "model": "Roma",               "desc": "La Nuova Dolce Vita.",                        "price": 165000, "mileage": 9000},
    {"year": 2023, "make": "RIVIAN",        "model": "R1S Launch Edition", "desc": "Electric adventure awaits.",                  "price": 92000,  "mileage": 3000},
]


# ---------------------------------------------------------------------------
# Seed logic
# ---------------------------------------------------------------------------

def _wipe_all_vehicles() -> int:
    """Delete every Vehicle Inventory record. Returns count removed."""
    names = frappe.get_all("Vehicle Inventory", pluck="name")
    for name in names:
        frappe.delete_doc("Vehicle Inventory", name, ignore_permissions=True, force=True)
    frappe.db.commit()
    return len(names)


def _seed_vehicle(index: int, v: Dict[str, Any]) -> str:
    thumbnail_index = index % len(SEED_IMAGES)
    thumbnail       = SEED_IMAGES[thumbnail_index]
    color           = COLOR_PALETTE[index % len(COLOR_PALETTE)]
    vin             = f"VX{202600000000000 + index}"

    doc = frappe.get_doc({
        "doctype":     "Vehicle Inventory",
        "make":        v["make"],
        "model":       v["model"],
        "year":        v["year"],
        "color":       color,
        "status":      "Available",
        "price":       v["price"],
        "mileage":     v["mileage"],
        "description": v["desc"],
        "vin":         vin,
        "thumbnail":   thumbnail,
        **_gallery(thumbnail_index),
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    return f"SEED  {v['make']} {v['model']} {v['year']}  thumbnail={thumbnail}  color={color}  id={doc.name}"


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run_from_bench() -> None:
    """Execute via: bench --site localhost execute frappe.seed_vehicles.run_from_bench"""
    separator = "-" * 70

    print(separator)
    print("Veloce — Vehicle Seed  (local images: c1-c4)")
    print(separator)

    removed = _wipe_all_vehicles()
    print(f"Wiped {removed} existing Vehicle Inventory records.")
    print()

    for index, vehicle in enumerate(SOURCE_VEHICLES):
        print(_seed_vehicle(index, vehicle))

    total = frappe.db.count("Vehicle Inventory")
    print()
    print(separator)
    print(f"Done. Total Vehicle Inventory records: {total}")
    print(separator)
