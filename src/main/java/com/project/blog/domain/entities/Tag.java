package com.project.blog.domain.entities;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(
        name = "tags",
        uniqueConstraints = @UniqueConstraint(name = "uk_tags_owner_name", columnNames = {"owner_id", "name"})
)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    /**
     * Read-only count from {@code post_tags}; avoids relying on the inverse {@link #posts}
     * collection, which is not reliably populated when listing tags.
     */
    @Formula("(select count(*) from post_tags pt where pt.tag_id = id)")
    @Setter(AccessLevel.NONE)
    @Builder.Default
    private long postCount = 0;

    @ManyToMany(mappedBy = "tags")
    private Set<Post> posts = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Tag tag = (Tag) o;
        return Objects.equals(id, tag.id) && Objects.equals(name, tag.name)
                && Objects.equals(owner, tag.owner);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, owner);
    }
}
