import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-[0.04] blur-3xl" style={{ background: 'hsl(1, 76%, 52%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-[0.04] blur-3xl" style={{ background: 'hsl(233, 53%, 35%)' }} />
      
      <div className="text-center animate-fade-in relative z-10">
        <p className="text-sm font-medium text-primary/70 mb-3 tracking-wider uppercase">Error 404</p>
        <h1 className="text-7xl font-display font-bold text-foreground mb-2" style={{
          background: 'linear-gradient(135deg, hsl(233, 53%, 35%) 0%, hsl(1, 76%, 52%) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          404
        </h1>
        <p className="text-xl text-foreground font-medium mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
