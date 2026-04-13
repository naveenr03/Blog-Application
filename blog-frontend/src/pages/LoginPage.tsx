import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Input, Button } from '@nextui-org/react';
import { apiService, ApiError } from '../services/apiService';
import { useAuth } from '../components/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? apiService.formatApiError(err as ApiError)
          : 'Failed to login. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-divider bg-content1 shadow-none">
        <CardHeader className="flex flex-col gap-1 items-start px-6 pt-8 pb-0">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Welcome back</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </CardHeader>
        <CardBody className="gap-5 px-6 pb-8 pt-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              isRequired
              value={email}
              onValueChange={setEmail}
              isDisabled={isLoading}
              variant="bordered"
              classNames={{
                inputWrapper: 'bg-content2 border-divider',
              }}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              isRequired
              value={password}
              onValueChange={setPassword}
              isDisabled={isLoading}
              variant="bordered"
              classNames={{
                inputWrapper: 'bg-content2 border-divider',
              }}
            />

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              color="primary"
              radius="lg"
              className="font-medium"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-default-500">
            No account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginPage;
