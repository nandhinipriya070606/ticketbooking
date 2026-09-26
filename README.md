# Movie Booking System 🎬

A complete, modern movie booking system featuring a React (Vite) frontend with a sleek dark cinema UI and a Spring Boot backend with MySQL database integration.

## Features

- **Movie Discovery**: Browse now-showing titles with duration, synopsis, and search filter.
- **Showtime Selection**: View scheduled sessions with theater and date/time details.
- **Interactive Cinema Seat Map**: Visual screen indicator, real-time seat status (Available, Selected, Booked), and live pricing summary.
- **Pessimistic Concurrency Locking**: Prevents double-booking race conditions during high-volume seat reservations.
- **Booking Confirmation & Ticket Receipt**: Summary card with reference ID, seat breakdown, and print capability.
- **Admin Portal**: Add new movies and schedule showtimes with automatic 50-seat generation.
- **Bookings Dashboard**: View all real-time customer bookings stored in the database.

## Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS with custom glassmorphism & responsive dark theme
- **Backend**: Java 17, Spring Boot 3.1, Spring Data JPA, Hibernate ORM
- **Database**: MySQL 8+ / H2 In-Memory
- **Concurrency**: Pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`)

## Quick Start

### 1. Database
Ensure MySQL is running on `localhost:3306` with database `moviebooking`:
- User: `movie` (or `root`)
- Password: configure via `.env` or in `application-mysql.properties`

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

## API Endpoints

- `GET /api/movies` — List all movies
- `POST /api/movies` — Create a new movie
- `GET /api/movies/{id}` — Get movie by ID
- `GET /api/showtimes/movie/{id}` — List showtimes for a movie
- `POST /api/showtimes` — Create a new showtime (auto-generates 50 seats)
- `GET /api/seats/showtime/{id}` — List all seats and availability for a showtime
- `POST /api/bookings` — Book seats with concurrency lock
- `GET /api/bookings` — List all customer bookings
