import { Divide } from "lucide-react";
import Image from "next/image";
import React from "react";
import SocialHandles from "./socialHandles";
//@ts-ignore

export const sentimentRating = (rating) => {
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



const NewsCard = ({ positive = true, title, text, category, channel, coins, curated, handle, score, source, icons, datetime, onReadMore }) => {
    const positiveURL = "./positiveReviews.png";
    const negativeURL = "./negativeReviews.png";
    function headingText() {
        const maxWords = "md:max-w-lg lg:max-w-xl"; // Maximum number of words for larger screens

        if (title === "") {
            return (
                <p className={`truncate max-w-xs ${maxWords} line-clamp-2`}>
                    {text}
                </p>
            );
        } else {
            return (
                <h5 className={`truncate ${maxWords} line-clamp-2 font-semibold tracking-tight text-gray-900 dark:text-white`}>
                    {title}
                </h5>
            );
        }
    }



    return (
        <div
            className="max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
            style={{
                backgroundImage: `url(${positive ? positiveURL : negativeURL})`,
                backgroundSize: 'cover', // or 'contain' depending on your preference
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

            }}
        >    <h5 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {headingText()}
            </h5>

            <div className="flex flex-col h-44">
                <p className="line-clamp-4 mb-3 flex-grow font-normal text-gray-500 dark:text-gray-400">
                    {text}
                </p>
            </div>

            <div className="flex items-center">
                <div className="inline-flex items-center">
                    {coins?.map?.((coin) => (
                        <div className="relative p-1">
                            <div className="flex items-center" title={coin}>
                                <img
                                    className="w-4 h-4"
                                    src={icons?.[coin.toUpperCase()]}
                                    alt={coin.toLowerCase()}
                                />
                                <span className="text-xs">{coin}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <span className="ml-auto font-bold text-black dark:text-gray-400">{category}</span>
            </div>
            <div className="flex-grow border-t border-gray-300 mt-[1rem] mb-[0.8rem]"></div>
            <div className="flex items-center">
                <div className="inline-flex items-center">
                    {curated && <p className="text-sm">{source} </p>}
                    <SocialHandles icon={channel} handle={handle} />
                    <p className={`font-bold ${positive ? 'text-green-500' : 'text-red-500'} text-center ml-2`}>
                        {positive && '+'}
                        {`${(score?.toFixed(2) * 100).toFixed(0)}%`} ({sentimentRating(score?.toFixed(2))})
                    </p>
                </div>
                <span className="ml-auto font-bold text-black dark:text-gray-400">
                    {datetime ? new Date(datetime).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
            </div>
        </div>

    );
};

export default NewsCard;
