import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter, CardHeader, Chip } from '@nextui-org/react';
import { Post } from '../services/apiService';
import { Calendar, Clock, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';

interface PostListProps {
  posts: Post[] | null;
  loading: boolean;
  error: string | null;
  page: number;
  sortBy: string;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string) => void;
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = (props) => {
  const { posts, loading, error, emptyMessage = 'No posts to show.' } = props;
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEntryOrCreated = (post: Post) => {
    if (post.entryDate) {
      return new Date(`${post.entryDate}T12:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return formatDate(post.createdAt);
  };

  const createExcerpt = (content: string) => {
    // First sanitize the HTML
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'br'],
      ALLOWED_ATTR: []
    });
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    
    // Get the text content and limit it
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    textContent = textContent.trim();
    
    // Limit to roughly 200 characters, ending at the last complete word
    if (textContent.length > 200) {
      textContent = textContent.substring(0, 200).split(' ').slice(0, -1).join(' ') + '...';
    }
    
    return textContent;
  };

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-danger-200/30 bg-danger-50/10 text-danger text-sm">
        {error}
      </div>
    );
  }

  const navToPostPage = (post: Post) => {
    navigate(`/posts/${post.id}`)
  }

  return (
    <div className="w-full space-y-6">
      {/* <div className="flex justify-end mb-4">
        <Select
          label="Sort by"
          selectedKeys={[sortBy]}
          className="max-w-xs"
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div> */}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="w-full animate-pulse bg-content1 border border-divider shadow-none"
            >
              <CardBody>
                <div className="h-4 bg-content3 rounded-lg w-3/4 mb-4" />
                <div className="h-4 bg-content3 rounded-lg w-1/2" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {posts?.length === 0 ? (
              <p className="text-sm text-default-500 py-12 text-center border border-dashed border-divider rounded-2xl">
                {emptyMessage}
              </p>
            ) : null}
            {posts?.map((post) => (
              <Card
                key={post.id}
                className="w-full bg-content1 border border-divider shadow-none transition-colors hover:border-default-400/50"
                isPressable
                onPress={() => navToPostPage(post)}
              >
                <CardHeader className="flex gap-3 pb-1">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-left text-foreground tracking-tight">
                      {post.title}
                    </h2>
                    <p className="text-xs text-default-500">by {post.author?.name}</p>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-sm text-default-400 line-clamp-3 leading-relaxed">
                    {createExcerpt(post.content)}
                  </p>
                </CardBody>
                <CardFooter className="flex flex-wrap gap-3 pt-0">
                  <div className="flex items-center gap-1 text-xs text-default-500">
                    <Calendar size={14} />
                    {formatEntryOrCreated(post)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-default-500">
                    <Clock size={14} />
                    {post.readingTime} min read
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip size="sm" variant="flat" className="bg-primary/10 text-primary border border-primary/20">
                      {post.category.name}
                    </Chip>
                    {post.tags.map((t) => (
                      <Chip
                        key={t.id}
                        size="sm"
                        variant="bordered"
                        className="border-divider text-default-400"
                        startContent={<Tag size={12} />}
                      >
                        {t.name}
                      </Chip>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* {posts && posts.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={posts.totalPages}
                page={page}
                onChange={onPageChange}
                showControls
              />
            </div>
          )} */}
        </>
      )}
    </div>
  );
};

export default PostList;