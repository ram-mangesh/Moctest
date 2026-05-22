package com.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Task 3 + Task 9 — Enable @Async (for email hooks) and @Scheduled (for weekly nudges).
 *
 * ADD this class to your project under com.chat.config package.
 * You do NOT need to modify your main Application.java file.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class SchedulingConfig {
    // Spring picks this up automatically via component scan
}