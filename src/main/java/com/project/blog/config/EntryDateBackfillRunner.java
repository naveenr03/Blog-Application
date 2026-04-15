package com.project.blog.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures legacy rows have {@code entry_date} populated when the column allows NULL
 * or was added without a backfill. Safe to run repeatedly.
 */
@Component
@Order(100)
@Slf4j
public class EntryDateBackfillRunner implements ApplicationRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            int updated = entityManager.createNativeQuery(
                    "UPDATE posts SET entry_date = CAST(created_at AS date) WHERE entry_date IS NULL"
            ).executeUpdate();
            if (updated > 0) {
                log.info("Backfilled entry_date on {} post row(s)", updated);
            }
        } catch (Exception e) {
            log.warn("entry_date backfill skipped or failed: {}", e.getMessage());
        }
    }
}
