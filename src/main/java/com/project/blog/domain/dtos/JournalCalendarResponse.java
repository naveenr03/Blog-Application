package com.project.blog.domain.dtos;

import java.util.List;

public record JournalCalendarResponse(List<JournalCalendarDayDto> days) {
}
