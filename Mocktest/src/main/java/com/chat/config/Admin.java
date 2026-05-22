package com.chat.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.chat.entity.User;
import com.chat.repo.Userrepo;

@Component
public class Admin {

    @Autowired
    private Userrepo userRepo;

    @Autowired
    private PasswordEncoder encoder;

    @PostConstruct
    public void createAdmin() {

        if (userRepo.findByEmail("admin@gmail.com").isEmpty()) {

            User admin = new User();
            admin.setName("System Admin");          // ✅ REQUIRED
            admin.setEmail("admin@gmail.com");
            admin.setPhone("9999999999");           // ✅ REQUIRED
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole("ADMIN");

            userRepo.save(admin);

            System.out.println("✅ Default admin created");
        }
    }
}