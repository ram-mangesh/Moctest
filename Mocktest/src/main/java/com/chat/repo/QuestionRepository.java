package com.chat.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat.entity.DifficultyLevel;
import com.chat.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {


    @org.springframework.data.jpa.repository.Query("SELECT q FROM Question q LEFT JOIN FETCH q.options WHERE q.topic.id = :topicId")
    List<Question> findByTopicId(Long topicId);

	List<Question> findByTopic_Subject_Exam_Id(Long examId);

	List<Question> findByTopicIdAndDifficulty(Long topicId, DifficultyLevel level);

}

