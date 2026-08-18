# Frontend Components

## Component Hierarchy

```mermaid
graph TB
    Root["layout.tsx<br/>Providers + Theme + Navbar + Footer"]

    subgraph "Routes (src/app)"
        Index["page.tsx (Home)"]
        Analytics["analytics/page.tsx"]
        Bookmarks["bookmarks/page.tsx"]
        Login["login/page.tsx"]
        Profile["profile/page.tsx"]
        Register["register/page.tsx"]
    end

    subgraph "Layout Components"
        NavBar["NavBar"]
        Footer["Footer"]
    end

    subgraph "Feature Components"
        IssueCard["IssueCard"]
        FilterPanel["FilterPanel"]
        Dashboard["AnalyticsDashboard"]
        BookmarkList["BookmarkList"]
        SearchTerminal["SearchTerminal"]
        SearchForm["SearchForm"]
    end

    subgraph "Auth Components"
        UserMenu["UserMenu"]
    end

    Root --> NavBar
    Root --> Index
    Root --> Analytics
    Root --> Bookmarks
    Root --> Login
    Root --> Register
    Root --> Footer

    Index --> SearchTerminal
    SearchTerminal --> FilterPanel
    SearchTerminal --> SearchForm
    Index --> IssueCard
    Analytics --> Dashboard
    NavBar --> UserMenu
```

---

## Key Components

### NavBar

- Displays logo, navigation links
- Shows user menu when authenticated
- Login/Register links when not authenticated

### IssueCard

- Displays GitHub issue details
- Bookmark button
- Labels with colors
- Difficulty indicator

### SearchTerminal

- Main search interface on the home page
- Integrated with `SearchForm` and `FilterPanel`
- Handles mobile and desktop variants
- Debounces search inputs and updates URL search parameters

### AnalyticsDashboard

- Tabs: Overview, Repositories, Recommendations
- Language distribution chart
- Repository stats cards
- Filter by language

### FilterPanel

- Language filter
- Stars filter
- Date range
- Checkboxes for "Assigned", "Has Pull Requests", "Bookmarked"

---

## Context Providers

```mermaid
graph TB
    AuthProvider["AuthProvider<br/>(contexts/AuthContext.tsx)"]
    ThemeProvider["ThemeProvider<br/>(contexts/ThemeContext.tsx)"]

    subgraph "Provides"
        User["user: User | null"]
        IsAuth["isAuthenticated: boolean"]
        Login["login()"]
        Logout["logout()"]
        Register["register()"]
    end

    AuthProvider --> User
    AuthProvider --> IsAuth
    AuthProvider --> Login
    AuthProvider --> Logout
```

---

## Custom Hooks

| Hook                | Purpose                  |
| ------------------- | ------------------------ |
| `useAuth()`         | Access auth context      |
| `useBookmarks()`    | Bookmark CRUD operations |

---

## Styling

- **Framework**: Tailwind CSS
- **Theme**: Dark and light mode support via CSS variables
- **Design System**: Clean, modern interface
- **Fonts**: Inter (Sans) and Fira Code (Mono)
- **Components**: Radix UI primitives and custom elements
