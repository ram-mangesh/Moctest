package com.chat.repo;

import com.chat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * ADD these two methods to your existing Userrepo interface.
 * Your existing findByEmail() stays unchanged.
 */
public interface Userrepo extends JpaRepository<User, Long> {

    // existing
    Optional<User> findByEmail(String email);

    // ADD: search students by name (case-insensitive) for teacher lookup
    List<User> findByNameContainingIgnoreCaseAndRole(String name, String role);

    // ADD: get all users with role USER
    List<User> findByRole(String role);
}