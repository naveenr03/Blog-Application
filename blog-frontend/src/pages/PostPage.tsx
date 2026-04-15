import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Button,
  Divider,
  Avatar,
} from '@nextui-org/react';
import { 
  Calendar,
  Clock,
  Tag,
  Edit,
  Trash,
  ArrowLeft,
  Share
} from 'lucide-react';
import { apiService, Post } from '../services/apiService';
import { useAuth } from '../components/AuthContext';

const PostPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Post ID is required');
        const fetchedPost = await apiService.getPost(id);
        setPost(fetchedPost);
        setError(null);
        setDeleteError(null);
      } catch {
        setError('Failed to load the post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await apiService.deletePost(post.id);
      navigate('/');
    } catch {
      setDeleteError('Failed to delete the post. You may only delete your own posts.');
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title,
        text: post?.content.substring(0, 100) + '...',
        url: window.location.href,
      });
    } catch {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const createSanitizedHTML = (content: string) => {
    return {
      __html: DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'br'],
        ALLOWED_ATTR: []
      })
    };
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="w-full animate-pulse bg-content1 border border-divider shadow-none">
          <CardBody>
            <div className="h-8 bg-content3 rounded-lg w-3/4 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-content3 rounded-lg w-full" />
              <div className="h-4 bg-content3 rounded-lg w-full" />
              <div className="h-4 bg-content3 rounded-lg w-2/3" />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border border-divider bg-content1 shadow-none">
          <CardBody>
            <p className="text-danger text-sm">{error || 'Post not found'}</p>
            <Button
              as={Link}
              to="/"
              color="primary"
              variant="flat"
              radius="lg"
              startContent={<ArrowLeft size={16} />}
              className="mt-4"
            >
              Back to journal
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {deleteError && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {deleteError}
        </p>
      )}
      <Card className="w-full border border-divider bg-content1 shadow-none">
        <CardHeader className="flex flex-col items-start gap-4">
          <div className="flex justify-between w-full">
            <Button
              as={Link}
              to="/"
              variant="light"
              size="sm"
              radius="lg"
              className="text-default-500"
              startContent={<ArrowLeft size={16} />}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {isAuthenticated && (
                <>
                  <Button
                    as={Link}
                    to={`/posts/${post.id}/edit`}
                    color="primary"
                    variant="flat"
                    radius="lg"
                    startContent={<Edit size={16} />}
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    radius="lg"
                    startContent={<Trash size={16} />}
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    size="sm"
                  >
                    Delete
                  </Button>
                </>
              )}
              <Button
                variant="light"
                radius="lg"
                className="text-default-500"
                startContent={<Share size={16} />}
                onClick={handleShare}
                size="sm"
              >
                Share
              </Button>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar name={post.author?.name} size="sm" color="primary" />
              <span className="text-sm text-default-400">{post.author?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <Calendar size={16} />
              <span>
                {post.entryDate
                  ? new Date(`${post.entryDate}T12:00:00`).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : formatDate(post.createdAt)}
              </span>
              {post.entryDate ? (
                <span className="text-default-400">(journal day)</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <Clock size={16} />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </CardHeader>

        <Divider className="bg-divider" />

        <CardBody className="pt-6">
          <div
            className="post-body max-w-none font-serif text-[15px] leading-relaxed text-white [&_p]:mb-4 [&_p]:text-white [&_strong]:text-white [&_em]:text-white"
            dangerouslySetInnerHTML={createSanitizedHTML(post.content)}
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start gap-4">
          <Divider className="bg-divider" />
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" variant="flat" className="bg-primary/10 text-primary border border-primary/20">
              {post.category.name}
            </Chip>
            {post.tags.map((tag) => (
              <Chip
                key={tag.id}
                size="sm"
                variant="bordered"
                className="border-divider text-default-400"
                startContent={<Tag size={14} />}
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostPage;