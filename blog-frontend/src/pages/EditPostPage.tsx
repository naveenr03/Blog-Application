import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
} from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import { apiService, Post, Category, Tag, PostStatus } from '../services/apiService';
import PostForm from '../components/PostForm';
import { useAuth } from '../components/AuthContext';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getTags()
        ]);

        setCategories(categoriesResponse);
        setTags(tagsResponse);

        if (id) {
          const postResponse = await apiService.getPost(id);
          setPost(postResponse);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
  }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (id) {
        await apiService.updatePost(id, {
          ...postData,
          id
        });
      } else {
        await apiService.createPost(postData);
      }

      navigate('/');
    } catch (err) {
      setError('Failed to save the post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/posts/${id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
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

  const editingOthersPost =
    Boolean(
      id &&
        post &&
        user?.id &&
        post.author?.id &&
        user.id !== post.author.id
    );

  if (editingOthersPost) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="w-full border border-divider bg-content1 shadow-none">
          <CardBody>
            <p className="text-danger text-sm">You can only edit your own posts.</p>
            <Button
              className="mt-4"
              variant="flat"
              radius="lg"
              startContent={<ArrowLeft size={16} />}
              onClick={() => navigate(`/posts/${id}`)}
            >
              Back to post
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full border border-divider bg-content1 shadow-none">
        <CardHeader className="flex justify-between items-center border-b border-divider">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              radius="lg"
              className="text-default-500"
              startContent={<ArrowLeft size={16} />}
              onClick={handleCancel}
            >
              Back
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">
              {id ? 'Edit post' : 'New post'}
            </h1>
          </div>
        </CardHeader>

        <CardBody className="pt-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-danger rounded-xl border border-danger-200/30 bg-danger-50/10">
              {error}
            </div>
          )}

          <PostForm
            initialPost={post}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            categories={categories}
            availableTags={tags}
            isSubmitting={isSubmitting}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default EditPostPage;