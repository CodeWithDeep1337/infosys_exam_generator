package com.skillforge.service;

import com.skillforge.model.Topic;
import com.skillforge.repository.TopicRepository;
import com.skillforge.exception.TopicNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TopicService {

    private final TopicRepository repo;

    public TopicService(TopicRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Topic add(Topic topic) {
        // ✅ UPDATE: Check for Subject object instead of subjectId
        if (topic.getSubject() == null || topic.getName() == null) {
            throw new IllegalArgumentException("Subject and Topic Name are required");
        }
        return repo.save(topic);
    }

    public List<Topic> listAll() {
        return repo.findAll();
    }

    // ✅ UPDATE: Use the repository method that works with Object paths
    public List<Topic> listBySubject(Long subjectId) {
        return repo.findBySubject_Id(subjectId);
    }

    public List<Topic> getTopicsByInstructor(Long instructorId) {
        return repo.findBySubject_Course_Instructor_Id(instructorId);
    }

    public Topic getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new TopicNotFoundException(id));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new TopicNotFoundException(id);
        }
        repo.deleteById(id);
    }

    @Transactional
    public Topic update(Long id, Topic data) {
        return repo.findById(id).map(topic -> {
            if (data.getName() != null) topic.setName(data.getName());
            if (data.getContent() != null) topic.setContent(data.getContent());
            // ✅ UPDATE: Set subject object if needed
            if (data.getSubject() != null) topic.setSubject(data.getSubject());
            if (data.getType() != null) topic.setType(data.getType());
            return repo.save(topic);
        }).orElseThrow(() -> new TopicNotFoundException(id));
    }
}