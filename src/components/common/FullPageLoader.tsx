const FullPageLoader = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-light dark:bg-dark-bg"
      role="status"
      aria-label="Loading"
    >
      <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
};

export default FullPageLoader;
