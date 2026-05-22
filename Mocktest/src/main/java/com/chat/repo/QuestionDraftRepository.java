package com.chat.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.chat.entity.QuestionDraft;


public interface QuestionDraftRepository
        extends JpaRepository<QuestionDraft, Long> {

    List<QuestionDraft> findByTopicId(Long topicId);
    @Modifying
    @Transactional
    void deleteByTopicId(Long topicId);
}