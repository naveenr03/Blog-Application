import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
} from '@nextui-org/react';
import { DayPicker } from 'react-day-picker';
import { format, startOfDay, startOfMonth, parseISO, isValid } from 'date-fns';
import 'react-day-picker/style.css';
import { apiService, Post, Category, Tag } from '../services/apiService';
import PostList from '../components/PostList';
import { X, ChevronDown, Plus, BookDashed } from 'lucide-react';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim();

  const categoryId = searchParams.get('categoryId') ?? undefined;
  const tagId = searchParams.get('tagId') ?? undefined;
  const dateParam = searchParams.get('date');

  const browseMode = !!(categoryId || tagId) && !dateParam;

  const selectedDay = useMemo(() => {
    if (dateParam) {
      const d = parseISO(dateParam);
      return isValid(d) ? startOfDay(d) : startOfDay(new Date());
    }
    return startOfDay(new Date());
  }, [dateParam]);

  const [month, setMonth] = useState(() => startOfMonth(selectedDay));

  useEffect(() => {
    if (dateParam) {
      const d = parseISO(dateParam);
      if (isValid(d)) {
        setMonth(startOfMonth(d));
      }
    }
  }, [dateParam]);

  const [calendarHintKeys, setCalendarHintKeys] = useState<Set<string>>(new Set());

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [sortBy] = useState('createdAt,desc');

  const selectedDayKey = format(selectedDay, 'yyyy-MM-dd');

  const setCategoryFilter = useCallback(
    (key: string | undefined) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!key || key === 'all') {
          next.delete('categoryId');
        } else {
          next.set('categoryId', key);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setTagFilter = useCallback(
    (key: string | undefined) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!key || key === 'any') {
          next.delete('tagId');
        } else {
          next.set('tagId', key);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const handleSelectDay = useCallback(
    (day: Date | undefined) => {
      if (!day) return;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('date', format(startOfDay(day), 'yyyy-MM-dd'));
        return next;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setCalendarLoading(true);
        const y = month.getFullYear();
        const m = month.getMonth() + 1;
        const res = await apiService.getJournalCalendar(y, m);
        const next = new Set<string>();
        for (const d of res.days) {
          next.add(d.date);
        }
        setCalendarHintKeys(next);
      } catch {
        setCalendarHintKeys(new Set());
      } finally {
        setCalendarLoading(false);
      }
    };
    loadCalendar();
  }, [month]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const entryDateForApi = browseMode ? undefined : selectedDayKey;
        const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getPosts({
            categoryId,
            tagId,
            search: searchQuery || undefined,
            entryDate: entryDateForApi,
          }),
          apiService.getCategories(),
          apiService.getTags(),
        ]);

        setPosts(postsResponse);
        setCategories(categoriesResponse);
        setTags(tagsResponse);
        setError(null);
      } catch {
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, sortBy, categoryId, tagId, searchQuery, selectedDayKey, browseMode]);

  const clearSearch = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
  };

  const categoryLabel = useMemo(() => {
    if (!categoryId) return 'All categories';
    return categories.find((c) => c.id === categoryId)?.name ?? 'Category';
  }, [categoryId, categories]);

  const tagLabel = useMemo(() => {
    if (!tagId) return 'Any tag';
    return tags.find((t) => t.id === tagId)?.name ?? 'Tag';
  }, [tagId, tags]);

  const categoryMenuItems = useMemo(
    () => [
      { key: 'all', label: 'All categories' },
      ...categories.map((c) => ({
        key: c.id,
        label: `${c.name}${c.postCount != null ? ` (${c.postCount})` : ''}`,
      })),
    ],
    [categories]
  );

  const tagMenuItems = useMemo(
    () => [
      { key: 'any', label: 'Any tag' },
      ...tags.map((t) => ({
        key: t.id,
        label: `${t.name}${t.postCount != null ? ` (${t.postCount})` : ''}`,
      })),
    ],
    [tags]
  );

  const newEntryHref = selectedDayKey
    ? `/posts/new?entryDate=${encodeURIComponent(selectedDayKey)}`
    : '/posts/new';

  const listCaption = browseMode ? (
    <span>
      Showing all entries
      {categoryId ? (
        <>
          {' '}
          in <span className="text-foreground font-medium">{categoryLabel}</span>
        </>
      ) : null}
      {tagId ? (
        <>
          {' '}
          {categoryId ? 'with' : 'with'} tag{' '}
          <span className="text-foreground font-medium">{tagLabel}</span>
        </>
      ) : null}
      . Pick a day on the calendar to focus on one date.
    </span>
  ) : (
    <span>
      Showing entries for{' '}
      <span className="text-foreground font-medium">
        {format(selectedDay, 'MMMM d, yyyy')}
      </span>
      {categoryId || tagId ? (
        <>
          {' '}
          {categoryId ? (
            <>
              · category <span className="text-foreground font-medium">{categoryLabel}</span>
            </>
          ) : null}
          {tagId ? (
            <>
              {categoryId ? ' · ' : ' · '}
              tag <span className="text-foreground font-medium">{tagLabel}</span>
            </>
          ) : null}
        </>
      ) : null}
    </span>
  );

  const emptyMessage = browseMode
    ? searchQuery
      ? 'No entries match your search with these filters. Try different words or clear search.'
      : 'No entries match these filters yet.'
    : searchQuery
      ? 'No entries match your search for this day. Try different words or clear filters.'
      : 'No entries on this day yet.';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <header className="space-y-2 min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Journal</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Your entries
          </h1>
          <p className="text-default-500 text-sm max-w-xl">
            Pick a day on the calendar to read and write. Days with something saved are highlighted.
            Filter by category or tag—open those pages and click a label to see every related entry.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              as={Link}
              to={newEntryHref}
              color="primary"
              variant="flat"
              size="sm"
              radius="lg"
              startContent={<Plus size={16} />}
            >
              New entry
            </Button>
            <Button
              as={Link}
              to="/posts/drafts"
              variant="bordered"
              size="sm"
              radius="lg"
              className="border-divider bg-content1 text-foreground"
              startContent={<BookDashed size={16} />}
            >
              Drafts
            </Button>
          </div>
          {searchQuery ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Chip
                variant="flat"
                className="bg-content2 border border-divider max-w-full"
                size="sm"
              >
                <span className="truncate max-w-[min(100%,18rem)] inline-block align-bottom">
                  “{searchQuery}”
                </span>
              </Chip>
              <Button
                size="sm"
                variant="light"
                radius="full"
                startContent={<X size={14} />}
                onPress={clearSearch}
              >
                Clear search
              </Button>
            </div>
          ) : null}
        </header>

        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 shrink-0">
          <Dropdown placement="bottom-end" classNames={{ content: 'min-w-[10rem]' }}>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="bordered"
                radius="md"
                className="h-8 min-w-[9rem] max-w-[11rem] justify-between border-divider bg-content1 text-xs font-medium text-foreground px-2.5"
                endContent={<ChevronDown size={14} className="text-default-400 shrink-0" />}
              >
                <span className="truncate text-left">{categoryLabel}</span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Category filter"
              items={categoryMenuItems}
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([categoryId ?? 'all'])}
              onSelectionChange={(keys) => {
                if (keys === 'all') return;
                const key = [...keys][0] as string | undefined;
                if (key === 'all' || key === undefined) {
                  setCategoryFilter(undefined);
                } else {
                  setCategoryFilter(key);
                }
              }}
              classNames={{ base: 'max-h-64 overflow-y-auto' }}
            >
              {(item) => (
                <DropdownItem key={item.key} className="text-small" textValue={item.label}>
                  {item.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          <Dropdown placement="bottom-end" classNames={{ content: 'min-w-[9rem]' }}>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="bordered"
                radius="md"
                className="h-8 min-w-[7.5rem] max-w-[10rem] justify-between border-divider bg-content1 text-xs font-medium text-foreground px-2.5"
                endContent={<ChevronDown size={14} className="text-default-400 shrink-0" />}
              >
                <span className="truncate text-left">{tagLabel}</span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Tag filter"
              items={tagMenuItems}
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([tagId ?? 'any'])}
              onSelectionChange={(keys) => {
                if (keys === 'all') return;
                const key = [...keys][0] as string | undefined;
                if (key === 'any' || key === undefined) {
                  setTagFilter(undefined);
                } else {
                  setTagFilter(key);
                }
              }}
              classNames={{ base: 'max-h-64 overflow-y-auto' }}
            >
              {(item) => (
                <DropdownItem key={item.key} className="text-small" textValue={item.label}>
                  {item.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] items-start">
        <Card className="border border-divider bg-content1 shadow-none">
          <CardBody className="gap-3">
            <p className="text-sm font-medium text-foreground">
              {calendarLoading ? 'Updating calendar…' : format(month, 'MMMM yyyy')}
            </p>
            <div className="flex justify-center [&_.rdp-root]:!p-0 [&_.rdp-month]:!m-0">
              <DayPicker
                mode="single"
                required
                month={month}
                onMonthChange={setMonth}
                selected={selectedDay}
                onSelect={handleSelectDay}
                modifiers={{
                  hasEntry: (date) => calendarHintKeys.has(format(date, 'yyyy-MM-dd')),
                }}
                modifiersClassNames={{
                  hasEntry:
                    'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary font-medium text-primary',
                }}
                classNames={{
                  root: 'rdp-root',
                  month_caption: 'flex justify-center pb-2 text-sm font-medium',
                  nav: 'flex items-center justify-between gap-2',
                  day: 'rounded-lg',
                  selected: 'bg-primary text-primary-foreground',
                  today: 'font-semibold',
                }}
              />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 min-w-0">
          <p className="text-sm text-default-500 leading-relaxed">{listCaption}</p>

          <PostList
            posts={posts}
            loading={loading}
            error={error}
            page={page}
            sortBy={sortBy}
            onPageChange={() => {}}
            onSortChange={() => {}}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
