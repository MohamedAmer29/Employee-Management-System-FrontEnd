import { useSelector } from 'react-redux';
import { useLogout } from '@/features/auth/auth.hooks';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/store/slices/authSlice';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: { auth: { user: User | null; isAuthenticated: boolean } }) =>
      state.auth,
  );
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  const displayName =
    user?.firstName || user?.username || user?.email || 'User';

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-light rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-dark mb-2">
          Welcome, {displayName}
        </h1>
        <p className="text-gray-600 mb-8">
          You have successfully logged into the Employee Management System.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-medium text-gray-700 mb-2">User Information</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">
                {user?.username || 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium text-gray-900">
                {user?.role || 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">
                {user?.firstName || ''} {user?.lastName || ''}
              </dd>
            </div>
          </dl>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;