# Household Chore Scheduler

An interactive front-end prototype for planning and tracking household chores across multiple household members. Built with React and Vite for CECS-448 (Software Engineering Project).

## Overview

The Household Chore Scheduler is a calendar-based web application that helps households organize and manage daily chores among multiple members. It provides an intuitive interface for scheduling individual tasks, tracking completion status, and bulk-scheduling recurring chores over extended time periods.

## Features

### Interactive Calendar
- Monthly calendar view with day selection
- Visual chore count indicators (completed/total per day)
- "Today" badge for current date
- Navigate between months with arrow buttons
- Calendar remains stable and doesn't resize when switching days

### Household Member Management
- Add and manage multiple household members
- Color-coded system for easy visual identification
- Each member assigned a unique color across the interface

### Chore Management
- Add chores to specific dates
- Assign chores to household members
- Mark chores as done/pending
- Delete chores
- View chores in an organized table format
- Scrollable chore list when many tasks are scheduled

### Bulk Scheduling
- Schedule recurring chores across time periods
- **Weekly Mode**: Select specific days of the week (Mon, Tue, Wed, etc.)
- **Daily Mode**: Schedule chores every day for a period
- Time range options: weeks, months, or years
- Automatically populates chores across multiple dates

### Filtering
- Filter calendar view by household member
- View all chores or only those assigned to specific people
- Filtered counts update dynamically

### Design & UX
- Clean, modern interface with card-based layout
- Color-coded chore assignments with gradient backgrounds
- Responsive design for desktop and mobile
- Smooth interactions with hover states
- Optimized layout to prevent page scrolling and UI shifts
- Fixed-height containers for stable, jolt-free navigation

## Tech Stack

- **React 19** - UI framework with hooks (useState, useMemo)
- **Vite 8** - Fast build tool and dev server with HMR
- **JavaScript (ES6+)** - Modern JavaScript features
- **CSS3** - Custom styling with flexbox and grid layouts
- **ESLint** - Code quality and linting

## Project Structure

```
CECS-448-Project-2--Chore-Scheduler-Prototype/
├── src/
│   ├── components/
│   │   └── ChoreScheduler.jsx    # Main scheduler component
│   ├── data/
│   │   └── initialData.js        # Sample household members and chores
│   ├── utils/
│   │   └── calendarUtils.js      # Date formatting and calendar logic
│   ├── styles/
│   │   └── choreScheduler.css    # All styling
│   ├── assets/                   # Images and icons
│   ├── App.jsx                   # Root component
│   └── main.jsx                  # Entry point
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CECS-448-Project-2--Chore-Scheduler-Prototype
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Usage

### Adding Household Members
1. Enter a name in the "Add person" field under "Household Members"
2. Click "Add Person"
3. New member appears with an assigned color

### Adding Individual Chores
1. Select a date on the calendar
2. Enter chore description in the "Add a chore" field
3. Select the household member to assign
4. Click "Add Chore"

### Scheduling Recurring Chores
1. Scroll to "Schedule Chores for Upcoming Time Periods" section
2. Enter chore title and select assignee
3. Choose frequency (Weekly or Daily)
4. For Weekly: Select specific days of the week
5. For Daily: Choose start date
6. Select time range (e.g., "4 Weeks")
7. Click "Add Series" to create all chore instances

### Marking Chores Complete
1. Select a date with chores
2. Click "Mark Done" button next to a chore
3. Status updates to "Done" and text gets strike-through
4. Click "Undo" to revert

### Filtering by Member
1. Use the "Filter View" dropdown
2. Select a household member or "All Housemates"
3. Calendar updates to show only filtered chores

## Data Persistence

**Note:** This is a prototype application. All data is stored in memory only and will be lost when you refresh the page. For production use, you would need to integrate with a backend API or local storage solution.

## Sample Data

The application comes pre-loaded with sample data:
- 5 household members: Albert, Deep, Justine, Emmanuel, Jacob
- Various chores scheduled across April 2026
- Mix of completed and pending tasks

## Design Decisions

### Layout Optimization
- Calendar panel uses `align-self: start` and `height: fit-content` to prevent resizing
- Details panel set to `min-height: 450px` to minimize page scrolling
- Chore container uses fixed `height: 400px` to eliminate UI jolts when switching days
- Compact spacing throughout for efficient use of screen space

### Color System
- 8 pre-defined colors for household members
- Colors cycle through: blue, red, green, yellow, purple, pink, green, cyan
- Color-coded borders and gradient backgrounds for visual clarity

### UX Considerations
- Sticky chart header stays visible while scrolling chores
- "Today" badge clearly marks current date
- Visual feedback with hover states and transitions
- Scrollable containers prevent layout overflow
- Consistent 400px chore list height for stable page layout

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- CSS Grid and Flexbox support required

## Future Enhancements

Potential features for future development:
- Backend integration for data persistence
- User authentication and multi-household support
- Email/SMS notifications for upcoming chores
- Mobile app version
- Chore rotation algorithms
- Point system or gamification
- Chore templates and categories
- Export/import functionality
- Statistics and completion analytics

## Course Information

**Course:** CECS-448 - Software Engineering  
**Project:** Project 2 - Chore Scheduler Prototype  
**Focus:** Front-end prototype development, UI/UX design, React component architecture

## License

This is an educational project created for CECS-448.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI framework: [React](https://react.dev/)
- Initial template: create-vite
