package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Seat;
import com.example.moviebooking.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {
    @Autowired
    private SeatService seatService;

    @GetMapping("/showtime/{showtimeId}")
    public List<Seat> getSeatsByShowtimeId(@PathVariable Long showtimeId) {
        return seatService.getSeatsByShowtimeId(showtimeId);
    }
}