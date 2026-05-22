package com.chat.dto;

public record SubjectResponse(
        Long id,
        String name,
        Long examId,
        int topicCount
) {}
