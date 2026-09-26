package com.example.moviebooking;

import com.example.moviebooking.entity.Movie;
import com.example.moviebooking.entity.Seat;
import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.repository.MovieRepository;
import com.example.moviebooking.repository.SeatRepository;
import com.example.moviebooking.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Override
    public void run(String... args) throws Exception {
        if (movieRepository.count() == 0) {
            // Create sample movies
            Movie movie1 = new Movie("Inception", "A mind-bending thriller", 148);
            Movie movie2 = new Movie("The Dark Knight", "A superhero action film", 152);
            movieRepository.saveAll(Arrays.asList(movie1, movie2));

            // Create showtimes
            Showtime showtime1 = new Showtime(movie1, LocalDateTime.now().plusDays(1).withHour(14).withMinute(0), "Theater 1");
            Showtime showtime2 = new Showtime(movie1, LocalDateTime.now().plusDays(1).withHour(18).withMinute(0), "Theater 1");
            Showtime showtime3 = new Showtime(movie2, LocalDateTime.now().plusDays(2).withHour(16).withMinute(0), "Theater 2");
            showtimeRepository.saveAll(Arrays.asList(showtime1, showtime2, showtime3));

            // Create seats for each showtime
            for (Showtime showtime : Arrays.asList(showtime1, showtime2, showtime3)) {
                for (int row = 1; row <= 5; row++) {
                    for (int col = 1; col <= 10; col++) {
                        Seat seat = new Seat(showtime, "R" + row + "C" + col, "available");
                        seatRepository.save(seat);
                    }
                }
            }
        }
    }
}