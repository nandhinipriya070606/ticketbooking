import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8080/api'
const TICKET_PRICE = 14.50

function App() {
  const [activeTab, setActiveTab] = useState('browse') // 'browse', 'bookings', 'admin'
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [selectedShowtime, setSelectedShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [allBookings, setAllBookings] = useState([])
  const [latestBooking, setLatestBooking] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' | 'info' }

  // Admin form state
  const [newMovie, setNewMovie] = useState({ title: '', description: '', duration: '' })
  const [newShowtime, setNewShowtime] = useState({ movieId: '', dateTime: '', theater: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchAllBookings()
    }
  }, [activeTab])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/movies`)
      if (!response.ok) throw new Error('Failed to load movies')
      const data = await response.json()
      setMovies(Array.isArray(data) ? data : data.value || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
      showToast('🕷️ Failed to connect to Spider-Cinema server.', 'error')
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const fetchShowtimes = async (movieId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/showtimes/movie/${movieId}`)
      if (!response.ok) throw new Error('Failed to load showtimes')
      const data = await response.json()
      setShowtimes(Array.isArray(data) ? data : data.value || [])
    } catch (error) {
      console.error('Error fetching showtimes:', error)
      showToast('🕸️ Failed to retrieve multiverse showtimes.', 'error')
      setShowtimes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSeats = async (showtimeId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/seats/showtime/${showtimeId}`)
      if (!response.ok) throw new Error('Failed to load seats')
      const data = await response.json()
      setSeats(Array.isArray(data) ? data : data.value || [])
    } catch (error) {
      console.error('Error fetching seats:', error)
      showToast('🕷️ Failed to load seat grid.', 'error')
      setSeats([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/bookings`)
      if (!response.ok) throw new Error('Failed to load bookings')
      const data = await response.json()
      setAllBookings(Array.isArray(data) ? data : data.value || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      showToast('Failed to fetch bookings list.', 'error')
      setAllBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie)
    setSelectedShowtime(null)
    setSeats([])
    setSelectedSeats([])
    setLatestBooking(null)
    fetchShowtimes(movie.id)
  }

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime)
    setSelectedSeats([])
    setLatestBooking(null)
    fetchSeats(showtime.id)
  }

  const handleSeatSelect = (seat) => {
    if (seat.status !== 'available') {
      showToast(`🕸️ Seat ${seat.seatNumber} is already occupied by another web-head!`, 'error')
      return
    }
    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber))
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber])
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!customerName.trim() || !email.trim()) {
      showToast('⚠️ Please enter your Hero/Citizen Name and Email.', 'error')
      return
    }
    if (selectedSeats.length === 0) {
      showToast('⚠️ Please select at least one seat from the grid.', 'error')
      return
    }

    setIsSubmitting(true)
    const bookingData = {
      showtimeId: selectedShowtime.id,
      customerName: customerName.trim(),
      email: email.trim(),
      seatNumbers: selectedSeats
    }

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      const result = await response.json()
      if (response.ok) {
        setLatestBooking(result)
        showToast(`🎉 BOOM! Booking confirmed for ${selectedSeats.length} seat(s)!`, 'success')
        fetchSeats(selectedShowtime.id)
        setSelectedSeats([])
        setCustomerName('')
        setEmail('')
      } else {
        showToast(result.error || 'Booking failed. Some seats were snagged in another dimension!', 'error')
        fetchSeats(selectedShowtime.id)
      }
    } catch (error) {
      console.error('Booking error:', error)
      showToast('Network error while slinging ticket request.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMovie = async (e) => {
    e.preventDefault()
    if (!newMovie.title.trim() || !newMovie.duration) {
      showToast('Please provide movie title and duration.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMovie.title.trim(),
          description: newMovie.description.trim(),
          duration: parseInt(newMovie.duration, 10)
        })
      })
      if (response.ok) {
        showToast('🕷️ Movie added to Spider-Cinema lineup!', 'success')
        fetchMovies()
        setNewMovie({ title: '', description: '', duration: '' })
      } else {
        const res = await response.json()
        showToast(res.error || 'Failed to add movie', 'error')
      }
    } catch (error) {
      showToast('Network error while adding movie.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddShowtime = async (e) => {
    e.preventDefault()
    if (!newShowtime.movieId || !newShowtime.dateTime || !newShowtime.theater.trim()) {
      showToast('Please fill all showtime parameters.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/showtimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie: { id: parseInt(newShowtime.movieId, 10) },
          dateTime: newShowtime.dateTime,
          theater: newShowtime.theater.trim()
        })
      })
      if (response.ok) {
        showToast('🕸️ Showtime scheduled with 50 auto-generated seats!', 'success')
        if (selectedMovie && selectedMovie.id === parseInt(newShowtime.movieId, 10)) {
          fetchShowtimes(selectedMovie.id)
        }
        setNewShowtime({ movieId: '', dateTime: '', theater: '' })
      } else {
        const res = await response.json()
        showToast(res.error || 'Failed to schedule showtime', 'error')
      }
    } catch (error) {
      showToast('Network error while scheduling showtime.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetBrowseFlow = () => {
    setSelectedMovie(null)
    setSelectedShowtime(null)
    setSeats([])
    setSelectedSeats([])
    setLatestBooking(null)
  }

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="app-container">
      {/* Spider-Sense Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* Spider-Man Header */}
      <header className="header">
        <div className="header-brand" onClick={() => { setActiveTab('browse'); resetBrowseFlow(); }}>
          <div className="brand-logo">🕷️</div>
          <div>
            <h1 className="brand-title">SPIDER-CINEMA</h1>
            <p className="brand-subtitle">🕸️ Multiverse Web-Slinging Cinema</p>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => { setActiveTab('browse'); resetBrowseFlow(); }}
          >
            🕷️ Movie Guide
          </button>
          <button
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            🕸️ Web Passes
          </button>
          <button
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            ⚙️ Daily Bugle HQ
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="content">
        {/* ================= BROWSE & BOOKING FLOW ================= */}
        {activeTab === 'browse' && (
          <div className="browse-flow">
            {/* Step 1: Movie Selection */}
            {!selectedMovie && (
              <section className="section-container">
                <div className="section-header-bar">
                  <div>
                    <h2 className="section-title">🕷️ Now Showing Across Dimensions</h2>
                    <p className="section-subtitle">Pick your movie adventure and web-shoot into the best theater seats</p>
                  </div>
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search Spider-Verse & movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="loading-spinner-box">
                    <div className="spinner"></div>
                    <p>Slinging movie feeds from the database...</p>
                  </div>
                ) : filteredMovies.length === 0 ? (
                  <div className="empty-state">
                    <p>No movies in this dimension yet.</p>
                    <button className="btn-primary" onClick={() => setActiveTab('admin')}>
                      + Add New Movie in Daily Bugle HQ
                    </button>
                  </div>
                ) : (
                  <div className="movie-grid">
                    {filteredMovies.map((movie) => (
                      <div
                        key={movie.id}
                        className="movie-card"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <div className="movie-card-banner">
                          <div className="movie-poster-icon">🕷️</div>
                          <span className="duration-pill">⏱️ {movie.duration} MIN</span>
                        </div>
                        <div className="movie-card-body">
                          <h3 className="movie-title">{movie.title}</h3>
                          <p className="movie-desc">{movie.description || 'Watch in Spider-Vision 4K Laser with Dolby Atmos audio immersion.'}</p>
                          <div className="movie-card-footer">
                            <span className="movie-badge">🕸️ IMAX 3D LASER</span>
                            <button className="btn-select">View Showtimes →</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Step 2: Showtime Selection */}
            {selectedMovie && !selectedShowtime && (
              <section className="section-container">
                <div className="breadcrumb-nav">
                  <button className="breadcrumb-back-btn" onClick={resetBrowseFlow}>
                    ← Back to Movies
                  </button>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-active">{selectedMovie.title}</span>
                </div>

                <div className="movie-hero-summary">
                  <div className="hero-poster">🕸️</div>
                  <div className="hero-details">
                    <h2 className="hero-title">{selectedMovie.title}</h2>
                    <p className="hero-desc">{selectedMovie.description}</p>
                    <div className="hero-meta">
                      <span>⏱️ {selectedMovie.duration} Minutes</span>
                      <span>•</span>
                      <span>Dolby Atmos Spatial Web Audio</span>
                      <span>•</span>
                      <span>Queens IMAX Laser Experience</span>
                    </div>
                  </div>
                </div>

                <h3 className="section-title mt-4">🎟️ Select a Showtime</h3>
                {loading ? (
                  <div className="loading-spinner-box">
                    <div className="spinner"></div>
                    <p>Loading showtimes...</p>
                  </div>
                ) : showtimes.length === 0 ? (
                  <div className="empty-state">
                    <p>No showtimes scheduled yet for this title.</p>
                    <button className="btn-primary" onClick={() => setActiveTab('admin')}>
                      + Schedule Showtime in Daily Bugle HQ
                    </button>
                  </div>
                ) : (
                  <div className="showtime-grid">
                    {showtimes.map((showtime) => (
                      <div
                        key={showtime.id}
                        className="showtime-card"
                        onClick={() => handleShowtimeSelect(showtime)}
                      >
                        <div className="showtime-theater">🏛️ {showtime.theater}</div>
                        <div className="showtime-date">{formatDateTime(showtime.dateTime)}</div>
                        <div className="showtime-price">Web Ticket: ${TICKET_PRICE.toFixed(2)} / seat</div>
                        <button className="btn-select mt-2">Choose Seats →</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Step 3 & 4: Seat Selection & Confirmation */}
            {selectedMovie && selectedShowtime && (
              <section className="section-container">
                <div className="breadcrumb-nav">
                  <button className="breadcrumb-back-btn" onClick={resetBrowseFlow}>
                    Movies
                  </button>
                  <span className="breadcrumb-separator">/</span>
                  <button className="breadcrumb-back-btn" onClick={() => { setSelectedShowtime(null); setLatestBooking(null); }}>
                    {selectedMovie.title}
                  </button>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-active">Seat Selection</span>
                </div>

                {latestBooking ? (
                  /* Spider-Man Multiverse Ticket Receipt */
                  <div className="ticket-receipt-card">
                    <div className="ticket-header">
                      <div className="ticket-success-badge">🕷️ STARK MULTIVERSE PASS CONFIRMED</div>
                      <h2 className="ticket-movie-title">{latestBooking.showtime?.movie?.title || selectedMovie.title}</h2>
                      <p className="ticket-theater">🏛️ {latestBooking.showtime?.theater || selectedShowtime.theater}</p>
                    </div>

                    <div className="ticket-body">
                      <div className="ticket-info-row">
                        <div>
                          <label>Date & Showtime</label>
                          <p>{formatDateTime(latestBooking.showtime?.dateTime || selectedShowtime.dateTime)}</p>
                        </div>
                        <div>
                          <label>Spider Pass ID</label>
                          <p className="text-primary">#SPIDEY-{latestBooking.id?.toString().padStart(6, '0')}</p>
                        </div>
                      </div>

                      <div className="ticket-info-row">
                        <div>
                          <label>Hero / Citizen Name</label>
                          <p>{latestBooking.customerName}</p>
                          <small className="text-muted">{latestBooking.email}</small>
                        </div>
                        <div>
                          <label>Reserved Web-Seats</label>
                          <p className="ticket-seats-highlight">{latestBooking.seatNumbers?.join(', ')}</p>
                        </div>
                      </div>

                      <div className="ticket-info-row total-row">
                        <div>
                          <label>Total Web-Charges</label>
                          <p className="ticket-total">${((latestBooking.seatNumbers?.length || 1) * TICKET_PRICE).toFixed(2)}</p>
                        </div>
                        <div>
                          <label>Clearance</label>
                          <p className="text-success">Authorized & Cleared</p>
                        </div>
                      </div>
                    </div>

                    <div className="ticket-footer">
                      <button className="btn-primary" onClick={resetBrowseFlow}>
                        🕷️ Book Another Movie
                      </button>
                      <button className="btn-secondary" onClick={() => window.print()}>
                        🖨️ Print Spider Pass
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Interactive Spider-Vision Seat Map & Booking Form */
                  <div className="booking-layout">
                    <div className="seat-selection-panel">
                      <div className="showtime-quick-info">
                        <strong>{selectedMovie.title}</strong> • {selectedShowtime.theater} • {formatDateTime(selectedShowtime.dateTime)}
                      </div>

                      {/* Screen Indicator */}
                      <div className="cinema-screen-wrapper">
                        <div className="cinema-screen"></div>
                        <span className="screen-label">🕸️ SPIDER-VISION IMAX CURVED SCREEN 🕸️</span>
                      </div>

                      {/* Legend */}
                      <div className="seat-legend">
                        <div className="legend-item">
                          <span className="seat-sample available"></span> Available
                        </div>
                        <div className="legend-item">
                          <span className="seat-sample selected"></span> Selected (Suit Red)
                        </div>
                        <div className="legend-item">
                          <span className="seat-sample booked"></span> Booked (Symbiote)
                        </div>
                      </div>

                      {/* Seats Grid */}
                      {loading ? (
                        <div className="loading-spinner-box">
                          <div className="spinner"></div>
                          <p>Synchronizing spider grid...</p>
                        </div>
                      ) : (
                        <div className="seats-grid">
                          {seats.map((seat) => {
                            const isSelected = selectedSeats.includes(seat.seatNumber)
                            const isBooked = seat.status !== 'available'
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                className={`seat-item ${seat.status} ${isSelected ? 'selected' : ''}`}
                                disabled={isBooked}
                                onClick={() => handleSeatSelect(seat)}
                                title={`Seat ${seat.seatNumber} (${seat.status})`}
                              >
                                {seat.seatNumber}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Booking Form Sidebar */}
                    <div className="booking-sidebar">
                      <h3 className="sidebar-title">🕸️ Ticket Summary</h3>
                      
                      <div className="summary-item">
                        <span>Movie:</span>
                        <strong>{selectedMovie.title}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Theater:</span>
                        <span>{selectedShowtime.theater}</span>
                      </div>
                      <div className="summary-item">
                        <span>Time:</span>
                        <span>{formatDateTime(selectedShowtime.dateTime)}</span>
                      </div>
                      <div className="summary-item">
                        <span>Selected Seats:</span>
                        <strong className="text-primary">
                          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                        </strong>
                      </div>
                      <div className="summary-item">
                        <span>Price per seat:</span>
                        <span>${TICKET_PRICE.toFixed(2)}</span>
                      </div>

                      <hr className="divider" />

                      <div className="summary-total">
                        <span>Total Due:</span>
                        <span className="total-price">${(selectedSeats.length * TICKET_PRICE).toFixed(2)}</span>
                      </div>

                      <form onSubmit={handleBooking} className="customer-form">
                        <div className="form-group">
                          <label htmlFor="customerName">Hero / Citizen Name *</label>
                          <input
                            id="customerName"
                            type="text"
                            placeholder="e.g. Peter Parker / Miles Morales"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="customerEmail">Comms / Email Address *</label>
                          <input
                            id="customerEmail"
                            type="email"
                            placeholder="spidey@dailybugle.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn-primary btn-block"
                          disabled={selectedSeats.length === 0 || isSubmitting}
                        >
                          {isSubmitting ? '🕷️ Slinging Web...' : `Web-Shoot & Reserve (${selectedSeats.length})`}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* ================= ALL BOOKINGS TAB ================= */}
        {activeTab === 'bookings' && (
          <section className="section-container">
            <div className="section-header-bar">
              <div>
                <h2 className="section-title">🕸️ Multiverse Pass Log</h2>
                <p className="section-subtitle">Real-time database log of all booked Spider-Cinema passes</p>
              </div>
              <button className="btn-secondary" onClick={fetchAllBookings}>
                🔄 Refresh Feed
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner-box">
                <div className="spinner"></div>
                <p>Loading database records...</p>
              </div>
            ) : allBookings.length === 0 ? (
              <div className="empty-state">
                <p>No web-passes claimed yet.</p>
                <button className="btn-primary" onClick={() => setActiveTab('browse')}>
                  Browse Lineup & Book Seats
                </button>
              </div>
            ) : (
              <div className="bookings-table-wrapper">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Movie</th>
                      <th>Theater & Time</th>
                      <th>Citizen Name</th>
                      <th>Email</th>
                      <th>Reserved Seats</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b) => (
                      <tr key={b.id}>
                        <td><strong className="text-primary">#SPIDEY-{b.id?.toString().padStart(4, '0')}</strong></td>
                        <td>{b.showtime?.movie?.title || '—'}</td>
                        <td>
                          {b.showtime?.theater || '—'} <br />
                          <small className="text-muted">{formatDateTime(b.showtime?.dateTime)}</small>
                        </td>
                        <td>{b.customerName}</td>
                        <td>{b.email}</td>
                        <td>
                          <span className="seats-tag">
                            {Array.isArray(b.seatNumbers) ? b.seatNumbers.join(', ') : '—'}
                          </span>
                        </td>
                        <td><small>{formatDateTime(b.bookingTime)}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ================= ADMIN PORTAL TAB ================= */}
        {activeTab === 'admin' && (
          <section className="section-container">
            <div className="section-header-bar">
              <div>
                <h2 className="section-title">⚙️ Daily Bugle Dispatch HQ</h2>
                <p className="section-subtitle">Add movie premieres and schedule showtimes with auto-generated seat grids</p>
              </div>
            </div>

            <div className="admin-grid">
              {/* Add Movie Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>🎬 Add New Movie Title</h3>
                  <p>Publish a new blockbuster to the Spider-Cinema system</p>
                </div>
                <form onSubmit={handleAddMovie} className="admin-form">
                  <div className="form-group">
                    <label>Movie Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Spider-Man: Beyond the Spider-Verse"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description / Synopsis</label>
                    <textarea
                      rows="3"
                      placeholder="Miles Morales embarks on his greatest dimension-hopping trial..."
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Minutes) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="140"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary btn-block" disabled={isSubmitting}>
                    {isSubmitting ? '🕷️ Publishing...' : '+ Add Movie'}
                  </button>
                </form>
              </div>

              {/* Add Showtime Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>🎟️ Schedule Dimension Showtime</h3>
                  <p>Schedules a session and auto-generates 50 interactive seats</p>
                </div>
                <form onSubmit={handleAddShowtime} className="admin-form">
                  <div className="form-group">
                    <label>Select Movie *</label>
                    <select
                      value={newShowtime.movieId}
                      onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Movie --</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} ({m.duration} min)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date & Showtime *</label>
                    <input
                      type="datetime-local"
                      value={newShowtime.dateTime}
                      onChange={(e) => setNewShowtime({ ...newShowtime, dateTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Theater / Screen Room *</label>
                    <input
                      type="text"
                      placeholder="e.g. Queens IMAX Web Room 1, Brooklyn Dolby Screen 2"
                      value={newShowtime.theater}
                      onChange={(e) => setNewShowtime({ ...newShowtime, theater: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary btn-block" disabled={isSubmitting}>
                    {isSubmitting ? '🕸️ Generating Grid...' : '+ Schedule Showtime'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App