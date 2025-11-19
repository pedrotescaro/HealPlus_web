package com.healplus.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {
    
    public void logAction(String userId, String action, String resourceType, String resourceId, Map<String, Object> details) {
        Map<String, Object> auditLog = new HashMap<>();
        auditLog.put("timestamp", Instant.now());
        auditLog.put("userId", userId);
        auditLog.put("action", action);
        auditLog.put("resourceType", resourceType);
        auditLog.put("resourceId", resourceId);
        if (details != null) {
            auditLog.putAll(details);
        }
        
        // Log estruturado para auditoria
        log.info("AUDIT: {}", auditLog);
        
        // Aqui você pode adicionar persistência em banco de dados se necessário
        // auditRepository.save(new AuditLog(...));
    }
    
    public void logUserAction(String userId, String action, String details) {
        Map<String, Object> auditDetails = new HashMap<>();
        auditDetails.put("details", details);
        logAction(userId, action, "USER", userId, auditDetails);
    }
    
    public void logPatientAction(String userId, String action, String patientId, String details) {
        Map<String, Object> auditDetails = new HashMap<>();
        auditDetails.put("details", details);
        logAction(userId, action, "PATIENT", patientId, auditDetails);
    }
    
    public void logWoundAnalysisAction(String userId, String action, String woundId, String details) {
        Map<String, Object> auditDetails = new HashMap<>();
        auditDetails.put("details", details);
        logAction(userId, action, "WOUND_ANALYSIS", woundId, auditDetails);
    }
}

