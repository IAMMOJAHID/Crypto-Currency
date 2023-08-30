export const sentimentRating = (rating: any) => {
    // console.log("rating", rating);
  
    if (rating > 0.66 && rating <= 1.0) {
      return "Outperform";
    } else if (rating > 0.25 && rating <= 0.65) {
      return "Optimistic";
    } else if (rating > -0.25 && rating <= 0.25) {
      return "Neutral";
    } else if (rating > -0.65 && rating <= -0.25) {
      return "Pessimistic";
    } else if (rating <= -0.65) {
      return "Underperform";
    } else {
      return "Calculating";
    }
  };
  