# Discharge Ingestion System

## Live Deployment Link: https://discharge-ingestion-production.up.railway.app/

This project automates the ingestion of hospital discharge lists (PDF format) into a structured database for triggering patient outreach campaigns.

## 🚀 Approach & Features (Q1)

- **PDF Parsing**: Extracts patient discharge details from PDF files to text using pdf-parser library
- **AI-Powered Data Structuring**: Uses OpenAI to convert extracted text into structured JSON
- **Review & Editing**: Allows manual review and correction of patient details in a web UI
- **Phone Number Validation**: Integrates with Twilio API to verify & format phone numbers
- **Database Storage**: Saves parsed discharge data into Supabase (SQL database) for fetching
- **Production-Ready Deployment**: Deployed on **Railway**, serving both API & frontend.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express, Multer, OpenAI, Twilio, Supabase
- **Frontend**: React (Client)
- **Deployment**: Railway

---

## 📂 Project Structure

```
discharge-ingestion/
├── client/         # React frontend
│   ├── src/
│   ├── package.json
├── server/         # Express backend
│   ├── index.js
│   ├── package.json
├── .env            # Environment variables (Railway managed)
├── README.md       # Documentation
```

---

## 🔧 Setup & Installation

### 1️⃣ Clone the Repo

```sh
git clone https://github.com/leorong/discharge-ingestion.git
cd discharge-ingestion
```

### 2️⃣ Install Dependencies & Set Up .env

```sh
yarn install && yarn install --cwd client
```
```sh
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY  
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### 3️⃣ Run Locally

```sh
yarn dev   # Starts backend (server) and frontend (client)
```

---

## 🌐 API Endpoints

| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| `POST` | `/api/parse`        | Uploads & processes PDF  |
| `POST` | `/api/verify-phone` | Validates phone numbers  |
| `POST` | `/api/discharges`   | Saves parsed discharge data |
| `GET`  | `/api/discharges`   | Fetches stored discharges |

---

## ⚡ Future Improvements: Scaling the Discharge Ingestion System for Future Growth (Q3)

### 1️⃣ Handling High-Volume Discharges

As the system scales to **thousands of discharges per day**, we must:
- **Move from synchronous to asynchronous processing**:
  - Instead of parsing PDFs in real-time, we can **queue jobs** using **message brokers** like **RabbitMQ, Kafka, or AWS SQS**.
  - Each discharge list is **processed in batches**, preventing server overload.
- **Introduce horizontal scaling**:
  - Use **serverless functions (AWS Lambda, Railway Autoscaling)** to dynamically **spin up additional workers** when processing demand increases.
- **Optimize database indexing & partitioning**:
  - Use **Supabase/PostgreSQL partitioning** for faster queries as data grows.
  - Implement **batch inserts** instead of single record writes.

### 2️⃣ Supporting Multiple Data Ingestion Methods

Beyond **manual PDF uploads**, customers may have **advanced EHR systems** that provide:
- **Direct API access**: Allow customers to **push data via API** instead of PDFs.
- **Database Read Access**: Implement **ETL (Extract, Transform, Load) pipelines** to sync discharge data from **EHR databases**.
- **HL7/FHIR Integration**:
  - Support **HL7 messages** (standard for healthcare data exchange).
  - Use **FHIR APIs** to integrate structured patient data.

📌 **How to Implement This?**
- **Modularize ingestion pipelines** to support **PDFs, APIs, and HL7 formats**.
- Introduce **middleware adapters** for different **EHR vendors** (e.g., Epic, Cerner).

### 3️⃣ Expanding Partner & Vendor Integrations

As we scale, multiple stakeholders may need access to the discharge data:
- **Care Coordinators**: Allow **role-based access control (RBAC)** for different teams to **review & edit** records.
- **Third-party Health Providers**: Create **webhooks & APIs** so partners can **fetch discharge data** in real time.
- **Data Enrichment Services**: Integrate:
  - **Twilio API** (phone validation)
  - **Insurance verification APIs**
  - **Provider directory lookups** for enriched data.

📌 **How to Implement This?**
- Implement **GraphQL or REST APIs** for external partners.
- Support **real-time notifications** (e.g., WebSockets) for updates.

### 🎯 Summary

🔹 **Short-term:** Solve the immediate pain via **PDF ingestion & AI structuring**.  
🔹 **Mid-term:** Introduce **API-based ingestion**, support **direct EHR integrations**.  
🔹 **Long-term:** Scale to **real-time HL7/FHIR data pipelines**, expand **vendor support**, and enable **multi-tenant access**.  

With this approach, **Kouper is prepared for high-volume ingestion, new customers, and diverse healthcare integrations** 🚀.



