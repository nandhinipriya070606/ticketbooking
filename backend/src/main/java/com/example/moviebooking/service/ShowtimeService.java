package com.example.moviebooking.service;

import com.example.moviebooking.entity.Movie;
import com.example.moviebooking.entity.Seat;
import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.repository.MovieRepository;
import com.example.moviebooking.repository.SeatRepository;
import com.example.moviebooking.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ShowtimeService {
    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private SeatRepository seatRepository;

    public List<Showtime> getShowtimesByMovieId(Long movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }

    public Showtime getShowtimeById(Long id) {
        return showtimeRepository.findById(id).orElse(null);
    }

    @Transactional
    public Showtime saveShowtime(Showtime showtime) {
        if (showtime.getMovie() != null && showtime.getMovie().getId() != null) {
            Movie movie = movieRepository.findById(showtime.getMovie().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Movie not found with id: " + showtime.getMovie().getId()));
            showtime.setMovie(movie);
        } else {
            throw new IllegalArgumentException("Valid movie must be specified for showtime");
        }

        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Auto-generate standard seats (5 rows x 10 columns) if none exist yet
        List<Seat> existingSeats = seatRepository.findByShowtimeId(savedShowtime.getId());
        if (existingSeats.isEmpty()) {
            List<Seat> seats = new ArrayList<>();
            for (int row = 1; row <= 5; row++) {
                for (int col = 1; col <= 10; col++) {
                    seats.add(new Seat(savedShowtime, "R" + row + "C" + col, "available"));
                }
            }
            seatRepository.saveAll(seats);
        }

        return savedShowtime;
    }
}