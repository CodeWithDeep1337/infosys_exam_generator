package com.skillforge.repository;

import com.skillforge.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    // ✅ FIXED: Reference the enum as Material.MaterialType
    List<Material> findByTopicId(Long topicId);

    // ✅ FIXED: Added the "Material." prefix here
    List<Material> findByType(Material.MaterialType type);
}