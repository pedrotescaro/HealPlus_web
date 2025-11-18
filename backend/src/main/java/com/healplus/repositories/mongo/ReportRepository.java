package com.healplus.repositories.mongo;

import com.healplus.documents.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReportRepository extends MongoRepository<Report, String> {
}