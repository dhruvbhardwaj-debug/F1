# 🏎️ Team-Based Car Design & Race Collaborative Platform

A real-time, team-driven car design and race simulation platform built on a **Discord-like architecture** using **Next.js**, **LiveKit**, and a **canvas-based design system**.

This project focuses on **design trade-offs, team coordination, and strategy**, not real-world physics. Car performance is derived from controlled parameters, while race outcomes emerge dynamically through system logic.

---
<img width="1920" height="1080" alt="Screenshot_2026-01-15_20-26-00" src="https://github.com/user-attachments/assets/0cbbb97c-8b39-438f-adc6-f66114753e04" />


## 🚀 Core Idea

* Teams collaboratively design a car using a **canvas + sliders**
* Only the **team moderator** can submit the final design
* Design choices determine **performance ceilings** (speed & handling)
* Race logic handles strategy, tyres, pit stops, and incidents
* Risk is **never user-controlled** — it is always system-derived

---

## 🎨 Car Design System (Canvas-Based)

* Static **top-view car representation**
* 3D models
* Visual feedback reacts to slider changes
* Design is represented internally as structured JSON

<img width="1920" height="963" alt="Screenshot_2026-01-16_00-52-17" src="https://github.com/user-attachments/assets/7337bd23-9ef2-46c1-8aad-d9d0d4af5356" />



### Team-Controlled Design Parameters

1. Grip ↔ Speed balance
2. Suspension stiffness
3. Ride height
4. Stability ↔ Agility balance
5. Tyre wear tendency
6. Fuel efficiency bias
7. Straight-line acceleration bias
8. Corner exit traction bias
9. Brake aggressiveness
10. Reliability ↔ Performance bias

> ⚠️ Collision risk, instability, and failures are **not configurable** by users and are derived automatically by the system.

---
<img width="1920" height="1080" alt="Screenshot_2026-01-11_03-37-13" src="https://github.com/user-attachments/assets/f6ced2dd-4397-43fc-a110-788d17aff619" />

## 🧑‍✈️ Design Rules

* Only users with **Moderator role** can submit car designs
* One design per team per race
* Design is **locked** after submission (parc fermé rule)
* Starting tyre must be selected before race start

---

## 🏁 Race Simulation Logic

* Each car design produces:

  * `straightSpeed` (straight-line ceiling)
  * `cornerSpeed` (cornering ceiling)

* During the race:

  * Track segments determine which speed applies
  * Tyres, fuel, pit stops, and weather dynamically modify performance
  * Incidents are probabilistic and derived from design instability + race context

Cars are represented as **colored dots** on a top-down track view.

---

## 🤖 AI Usage (Non-Physics)

AI is used strictly for **analysis and interpretation**, never for core simulation math.

* Interprets submitted car design traits (optional vision step)
* Estimates relative **risk profiles** (low / medium / high)
* Generates race commentary and post-race summaries

> AI does **not** decide race results or calculate movement.

---

## 🧱 Tech Stack

* **Frontend**: Next.js (App Router), Tailwind CSS
* **Canvas**: Konva.js (React Konva)
* **Realtime**: LiveKit (voice & presence)
* **Backend**: Next.js API routes
* **Database**: Prisma + PostgreSQL
* **Auth**: Clerk

---

## 📁 Project Structure (Simplified)

```
app/
 ├── api/              # Backend routes (servers, channels, livekit)
 ├── (auth)/           # Authentication routes
 ├── (main)/           # Main app (servers, channels, conversations)
 ├── (invite)/         # Invite system
 └── (setup)/          # Initial onboarding

components/            # UI & canvas components
hooks/                 # Custom hooks (modals, state)
lib/                   # Utilities & helpers
prisma/                # Database schema
```

---

## 🧠 Design Philosophy

* Deterministic simulation over realism
* Risk is an **emergent property**, not a setting
* Team decisions matter more than raw design
* Canvas is UI, not the source of truth

---

## 🛣️ Roadmap

* [ ] Advanced canvas visual feedback
* [ ] Multiple race formats
* [ ] AI-generated race debriefs
* [ ] Spectator mode
* [ ] Strategy presets per team

---

## 📌 Disclaimer

This project is a **design and strategy simulator**, not a real-world physics engine. All values are normalized and abstracted for fairness and playability.

---

## 🧑‍💻 Author

Built by **Dhruv** as a solo project.
