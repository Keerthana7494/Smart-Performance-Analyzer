package com.smartperformance.repository;

import com.smartperformance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmailIgnoreCase(String email);
    List<Student> findByActiveOrderByStudentNameAsc(Integer active);
     List<Student> findAllByOrderByStudentNameAsc();
     
Optional<Student> findByEmailIgnoreCaseAndActive(
    String email,
    Integer active
);


}
