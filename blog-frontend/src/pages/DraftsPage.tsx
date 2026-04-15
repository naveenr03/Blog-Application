import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader,
  CardBody,
  Button,
} from '@nextui-org/react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService, Post } from '../services/apiService';
import PostList from '../components/PostList';

const DraftsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt,desc");

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDrafts({
          page: page - 1,
          size: 10,
          sort: sortBy,
        });
        setDrafts(response);
        setError(null);
      } catch {
        setError('Failed to load drafts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [page, sortBy]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border border-divider bg-content1 shadow-none">
        <CardHeader className="flex justify-between items-center border-b border-divider">
          <h1 className="text-xl font-semibold tracking-tight">Drafts</h1>
          <Button
            as={Link}
            to="/posts/new"
            color="primary"
            radius="lg"
            startContent={<Plus size={16} />}
          >
            New post
          </Button>
        </CardHeader>

        <CardBody className="pt-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-danger rounded-xl border border-danger-200/30 bg-danger-50/10">
              {error}
            </div>
          )}

          <PostList
            posts={drafts}
            loading={loading}
            error={error}
            page={page}
            sortBy={sortBy}
            onPageChange={setPage}
            onSortChange={setSortBy}
          />

          {drafts?.length === 0 && !loading && (
            <div className="text-center py-8 text-default-500">
              <p>You don't have any draft posts yet.</p>
              <Button
                as={Link}
                to="/posts/new"
                color="primary"
                variant="flat"
                className="mt-4"
              >
                Create Your First Post
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DraftsPage;