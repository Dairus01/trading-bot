import { Button } from "@/components/ui/button"; // Import shadcn Button
import { useNavigate } from "react-router-dom"; // For navigation

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        {/* 404 Text */}
        <h1 className="text-9xl text-gray-900 font-bold font-oswald">404</h1>

        {/* Title */}
        <h2 className="text-3xl text-gray-700 font-semibold font-oswald">Page Not Found</h2>

        {/* Description */}
        <p className="text-gray-500 font-oswald">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Button onClick={() => navigate(-1)}>Go Back Home</Button>
      </div>
    </div>
  );
};

export default NotFoundPage;