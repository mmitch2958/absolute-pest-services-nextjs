import { Star, ExternalLink, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleReviewRequest() {
  const handleReviewClick = () => {
    // This would be your actual Google Business Profile review URL
    const reviewUrl = "https://www.google.com/maps/place/Absolute+Pest+Services/@39.8221,-75.8274,17z/data=!4m8!3m7!1s0x0:0x0!8m2!3d39.8221!4d-75.8274!9m1!1b1!16s%2Fg%2F11abc123def?hl=en";
    window.open(reviewUrl, '_blank');
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
          <Star className="h-5 w-5" />
          Love Our Service?
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="h-8 w-8 text-yellow-400 fill-yellow-400 animate-pulse" 
                style={{ animationDelay: `${star * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Your Experience
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Help other customers discover our professional pest control services by leaving a review on Google
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleReviewClick}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Star className="h-4 w-4 mr-2" />
            Leave a Review
          </Button>
          <Button 
            onClick={handleReviewClick}
            variant="outline"
            className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Reviews
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-yellow-200 dark:border-yellow-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">Quality</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Professional Service</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Support</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">24/7 Emergency</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Results</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Guaranteed</p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          "Your feedback helps us improve and helps others find quality pest control services"
        </p>
      </CardContent>
    </Card>
  );
}