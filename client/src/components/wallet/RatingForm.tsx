import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { useToast } from "@/hooks/use-toast";
import { submitWalletRating } from "@/lib/bitcoin-api";

interface RatingFormProps {
  address: string;
}

export default function RatingForm({ address }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitRatingMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) => 
      submitWalletRating(address, data.rating, data.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/wallet/${address}`],
      });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this wallet!",
        duration: 3000,
      });
      setRating(0);
      setComment("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    submitRatingMutation.mutate({ rating, comment });
  };

  return (
    <Card className="bg-white dark:bg-[#21222D] custom-shadow mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">Rate This Wallet</h2>
        
        <div className="mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Your Rating
              </label>
              <Stars 
                rating={rating}
                size="lg"
                onChange={setRating}
                className="text-2xl"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="rating-comment" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Comment (optional)
              </label>
              <Textarea 
                id="rating-comment" 
                rows={3} 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition duration-200 text-sm"
                placeholder="Share your experience with this wallet..."
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2.5 font-medium transition duration-200"
              disabled={submitRatingMutation.isPending}
            >
              {submitRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
