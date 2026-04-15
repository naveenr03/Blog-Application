package com.project.blog.repositories;

import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class PostSpecifications {

    private PostSpecifications() {}

    public static Specification<Post> forAuthorWithOptionalFilters(
            User author, Category category, Tag tag, LocalDate entryDate) {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("author"), author));
            if (entryDate != null) {
                predicates.add(cb.equal(root.get("entryDate"), entryDate));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (tag != null) {
                predicates.add(cb.isMember(tag, root.get("tags")));
            }
            if (query != null) {
                query.orderBy(cb.desc(root.get("entryDate")), cb.desc(root.get("updatedAt")));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Post> searchForAuthor(
            User author, String searchTerm, Category category, Tag tag, LocalDate entryDate) {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            String pattern = "%" + searchTerm.toLowerCase() + "%";

            Join<Post, Tag> tagJoin = root.join("tags", JoinType.LEFT);

            Predicate textMatch = cb.or(
                    cb.like(cb.lower(root.get("Title")), pattern),
                    cb.like(cb.lower(root.get("content")), pattern),
                    cb.like(cb.lower(root.get("category").get("name")), pattern),
                    cb.like(cb.lower(tagJoin.get("name")), pattern));

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("author"), author));
            predicates.add(textMatch);
            if (entryDate != null) {
                predicates.add(cb.equal(root.get("entryDate"), entryDate));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (tag != null) {
                predicates.add(cb.isMember(tag, root.get("tags")));
            }
            if (query != null) {
                query.orderBy(cb.desc(root.get("entryDate")), cb.desc(root.get("updatedAt")));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
