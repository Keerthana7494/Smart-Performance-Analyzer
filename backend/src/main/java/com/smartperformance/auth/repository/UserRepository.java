package com.smartperformance.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartperformance.auth.entity.Role;
import com.smartperformance.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
    
    Optional<User> findByEmail(String email);
       @Query("""
           SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
           FROM User u
           WHERE u.email = :email
           """)
    boolean existsByEmail(@Param("email")String email); 

    List<User> findByRole(Role role);
}
