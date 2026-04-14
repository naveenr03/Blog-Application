import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from '@nextui-org/react';
import { Plus, LogOut, BookDashed, Search } from 'lucide-react';

interface NavBarProps {
  isAuthenticated: boolean;
  userProfile?: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  isAuthenticated,
  userProfile,
  onLogout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (location.pathname === '/') {
      setSearchText(searchParams.get('q') ?? '');
    }
  }, [location.pathname, searchParams]);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Tags', path: '/tags' },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = searchText.trim();
    navigate(t ? `/?q=${encodeURIComponent(t)}` : '/');
    setIsMenuOpen(false);
  };

  return (
    <Navbar
      isBordered
      maxWidth="xl"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="border-b border-divider bg-content1/80 backdrop-blur-md backdrop-saturate-150"
      classNames={{
        base: 'mb-0',
        wrapper: 'gap-2',
      }}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="text-foreground"
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-2" justify="center">
        <NavbarBrand>
          <Link
            to="/"
            className="font-semibold tracking-tight text-foreground"
            onClick={() => setIsMenuOpen(false)}
          >
            Personal Blog
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="start">
        <NavbarBrand>
          <Link to="/" className="font-semibold tracking-tight text-foreground">
            Personal Blog
          </Link>
        </NavbarBrand>
        {menuItems.map((item) => (
          <NavbarItem key={item.path} isActive={location.pathname === item.path}>
            <Link
              to={item.path}
              className={`text-sm transition-colors ${
                location.pathname === item.path
                  ? 'text-primary'
                  : 'text-default-500 hover:text-foreground'
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent className="hidden md:flex flex-1 justify-center px-4" justify="center">
        <form onSubmit={submitSearch} className="w-full max-w-md">
          <Input
            aria-label="Search posts"
            placeholder="Search title, body, tags, categories…"
            value={searchText}
            onValueChange={setSearchText}
            size="sm"
            radius="lg"
            startContent={<Search className="text-default-400 shrink-0" size={16} />}
            classNames={{
              input: 'text-sm',
              inputWrapper:
                'bg-content2/80 border border-divider shadow-none hover:bg-content2 data-[hover=true]:bg-content2',
            }}
          />
        </form>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button
                as={Link}
                to="/posts/drafts"
                variant="light"
                size="sm"
                className="text-default-500"
                startContent={<BookDashed size={16} />}
              >
                Drafts
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden sm:flex">
              <Button
                as={Link}
                to="/posts/new"
                color="primary"
                variant="flat"
                size="sm"
                radius="lg"
                startContent={<Plus size={16} />}
              >
                New
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    size="sm"
                    color="primary"
                    className="transition-transform"
                    src={userProfile?.avatar}
                    name={userProfile?.name}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem
                    key="logout"
                    startContent={<LogOut size={16} />}
                    className="text-danger"
                    color="danger"
                    onPress={onLogout}
                  >
                    Log out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button as={Link} to="/signup" variant="light" size="sm" className="text-default-500">
                Sign up
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} to="/login" color="primary" variant="flat" size="sm" radius="lg">
                Log in
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-content1 pt-4 gap-4">
        <form onSubmit={submitSearch} className="px-2">
          <Input
            aria-label="Search posts"
            placeholder="Search…"
            value={searchText}
            onValueChange={setSearchText}
            size="md"
            radius="lg"
            startContent={<Search className="text-default-400" size={18} />}
            classNames={{
              inputWrapper: 'bg-content2 border border-divider shadow-none',
            }}
          />
        </form>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <Link
              to={item.path}
              className={`w-full block py-2 ${
                location.pathname === item.path ? 'text-primary' : 'text-default-500'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default NavBar;
