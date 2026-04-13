import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { apiService, Post, Category, Tag } from '../services/apiService';
import PostList from '../components/PostList';
import { X, ChevronDown } from 'lucide-react';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getPosts({
            categoryId: selectedCategory,
            tagId: selectedTag,
            search: searchQuery || undefined,
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
  }, [page, sortBy, selectedCategory, selectedTag, searchQuery]);

  const clearSearch = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
  };

  const categoryLabel = useMemo(() => {
    if (!selectedCategory) return 'All categories';
    return categories.find((c) => c.id === selectedCategory)?.name ?? 'Category';
  }, [selectedCategory, categories]);

  const tagLabel = useMemo(() => {
    if (!selectedTag) return 'Any tag';
    return tags.find((t) => t.id === selectedTag)?.name ?? 'Tag';
  }, [selectedTag, tags]);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <header className="space-y-2 min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Reading list</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Stories & notes
          </h1>
          <p className="text-default-500 text-sm max-w-xl">
            Use the search bar for full-text search. Narrow results with the filters.
          </p>
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

        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0">
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
              selectedKeys={new Set([selectedCategory ?? 'all'])}
              onSelectionChange={(keys) => {
                if (keys === 'all') return;
                const key = [...keys][0] as string | undefined;
                if (key === 'all' || key === undefined) {
                  setSelectedCategory(undefined);
                } else {
                  setSelectedCategory(key);
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
              selectedKeys={new Set([selectedTag ?? 'any'])}
              onSelectionChange={(keys) => {
                if (keys === 'all') return;
                const key = [...keys][0] as string | undefined;
                if (key === 'any' || key === undefined) {
                  setSelectedTag(undefined);
                } else {
                  setSelectedTag(key);
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

      <PostList
        posts={posts}
        loading={loading}
        error={error}
        page={page}
        sortBy={sortBy}
        onPageChange={setPage}
        onSortChange={setSortBy}
        emptyMessage={
          searchQuery
            ? 'No posts match your search. Try different words or clear filters.'
            : 'No posts yet.'
        }
      />
    </div>
  );
};

export default HomePage;
