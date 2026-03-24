# Folder Structure

```text
backend/
├── src/
│   ├── config/                     # Configuration files
│   │   ├── db.js                   # Database pool connection & auto-table initializations
│   │   └── env.js                  # Centralized secure environment variables
│   │
│   ├── middlewares/                # Global middlewares
│   │   ├── authenticate.js         # Global JWT token verification
│   │   ├── authorize.js            # Global role-based request authorization
│   │   └── errorHandler.js         # Centralized error/crash handling
│   │
│   ├── modules/                    # Feature-based modular architecture
│   │   ├── auth/                   # Authentication logic
│   │   │   ├── auth.controller.js  # HTTP request/response handlers
│   │   │   ├── auth.middleware.js  # Internal security checks
│   │   │   ├── auth.routes.js      # Endpoint routers mapping to controllers
│   │   │   ├── auth.service.js     # Heavy business logic (hashing, JWT signs)
│   │   │   └── auth.validation.js  # Joi schema data validation
│   │   │
│   │   ├── campaigns/              # Campaign functionality
│   │   │   ├── campaign.controller.js
│   │   │   ├── campaign.model.js   # DB table schemas, init, and raw SQL queries
│   │   │   ├── campaign.routes.js
│   │   │   ├── campaign.service.js
│   │   │   └── campaign.validation.js
│   │   │
│   │   └── users/                  # User management functionality
│   │       └── user.model.js       # User table schemas and DB operations
│   │
│   ├── utils/                      # Reusable global helper functions
│   │   ├── hash.js                 # Bcrypt password hashing
│   │   ├── jwt.js                  # JWT token verify logic
│   │   └── pagination.js           # Reusable pagination logic
│   │
│   ├── app.js                      # Express application setup
│   ├── routes.js                   # Master router combining all module routes
│   └── server.js                   # Server entry point
│
├── package.json                    # Backend dependencies and scripts
└── package-lock.json               # Locked dependency tree
```
