# 🌱 GreenHands — Community Action Platform

GreenHands is a community-driven social development platform designed to connect people through meaningful volunteer opportunities and community-service initiatives. It allows users to discover upcoming events, explore local causes, and organize activities that make a positive impact on their communities.

Built with **Next.js 16, React 19, and TypeScript**, GreenHands provides an interactive platform for discovering and organizing community initiatives.

## 🌐 Live Demo

- **Live Application:** [GreenHands](https://greenhands-frontend.vercel.app/)
- **Backend API:** [GreenHands Backend](https://greenhands-backend.vercel.app/)

## ✨ Key Features

- **Community Events:** Discover community-service initiatives and volunteer opportunities.
- **Event Discovery:** Browse upcoming events with relevant information, including dates and locations.
- **Search Functionality:** Find events by searching their titles.
- **Category Filtering:** Filter events by categories such as Environment, Education, Donation, Health, Food Support, and Community Support.
- **Event Details:** Explore individual community events and their information.
- **Event Creation:** Create community events by providing event details, dates, locations, images, and descriptions.
- **User Authentication:** Authentication functionality powered by Better Auth.
- **Database Integration:** MongoDB integration for application data management.
- **Community Highlights:** Explore visual stories featuring community-service activities and initiatives.
- **Responsive Interface:** Accessible and user-friendly layouts across different screen sizes.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui, Base UI |
| Authentication | Better Auth |
| Database | MongoDB |
| Icons | Lucide React |
| Charts | Recharts |
| Date Utilities | date-fns |
| Deployment | Vercel |

## 🏗️ Project Architecture

GreenHands uses a separate frontend and backend architecture.

- **Frontend:** Next.js application responsible for the user interface, event discovery, authentication experience, and event creation.
- **Backend:** Separate backend API responsible for server-side operations and database interactions.
- **Database:** MongoDB for application data persistence.
- **Authentication:** Better Auth with MongoDB integration.

### Related Repository

**Backend Repository:** [GreenHands Server](https://github.com/ireenhoque/greenhands-server)

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB connection
- Access to the GreenHands backend API

### 1. Clone the Repository

```bash
git clone https://github.com/ireenhoque/greenhands-client-.git
```

### 2. Navigate to the Project Directory

```bash
cd greenhands-client-
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root and configure the environment variables required by the application.

Use the corresponding configuration from your local development setup and backend integration.

**Important:** Never commit `.env.local` or expose database credentials, authentication secrets, or other private API keys.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## ☁️ Deployment

The frontend is deployed on **Vercel**.

To deploy your own instance:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables.
3. Set the backend API URL for the production environment.
4. Configure the required MongoDB and Better Auth settings.
5. Deploy the application.

## 🔗 Related Repository

- **Frontend:** [GreenHands Client](https://github.com/ireenhoque/greenhands-client-)
- **Backend:** [GreenHands Server](https://github.com/ireenhoque/greenhands-server)

## 👩‍💻 Author

**Ireen Hoque**

- GitHub: [@ireenhoque](https://github.com/ireenhoque)

---

GreenHands — Small Acts. Stronger Communities.
