const Spinner = ({ size = 'md' }) => {
  const sz = size === 'sm' ? 'h-4 w-4' : 'h-8 w-8';
  return <div className={`animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 ${sz}`} />;
};
export default Spinner;
