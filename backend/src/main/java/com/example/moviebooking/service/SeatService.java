package com.example.moviebooking.service;

import com.example.moviebooking.entity.Seat;
import com.example.moviebooking.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {
    @Autowired
    private SeatRepository seatRepository;

    public List<Seat> getSeatsByShowtimeId(Long showtimeId) {
        return seatRepository.findByShowtimeId(showtimeId);
    }

    public List<Seat> getSeatsByShowtimeIdAndSeatNumbersWithLock(Long showtimeId, List<String> seatNumbers) {
        return seatRepository.findByShowtimeIdAndSeatNumbersWithLock(showtimeId, seatNumbers);
    }

    public void saveSeats(List<Seat> seats) {
        seatRepository.saveAll(seats);
    }
}