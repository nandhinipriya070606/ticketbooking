package com.example.moviebooking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;

    private String customerName;
    private String email;
    private LocalDateTime bookingTime;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> seatNumbers;

    // constructors, getters, setters
    public Booking() {}

    public Booking(Showtime showtime, String customerName, String email, List<String> seatNumbers) {
        this.showtime = showtime;
        this.customerName = customerName;
        this.email = email;
        this.bookingTime = LocalDateTime.now();
        this.seatNumbers = seatNumbers;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Showtime getShowtime() { return showtime; }
    public void setShowtime(Showtime showtime) { this.showtime = showtime; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
}