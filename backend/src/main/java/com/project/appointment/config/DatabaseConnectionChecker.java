package com.project.appointment.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationFailedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Listens for application startup failure and provides a clear, actionable
 * error message when MySQL connection fails (wrong password / service not running).
 */
@Component
public class DatabaseConnectionChecker implements ApplicationListener<ApplicationFailedEvent> {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionChecker.class);

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/smart_appointment_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUser;

    @Override
    public void onApplicationEvent(ApplicationFailedEvent event) {
        Throwable ex = event.getException();
        String msg = ex != null ? ex.getMessage() : "";
        String cause = findRootMessage(ex);

        if (cause != null && (cause.contains("Access denied") || cause.contains("Communications link failure")
                || cause.contains("Connection refused") || cause.contains("Unable to open JDBC"))) {

            log.error("\n\n" +
                "╔══════════════════════════════════════════════════════════════╗\n" +
                "║           DATABASE CONNECTION FAILED                         ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║  Error: " + cause.substring(0, Math.min(cause.length(), 55)) + "\n" +
                "║                                                              ║\n" +
                "║  TO FIX:                                                     ║\n" +
                "║  1. Open: backend/src/main/resources/application.properties  ║\n" +
                "║  2. Find: spring.datasource.password=                        ║\n" +
                "║  3. Set your MySQL root password after the =                 ║\n" +
                "║     Example: spring.datasource.password=root                 ║\n" +
                "║     Example: spring.datasource.password=1234                 ║\n" +
                "║     Example: spring.datasource.password=          (no pass)  ║\n" +
                "║  4. Make sure MySQL service is RUNNING                       ║\n" +
                "║     Windows: services.msc → MySQL80 → Start                 ║\n" +
                "║  5. Run again: mvn spring-boot:run                           ║\n" +
                "╚══════════════════════════════════════════════════════════════╝\n"
            );
        }
    }

    private String findRootMessage(Throwable t) {
        if (t == null) return null;
        String msg = t.getMessage();
        if (t.getCause() != null) {
            String causeMsg = findRootMessage(t.getCause());
            if (causeMsg != null) return causeMsg;
        }
        return msg;
    }
}
