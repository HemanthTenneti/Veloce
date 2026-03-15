#!/usr/bin/env python3
"""Veloce Demo Seed — uploads local car images to Frappe and creates 12 Vehicle Inventory records.

Creates 4 cars × 3 colour/year variants = 12 records.
Each vehicle's thumbnail is its primary image; gallery (image_1…image_4) cycles all four images.

Prerequisites:
    Place 4 JPEG images named c1.jpg … c4.jpg in the repository root.
    Set Frappe credentials via environment variables (or export them before running):
        export FRAPPE_URL=http://localhost:8080
        export FRAPPE_API_KEY=<key>
        export FRAPPE_API_SECRET=<secret>

Usage (from repo root):
    python apps/api/scripts/seed-demo.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Config — read from environment; never hardcode credentials
# ---------------------------------------------------------------------------

FRAPPE_URL  = os.getenv("FRAPPE_URL", "http://localhost:8080")
API_KEY     = os.getenv("FRAPPE_API_KEY", "")
API_SECRET  = os.getenv("FRAPPE_API_SECRET", "")

if not API_KEY or not API_SECRET:
    sys.exit(
        "FRAPPE_API_KEY and FRAPPE_API_SECRET must be set.\n"
        "Copy apps/api/.env.example to apps/api/.env, fill in your credentials, "
        "then: export $(grep -v '^#' apps/api/.env | xargs)"
    )

AUTH        = {"Authorization": f"token {API_KEY}:{API_SECRET}"}
REPO_ROOT   = Path(__file__).resolve().parents[3]   # …/Automobile-CRM

IMAGE_FILES = [
    REPO_ROOT / "c1.jpg",
    REPO_ROOT / "c2.jpg",
    REPO_ROOT / "c3.jpg",
    REPO_ROOT / "c4.jpg",
]

# ---------------------------------------------------------------------------
# Vehicle definitions  (4 cars × 3 variants = 12 records)
# ---------------------------------------------------------------------------

CARS = [
    # img_index, make, model, variants: [(year, color, price, mileage, description)]
    (
        0,
        "Porsche", "911 GT3 RS",
        [
            (2023, "White",  195_000,  1_800, "Factory Weissach package. Delivery mileage only."),
            (2022, "Black",  175_000,  3_200, "Full PPF and ceramic coating. Immaculate."),
            (2021, "Silver", 158_000,  7_400, "One owner from new. Full Porsche service history."),
        ],
    ),
    (
        1,
        "Ferrari", "Roma",
        [
            (2023, "Rosso Corsa",    220_000,  900, "Unregistered. Full factory specification."),
            (2022, "Bianco Italia",  196_000, 2_600, "Panoramic roof, carbon fibre sport seats."),
            (2021, "Grigio Titanio", 182_000, 6_100, "Magnesio alloys, JBL audio, privacy glass."),
        ],
    ),
    (
        2,
        "McLaren", "720S Spider",
        [
            (2023, "Papaya Spark", 285_000,  600, "MSO Defined. Carbon exterior pack. Folding hardtop."),
            (2022, "Memphis Red",  252_000, 3_900, "Park sensors, nose lift, sports exhaust."),
            (2021, "Chicane Grey", 234_000, 8_200, "Track pack, front axle lift, full service history."),
        ],
    ),
    (
        3,
        "Lamborghini", "Huracan EVO",
        [
            (2023, "Arancio Borealis", 248_000, 1_100, "Ad Personam finish. Carbon package. 1 of 1."),
            (2022, "Blu Galaxia",      226_000, 4_500, "Transparent engine cover, sport exhaust."),
            (2021, "Bianco Monocerus", 207_000, 9_800, "Full service history. Carbon ceramic brakes."),
        ],
    ),
]

# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

def upload_image(path: Path) -> str:
    """Upload a local file to Frappe and return its public file_url."""
    print(f"  Uploading {path.name} ...", end=" ", flush=True)
    with path.open("rb") as fh:
        resp = requests.post(
            f"{FRAPPE_URL}/api/method/upload_file",
            headers={**AUTH, "Accept": "application/json"},
            files={"file": (path.name, fh, "image/jpeg")},
            data={"is_private": "0", "folder": "Home/Attachments"},
            timeout=60,
        )
    resp.raise_for_status()
    url = resp.json()["message"]["file_url"]
    print(url)
    return url


# ---------------------------------------------------------------------------
# DocType creation
# ---------------------------------------------------------------------------

def create_vehicle(payload: dict) -> str:
    resp = requests.post(
        f"{FRAPPE_URL}/api/resource/Vehicle%20Inventory",
        headers={**AUTH, "Content-Type": "application/json", "Accept": "application/json"},
        json=payload,
        timeout=30,
    )
    if not resp.ok:
        raise RuntimeError(f"Create failed: {resp.status_code} {resp.text[:200]}")
    return resp.json()["data"]["name"]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Validate images exist
    for p in IMAGE_FILES:
        if not p.exists():
            sys.exit(f"Image not found: {p}")

    print("=" * 60)
    print("Veloce Demo Seed")
    print("=" * 60)

    # 1. Upload all four images once each
    print("\n[1/2] Uploading images to Frappe ...")
    urls: list[str] = [upload_image(p) for p in IMAGE_FILES]

    # 2. Create 12 vehicle records
    print(f"\n[2/2] Creating vehicle records ...")
    created: list[str] = []

    for img_idx, make, model, variants in CARS:
        thumb_url = urls[img_idx]
        # Gallery: all four images, starting with the primary
        gallery = [urls[(img_idx + i) % 4] for i in range(4)]

        for year, color, price, mileage, description in variants:
            payload = {
                "make":        make,
                "model":       model,
                "year":        year,
                "color":       color,
                "thumbnail":   thumb_url,
                "image_1":     gallery[0],
                "image_2":     gallery[1],
                "image_3":     gallery[2],
                "image_4":     gallery[3],
                "price":       price,
                "mileage":     mileage,
                "description": description,
                "status":      "Available",
            }
            name = create_vehicle(payload)
            created.append(name)
            print(f"  Created  {name}  ({color} {year} {make} {model}  £{price:,})")

    print()
    print("=" * 60)
    print(f"Done — {len(created)} vehicles created.")
    print("=" * 60)


if __name__ == "__main__":
    main()
