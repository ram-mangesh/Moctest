package com.chat.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.chat.entity.Topic;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findBySubjectId(Long subjectId);
}
