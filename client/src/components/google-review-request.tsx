import { Star, ExternalLink, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleReviewRequest() {
  const handleReviewClick = () => {
    // This would be your actual Google Business Profile review URL
    const reviewUrl = "https://search.google.com/local/writereview?placeid=ChIJAAAAAAAAAAARN46yHZs0fVk";
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
            Help Us Reach 200 Reviews! 🎯
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Join <strong>156+ happy customers</strong> who left a review. Your feedback helps us appear in Google Maps 
            and helps other homeowners find quality pest control services.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleReviewClick}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Star className="h-5 w-5 mr-2" />
            Leave a Google Review
          </Button>
          <Button 
            onClick={handleReviewClick}
            variant="outline"
            className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Reviews
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          ⭐ Reviews on Google help other homeowners discover our services and improve local search visibility
        </p>
        
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
            <p className="text-xs text-gray-500 dark:text-gray-400">7 Day Emergency Support</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">5.0 ⭐</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Google Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
