# Frappe Setup Instructions

Step-by-step guide to get a local Frappe instance running via Docker and Portainer, and wiring it up to the AutoCRM backend.

---

## 1. Install Portainer

Visit [portainer.io/installation](https://www.portainer.io/installation) for full instructions, or run:

```bash
docker volume create portainer_data

docker run -d \
  -p 8000:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:sts
```

Then open **https://localhost:9443**, create an admin user, and connect to your local Docker environment.

---

## 2. Deploy the Frappe Stack

In Portainer, create a new **Stack** and paste your `docker-compose.yml` into the Web Editor.

Set the following **Environment Variables** (in the Environment panel below the editor):

| Variable                  | Value       |
| ------------------------- | ----------- |
| `FRAPPE_VERSION`          | `v16.9.0`   |
| `DB_PASSWORD`             | `admin`     |
| `FRAPPE_SITE_NAME_HEADER` | `localhost` |
| `HTTP_PUBLISH_PORT`       | `8080`      |

Click **Deploy the stack**.

---

## 3. Create the Frappe Site

Once the stack is running, execute the site creation script from the project root:

```bash
bash create-site.sh
```

This creates a new Frappe site with the configured database and admin credentials.

---

## 4. Log In to Frappe

Open **http://localhost:8080** and log in with:

- **Username:** `Administrator`
- **Password:** `admin`

---

## 5. Create the DocTypes

Navigate to **Home > Build > DocType > New DocType** and create the following three DocTypes in order.

> **Important:** Create them in the order listed — `Vehicle Inventory` first, since `Lead` and `Payment` link to it.

---

### DocType 1 — `Vehicle Inventory`

| #   | Label       | Field Name    | Field Type | Mandatory | Options                                                |
| --- | ----------- | ------------- | ---------- | --------- | ------------------------------------------------------ |
| 1   | Make        | `make`        | Data       | Yes       |                                                        |
| 2   | Model       | `model`       | Data       | Yes       |                                                        |
| 3   | Year        | `year`        | Int        | Yes       |                                                        |
| 4   | VIN         | `vin`         | Data       | No        |                                                        |
| 5   | Mileage     | `mileage`     | Float      | No        |                                                        |
| 6   | Price       | `price`       | Currency   | No        |                                                        |
| 7   | Description | `description` | Text       | No        |                                                        |
| 8   | Images      | `images`      | JSON       | No        |                                                        |
| 9   | Status      | `status`      | Select     | Yes       | `Available` `Sold` `Reserved` `Maintenance` `Inactive` |

---

### DocType 2 — `Lead`

| #   | Label             | Field Name          | Field Type                 | Mandatory | Options                                                                         |
| --- | ----------------- | ------------------- | -------------------------- | --------- | ------------------------------------------------------------------------------- |
| 1   | First Name        | `first_name`        | Data                       | Yes       |                                                                                 |
| 2   | Last Name         | `last_name`         | Data                       | Yes       |                                                                                 |
| 3   | Email             | `email`             | Data                       | Yes       |                                                                                 |
| 4   | Phone             | `phone`             | Data                       | Yes       |                                                                                 |
| 5   | Vehicle ID        | `vehicle_id`        | Link → `Vehicle Inventory` | Yes       |                                                                                 |
| 6   | Message           | `message`           | Long Text                  | Yes       |                                                                                 |
| 7   | Source            | `source`            | Data                       | No        |                                                                                 |
| 8   | Last Contacted At | `last_contacted_at` | Datetime                   | No        |                                                                                 |
| 9   | Status            | `status`            | Select                     | No        | `New` `Contacted` `Qualified` `Unqualified` `Negotiation` `Won` `Lost` `Closed` |

---

### DocType 3 — `Payment`

| #   | Label            | Field Name         | Field Type                 | Mandatory | Options                                                                                    |
| --- | ---------------- | ------------------ | -------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| 1   | Vehicle ID       | `vehicle_id`       | Link → `Vehicle Inventory` | Yes       |                                                                                            |
| 2   | Lead ID          | `lead_id`          | Link → `Lead`              | Yes       |                                                                                            |
| 3   | Amount           | `amount`           | Currency                   | Yes       |                                                                                            |
| 4   | Currency         | `currency`         | Select                     | Yes       | `USD` `GBP` `EUR` `MXN` `INR` `AUD` `CAD` `JPY`                                            |
| 5   | Payment Status   | `payment_status`   | Select                     | Yes       | `Pending` `Processing` `Completed` `Failed` `Refunded` `Cancelled`                         |
| 6   | Payment Method   | `payment_method`   | Select                     | Yes       | `Credit Card` `Debit Card` `Bank Transfer` `PayPal` `ApplePay` `GooglePay` `Stripe` `Wise` |
| 7   | Payment Link     | `payment_link`     | Small Text                 | No        |                                                                                            |
| 8   | Transaction ID   | `transaction_id`   | Data                       | No        |                                                                                            |
| 9   | Failure Reason   | `failure_reason`   | Text                       | No        |                                                                                            |
| 10  | Reference Number | `reference_number` | Data                       | No        |                                                                                            |

---

## 6. Generate API Credentials

1. Click your profile avatar (top right) → **Edit Profile**
2. Go to **Settings** → **API Access**
3. Click **Generate Keys**
4. Copy the **API Key** and **API Secret**

Update `backend/.env` with the values:

```env
FRAPPE_API_KEY=your_api_key_here
FRAPPE_API_SECRET=your_api_secret_here
```

---

## Done

Frappe is ready. Use Portainer to start and stop the stack as needed.
