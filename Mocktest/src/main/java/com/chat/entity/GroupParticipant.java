package com.chat.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class GroupParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @ManyToOne
    @JsonIgnore
    private GroupExam groupExam;

    private Integer score = 0;
    private Integer attempted = 0;    // ✅ NEW

    private Integer timeTaken = 0;
    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public GroupExam getGroupExam() {
		return groupExam;
	}
	public void setGroupExam(GroupExam groupExam) {
		this.groupExam = groupExam;
	}
	public Integer getScore() {
		return score;
	}
	public void setScore(Integer score) {
		this.score = score;
	}
	public Integer getTimeTaken() {
		return timeTaken;
	}
	public void setTimeTaken(Integer timeTaken) {
		this.timeTaken = timeTaken;
	}
	public Integer getAttempted() {
		return attempted;
	}
	public void setAttempted(Integer attempted) {
		this.attempted = attempted;
	}
    
    
}
