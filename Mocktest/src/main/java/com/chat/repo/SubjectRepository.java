package com.chat.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.chat.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
	
	List<Subject> findByExamId(Long examId);
	
    List<Subject> findByExam_NameIgnoreCase(String examName);


}
