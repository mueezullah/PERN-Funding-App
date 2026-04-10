# PERN Funding App

A modern, transparent, and social funding platform designed to empower creators, fundraisers, and communities to bring their ideas to life.

## About the Application

This application acts as a hub for funding campaigns. It provides a unique balance between a social media feed where discovery happens organically and a dedicated fundraising and backing platform. Users can engage natively with campaigns through exploring, and participating in dedicated communities directly inside the app.

## Why This & The Problems It Solves

Traditional funding platforms often feel transactional and separated from where communities actually engage. This platform solves multiple disjoint problems:

- **The "Cold Start" Funding Problem:** Small creators struggle to get noticed. Our social feed first algorithm (the _Explore_ tab and _Communities_ feature) boosts organic discovery.
- **Separation of Platform and Community:** Engagement drops when users have to maintain a community on Discord/X/Whatsapp while funding elsewhere. We bring users and creators into one space.
- **Lack of Trust & Transparency:** By maintaining dedicated user profiles and direct updates, backers can verify identities and track campaign milestones closely in one interactive stream.

## Developer Documentation & Architecture

The project is built on a split architecture pattern for scalability and maintainability. Please visit the respective Readmes to dive deeper into how both halves operate:

- 🌐 **[Frontend Architecture & Local Setup](./frontend/README.md)**
- ⚙️ **[Backend API & Database Setup](./backend/README.md)**

## Tech Stack

**Current Stack:**

- **Frontend:** React (Vite), TypeScript, TailwindCSS, React Router DOM, Lucide Icons, Axios.
- **Backend:** Node.js, Express.js (RESTful APIs).
- **Database:** PostgreSQL (The **P** in PERN).

**Future & Planned Integrations:**

- **Payment Gateways:** Integration with Stripe or potentially Web3/Crypto endpoints to process transactions in real-time.
- **Real-time Engine:** WebSockets (Socket.io) for live-updates on campaigns, backer counters, and direct messaging between backers and creators.

---

## 🚀 The Future of the Platform

We aim to further abstract the gap between creators and financial independence by implementing AI-driven campaign drafting, fully-featured user activity milestones (Achievements and Badges for top-backers), and expanding the "Communities" feature into full-fledged DAOs (Decentralized Autonomous Organizations) for large-scale, backer-governed projects.
