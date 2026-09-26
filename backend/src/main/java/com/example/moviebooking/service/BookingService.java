package com.example.moviebooking.service;

import com.example.moviebooking.entity.Booking;
import com.example.moviebooking.entity.Seat;
import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatService seatService;

    @Transactional
    public Booking bookSeats(Showtime showtime, String customerName, String email, List<String> seatNumbers) {
        if (showtime == null) {
            throw new IllegalArgumentException("Showtime cannot be null");
        }
        if (customerName == null || customerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected");
        }

        // Lock the seats
        List<Seat> seats = seatService.getSeatsByShowtimeIdAndSeatNumbersWithLock(showtime.getId(), seatNumbers);

        if (seats.size() != seatNumbers.size()) {
            throw new IllegalArgumentException("One or more selected seats do not exist for this showtime");
        }

        // Check if all seats are available
        for (Seat seat : seats) {
            if (!"available".equalsIgnoreCase(seat.getStatus())) {
                throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already booked");
            }
        }

        // Mark seats as booked
        for (Seat seat : seats) {
            seat.setStatus("booked");
        }
        seatService.saveSeats(seats);

        // Create booking
        Booking booking = new Booking(showtime, customerName.trim(), email.trim(), seatNumbers);
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingTimeDesc();
    }
}