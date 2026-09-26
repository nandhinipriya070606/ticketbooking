package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class ShowtimeController {
    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping("/movie/{movieId}")
    public List<Showtime> getShowtimesByMovieId(@PathVariable Long movieId) {
        return showtimeService.getShowtimesByMovieId(movieId);
    }

    @PostMapping
    public Showtime addShowtime(@RequestBody Showtime showtime) {
        return showtimeService.saveShowtime(showtime);
    }
}