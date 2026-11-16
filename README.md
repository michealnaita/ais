# Academic Integrity System (AIS)

An open-source, self-managed plagiarism detection system for academic institutions.

AIS lets a school check student submissions for plagiarism on its own servers, against its own growing repository of documents, without depending on expensive third-party services.

## About the project

### Summary

This project covers the design, development and documentation of an open-source, self-managed plagiarism detection system. It is aimed at academic institutions that want full control over their data, or that are looking for a more affordable alternative to commercial plagiarism detection platforms.

AIS is designed to be deployed on school-managed servers and accessed through the school's network. It maintains a local repository of documents built from user submissions and uses that repository as the source for its similarity and plagiarism detection. This sets it apart from commercial tools, which compare submissions against external databases and internet sources.

### Aim

To develop a functional plagiarism detection system for academic institutions that enables them to rely less on third-party services.

### Why we started it

Commercial plagiarism detection platforms are designed for large-scale deployment and require high ongoing subscription fees, which often puts them out of reach for schools operating on small budgets in many parts of the world. AIS tackles this directly with a self-managed, local plagiarism detection system.

### Purpose

To deliver a fully functional, portable, self-managed plagiarism detection system for academic institutions that is entirely deployable on a school's own infrastructure.

### What it does

- Checks whether two documents are identical.
- Measures how similar one document is to many others, as a percentage.
- Detects plagiarism in coursework such as reports, assignments and homework.
- Gives students and instructors one web-based place to submit work and review similarity reports.

### What makes it different

- **Closed-environment detection.** Submissions are compared against the institution's own documents, not external databases or the internet.
- **Self-growing document repository.** Every submission joins the local repository, so detection gets stronger as the system is used.
- **Lightweight and deployable on institutional infrastructure.** Runs on a school's own servers and is reached over the school's network.

### Key topics

Plagiarism Detection, Academic Integrity, Document Similarity, Embeddings, Nearest Neighbor, Cosine Similarity, Natural Language Processing, Web-Based Platform, Role-Based Access Control, Document Management, Text Extraction, Python, Internal Repository

## Team

| Name | Role |
| --- | --- |
| Michael Kiirya Naita | Project Manager, Software Designer |
| Saif Al Qudah | Security & Performance Analyst |

**Supervisor:** Prof. Dr. Önsen Toygar

**Project proposed by:** Prof. Dr. Omar Ramadan

Graduation Project (CMPE 405 / CMSE 405 / BLGM 405), Computer Engineering Department, Spring 2025/2026.

## How similarity is reported

Each passage of a submission is compared against passages in the repository. A passage whose similarity is at or above the report's **threshold** counts as a match; passages are not scored individually beyond that. The report then shows:

- an **overall similarity** percentage for the whole document, and
- for each matched source, the **share of the document's passages** that matched it.

All percentages are computed by the backend. The threshold can be changed from the report screen, which regenerates the report.

## Repository layout

```
ais/
├── backend/    FastAPI service: auth, users, assignments, submissions, document parsing and similarity
└── frontend/   Next.js web app for students, instructors and administrators
```

### Backend

- Python 3.14, [FastAPI](https://fastapi.tiangolo.com/), SQLAlchemy (SQLite), Pydantic
- Document text extraction with `python-docx`, `mammoth` and BeautifulSoup
- JWT authentication with Argon2 password hashing
- Code lives in `backend/app` (`routes/`, `services/`, `core/`); tests in `backend/tests`

### Frontend

- [Next.js](https://nextjs.org/) 16 (App Router, Cache Components), React, TypeScript
- Tailwind CSS v4 with shadcn/ui components on Base UI
- TanStack Query for data fetching
- Vitest and Testing Library for tests
- Code lives in `frontend/src`, organised by resource (see `frontend/AGENTS.md`)

The frontend currently runs against mock services in `frontend/src/services` while the API integration is completed.

## Getting started

### Backend

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync
uv run fastapi dev        # http://localhost:8000, API docs at /docs
uv run pytest             # run the tests
```

Set `JWT_SECRET` (and optionally `ENVIRONMENT`) in the environment for anything beyond local development.

### Frontend

Requires Node.js.

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
npm run test:run          # run the tests
npm run lint
```
