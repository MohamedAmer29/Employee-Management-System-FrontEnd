const AuthImage = ({ className = '', alt = 'EMS Authentication', ...props }) => {
  return (
    <div
      className={`
        w-full h-full bg-gradient-to-br from-dark via-primary-dark to-primary
        flex items-center justify-center p-4 md:p-6 select-none
        ${className}
      `}
      role="img"
      aria-label={alt}
      {...props}
    >
      <div className="text-center text-white max-w-[240px] mx-auto scale-90 md:scale-95 transition-transform duration-300">
        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20">
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold mb-1 tracking-wider text-white">EMS</h2>
        <p className="text-xs md:text-sm font-semibold text-white/95">
          Employee Management System
        </p>
        <p className="mt-2 text-white/75 text-[11px] md:text-xs leading-relaxed">
          Streamline workforce management with our all-in-one platform.
        </p>
      </div>
    </div>
  );
};

export default AuthImage;