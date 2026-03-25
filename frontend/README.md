# Frontend Folder Structure

```text
src/
├── assets/                           # Added global images, SVGs, and fonts
│
├── components/                       # Extracted reusable UI elements and component wrappers
│   ├── RouteGuards.jsx               # Implemented router guards (PrivateRoute, PublicRoute, RoleRoute)
│   └── ScrollLock.jsx                # Added utility to prevent background scrolling behind modals
│
├── features/                         # Initialized feature-based state and API modularity
│   └── creator/                      # Grouped campaign and creator specific logic
│       ├── creatorAPI.js             # Added fetch adapters for /campaigns backend endpoints
│       └── creatorSlice.js           # Created custom hooks (useCampaigns) for local state logic
│
├── pages/                            # Organized full page views by primary feature area
│   │
│   ├── Admin/                        # Created admin-only dashboard section
│   │   └── AdminDashboard.jsx        # Built dashboard for site administrators
│   │
│   ├── Auth/                         # Grouped authentication pages
│   │   ├── Login.jsx                 # Implemented login modal and JWT storage logic
│   │   └── Signup.jsx                # Implemented user registration modal 
│   │
│   ├── CreatorDashboard/             # Scaffolded dashboard for verified fundraisers
│   │   ├── Campaigns.jsx             # Added stub for user campaigns management list
│   │   └── CreateCampaignModal.jsx   # Built form to create new fundraising campaigns
│   │
│   ├── Feed/                         # Built main community feed component hierarchy
│   │   ├── FeedMain.tsx              # Added layout wrapper combining Sidebar and Feed content
│   │   └── components/               # Extracted feed-specific subcomponents
│   │       ├── Feed.tsx              # Integrated infinite scroll main feed with API
│   │       ├── FeedCard.tsx          # Built individual post/campaign UI card
│   │       ├── Navbar.tsx            # Enhanced top nav with Create dropdown & profile menu
│   │       ├── Sidebar.tsx           # Added left side navigation links
│   │       ├── RightSidebar.tsx      # Added right side trends and analytics
│   │       └── ImageFallback/        # Added error fallback handlers for broken images
│   │
│   └── Home/                         # Grouped public unauthenticated pages
│       └── LandingMain.tsx           # Designed public landing page for logged-out viewers
│
├── routes/                           # Centralized React Router definitions
│   └── AppRoutes.jsx                 # Connected all <Routes> to role-based guards
│
├── App.jsx                           # Built root React component to manage auth state mapping
├── index.css                         # Setup global Tailwind CSS v4 imports
├── main.jsx                          # Configured React DOM entry and BrowserRouter root
├── RefreshHandler.jsx                # Added utility to sync local auth state on hard reload
└── utils.jsx                         # Extracted global helpers like toastify notifications
```
