package com.chat.dto;

public record TopicResponse(
	    Long id,
	    String name,
	    Long subjectId,
	    int questionCount
	) {
	
}

