package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Booking;
import com.example.moviebooking.service.BookingService;
import com.example.moviebooking.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @Autowired
    private ShowtimeService showtimeService;

    @PostMapping
    public Booking bookSeats(@RequestBody Map<String, Object> bookingRequest) {
        Long showtimeId = Long.valueOf(bookingRequest.get("showtimeId").toString());
        String customerName = (String) bookingRequest.get("customerName");
        String email = (String) bookingRequest.get("email");
        Object seatNumbersObj = bookingRequest.get("seatNumbers");
        List<String> seatNumbers;
        if (seatNumbersObj instanceof List<?> list) {
            seatNumbers = list.stream()
                    .map(Object::toString)
                    .toList();
        } else {
            throw new IllegalArgumentException("seatNumbers must be a list");
        }

        var showtime = showtimeService.getShowtimeById(showtimeId);
        return bookingService.bookSeats(showtime, customerName, email, seatNumbers);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
}