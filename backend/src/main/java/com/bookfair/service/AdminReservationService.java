package com.bookfair.service;

import com.bookfair.entity.EventStall;
import com.bookfair.entity.EventStallStatus;
import com.bookfair.features.reservation.Reservation;
import com.bookfair.features.reservation.ReservationRepository;
import com.bookfair.repository.EventStallRepository;
import com.bookfair.exception.BadRequestException;
import com.bookfair.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReservationService {

    private final ReservationRepository reservationRepository;
    private final EventStallRepository eventStallRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
    }

    @Transactional
    public void adminConfirmPayment(Long reservationId) {
        Reservation res = getReservationById(reservationId);
        if (res.getStatus() != Reservation.ReservationStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Reservation is not in PENDING_PAYMENT status");
        }
        res.setStatus(Reservation.ReservationStatus.PAID);
        reservationRepository.save(res);
        auditLogService.logAudit("ADMIN_CONFIRM_PAYMENT", "RESERVATION", reservationId, "Manual payment confirmation by admin");
    }

    @Transactional
    public void adminCancelReservation(Long reservationId, String reason) {
        Reservation res = getReservationById(reservationId);
        if (res.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new BadRequestException("Reservation is already cancelled");
        }
        
        EventStall stall = res.getEventStall();
        if (stall != null) {
            stall.setStatus(EventStallStatus.AVAILABLE);
            eventStallRepository.save(stall);
        }

        res.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationRepository.save(res);
        auditLogService.logAudit("ADMIN_CANCEL_RESERVATION", "RESERVATION", reservationId, Map.of("reason", reason != null ? reason : ""));
    }

    @Transactional(readOnly = true)
    public byte[] exportReservationsCsv() {
        List<Reservation> reservations = reservationRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Vendor,Email,QRCode,Status,TotalLKR,CreatedAt\n");
        for (Reservation r : reservations) {
            sb.append(r.getId()).append(',')
              .append(r.getUser() != null ? r.getUser().getUsername() : "").append(',')
              .append(r.getUser() != null ? r.getUser().getEmail() : "").append(',')
              .append(r.getQrCode()).append(',')
              .append(r.getStatus()).append(',')
              .append(r.getEventStall() != null && r.getEventStall().getFinalPriceCents() != null ? r.getEventStall().getFinalPriceCents() : 0).append(',')
              .append(r.getCreatedAt()).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional
    public void refundReservation(Long reservationId, String reason) {
        Reservation reservation = getReservationById(reservationId);
        
        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING_REFUND &&
            reservation.getStatus() != Reservation.ReservationStatus.PAID) {
            throw new BadRequestException("Only PAID or PENDING_REFUND reservations can be refunded.");
        }

        EventStall stall = reservation.getEventStall();
        if (stall != null) {
            stall.setStatus(EventStallStatus.AVAILABLE);
            eventStallRepository.save(stall);
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        auditLogService.logAudit("REFUND_ISSUED", "RESERVATION", reservationId, Map.of("reason", reason != null ? reason : ""));
    }
}
