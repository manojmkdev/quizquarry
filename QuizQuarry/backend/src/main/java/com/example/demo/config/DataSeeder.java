package com.example.demo.config;

import com.example.demo.entity.SystemUser;
import com.example.demo.repository.SystemUserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final SystemUserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(SystemUserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        Logger logger = LoggerFactory.getLogger(DataSeeder.class);
        if (repo.count() == 0) {
            SystemUser instructor = new SystemUser();
            instructor.setFullName("Professor");
            instructor.setEmail("instructor@example.com");
            instructor.setPasswordHash(passwordEncoder.encode("12345"));
            instructor.setRole(SystemUser.Role.INSTRUCTOR);
            repo.save(instructor);
            SystemUser student = new SystemUser();
            student.setFullName("John Doe");
            student.setEmail("student@example.com");
            student.setPasswordHash(passwordEncoder.encode("12345"));
            student.setRole(SystemUser.Role.STUDENT);
            repo.save(student);
            SystemUser student2 = new SystemUser();
            student2.setFullName("Peter Parker");
            student2.setEmail("student2@example.com");
            student2.setPasswordHash(passwordEncoder.encode("12345"));
            student2.setRole(SystemUser.Role.STUDENT);
            repo.save(student2);
            SystemUser student3 = new SystemUser();
            student3.setFullName("Mary Jane");
            student3.setEmail("student3@example.com");
            student3.setPasswordHash(passwordEncoder.encode("12345"));
            student3.setRole(SystemUser.Role.STUDENT);
            repo.save(student3);
            SystemUser student4 = new SystemUser();
            student4.setFullName("Clark Kent");
            student4.setEmail("student4@example.com");
            student4.setPasswordHash(passwordEncoder.encode("12345"));
            student4.setRole(SystemUser.Role.STUDENT);
            repo.save(student4);
            logger.info("Data Seeder: Created default users.");
        }
    }
}
