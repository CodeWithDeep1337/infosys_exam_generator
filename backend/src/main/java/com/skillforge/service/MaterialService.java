package com.skillforge.service;

import com.skillforge.model.Material;
import com.skillforge.repository.MaterialRepository;
import com.skillforge.exception.MaterialNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MaterialService {

    private final MaterialRepository materialRepository;

    public MaterialService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    // CREATE
    public Material save(Material material) {
        return materialRepository.save(material);
    }

    // READ
    public List<Material> findAll() {
        return materialRepository.findAll();
    }

    public Material findById(Long id) {
        return materialRepository.findById(id)
                // ✅ Fixes line 34: Converts Long to String for the Exception
                .orElseThrow(() -> new MaterialNotFoundException("Material not found with id: " + id));
    }

    public List<Material> findByTopicId(Long topicId) {
        // ✅ Matches the Long type in MaterialRepository
        return materialRepository.findByTopicId(topicId);
    }

    // UPDATE
    public Material update(Long id, Material details) {
        return materialRepository.findById(id)
                .map(material -> {
                    material.setTitle(details.getTitle());
                    material.setType(details.getType());
                    material.setLink(details.getLink());
                    material.setFilePath(details.getFilePath());
                    material.setFileType(details.getFileType());
                    material.setTopicId(details.getTopicId());
                    return materialRepository.save(material);
                })
                // ✅ Fixes line 53: Converts Long to String for the Exception
                .orElseThrow(() -> new MaterialNotFoundException("Could not update. Material not found with id: " + id));
    }

    // DELETE
    public void deleteById(Long id) {
        if (!materialRepository.existsById(id)) {
            // ✅ Fixes line 59: Converts Long to String for the Exception
            throw new MaterialNotFoundException("Could not delete. Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }
}