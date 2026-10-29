/*package com.smartperformance.repository;

import com.smartperformance.entity.StudentPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PerformanceRepository extends JpaRepository<StudentPerformance, Long> {

    @Query("select p from StudentPerformance p join fetch p.student s where s.active = 1 order by p.createdAt desc")
    List<StudentPerformance> findActivePerformance();

    @Query("select avg(p.overallScore) from StudentPerformance p where p.overallScore is not null")
    Double findAverageScore();

    long countByPerformanceLevel(String level);
    long countByRiskStatus(String status);
}
*/
package com.smartperformance.repository;

import com.smartperformance.entity.StudentPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PerformanceRepository extends JpaRepository<StudentPerformance, Long> {

    
List<StudentPerformance>
findByStudent_StudentIdOrderByCreatedAtAsc(
    Long studentId
);


    @Query("""
        select p
        from StudentPerformance p
        join fetch p.student s
        where s.active = 1
        order by p.createdAt desc
    """)
    List<StudentPerformance> findActivePerformance();

    /** Latest performance row for one active student, used by the individual PDF report. */
    @Query("""
        select p
        from StudentPerformance p
        join fetch p.student s
        where s.studentId = :studentId
          and s.active = 1
          and p.performanceId = (
              select max(p2.performanceId)
              from StudentPerformance p2
              where p2.student.studentId = :studentId
          )
    """)
    Optional<StudentPerformance> findLatestByStudentId(@Param("studentId") Long studentId);

    /** Latest performance row for every active student, used by dashboard category/risk exports. */
    @Query("""
        select p
        from StudentPerformance p
        join fetch p.student s
        where s.active = 1
          and p.performanceId = (
              select max(p2.performanceId)
              from StudentPerformance p2
              where p2.student.studentId = s.studentId
          )
        order by s.studentName asc
    """)
    List<StudentPerformance> findLatestPerformanceForActiveStudents();

    @Query("""
    select avg(p.overallScore)
    from StudentPerformance p join p.student s
    where s.active = 1 and p.overallScore is not null
    and p.performanceId in (
        select max(p2.performanceId)
        from StudentPerformance p2
        group by p2.student.studentId
    )
""")
Double findAverageScore();

    @Query("""
        select count(p)
        from StudentPerformance p join p.student s
        where s.active = 1 and p.performanceLevel = :level
        and p.performanceId in (
            select max(p2.performanceId)
            from StudentPerformance p2
            group by p2.student.studentId
        )
    """)
    long countLatestByPerformanceLevel(@Param("level") String level);


    @Query("""
        select count(p)
        from StudentPerformance p join p.student s
        where s.active = 1 and p.riskStatus = :status
        and p.performanceId in (
            select max(p2.performanceId)
            from StudentPerformance p2
            group by p2.student.studentId
        )
    """)
    long countLatestByRiskStatus(@Param("status") String status);
}