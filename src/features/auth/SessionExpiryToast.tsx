interface SessionExpiryToastProps {
  onExtend: () => void;
}

const SessionExpiryToast = ({ onExtend }: SessionExpiryToastProps) => {
  return (
    <div className="text-sm">
      <p className="font-semibold text-gray-900 dark:text-gray-100">
        Your session will close in less than 5 minutes.
      </p>
      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
        Do you want to extend your session?
      </p>
      <button
        type="button"
        onClick={onExtend}
        className="
          mt-2 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
          text-white bg-primary-dark hover:bg-dark transition-colors cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        "
      >
        Extend Session
      </button>
    </div>
  );
};

export default SessionExpiryToast;
