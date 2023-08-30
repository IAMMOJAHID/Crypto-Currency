"use client"

import * as React from "react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react";
import { sentimentRating } from "@/components/sentimentRating";
import TypographyPercentageBar from "@/components/TypographyPercentageBar";
import Image from 'next/image'
import {SocialIcon} from "react-social-icons";
import NewsCard from "@/components/cards";
import { useRef } from "react";


const baseURl = "https://sentiment.aurodigital.ai/api/v1/";
// const baseURl = "http://44.240.12.174:8001/api/v1/";
// data/newsletter_positive_sentiment_data
export const getInsights = async () => {
  const response = await fetch(`${baseURl}data/sentiment_insights`).then((response) => response.json());
  return response;
};
export const getIcon = async (symbol: any) => {
  const response = await fetch(`https://sentiment.aurodigital.ai/api/v1/data/crypto_info?symbol=${symbol}`).then((response) => response.json());
  return response;
};

export const history_curated = async (params) => {
  const response = await fetch(`${baseURl}data/historical_newsletter_data`, {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());

  // console.log("in eee", response);
  return response;
};

export const history_ai = async (params) => {
  const response = await fetch(`${baseURl}data/historical_sentiment_data`, {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());

  return response;
};




export default function IndexPage() {
  const [sentiments, setSentiments] = useState({});
  const [coinIcons, setCoinIcons] = useState({});
  const [toggleTable, setToggleTable] = useState(false);
  const [type, setType] = useState("top");
  const [positiveCards, setPositiveCards] = useState([]);
  const [negativeCards, setNegativeCards] = useState([]);
  const [iconURL, setIconURL] = useState({});
  const [loading, setLoading] = useState(true);


  const currentDate = new Date();
  const sd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30).toISOString().substring(0, 10);
  const ed = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1).toISOString().substring(0, 10);

  let coinSymbol = [];
  const testRef = useRef({
    start: sd,
    end: ed,
  });
  // Inside your component
  const pushCoins = (dataArray) => {
    dataArray.forEach((data) => {
      if (data.coins.length)
        data?.coins?.forEach((coin) => {
          coinSymbol.push(coin);
        });
    });
  };

  useEffect(() => {
    const fetchSentimentInsights = async () => {
      try {
        const data = await getInsights();
        let negativeCoin = data?.["most negative coin channel wise"].split(" ")?.[0];
        let positiveCoin = data?.["most positive coin channel wise"].split(" ")?.[0];
        const coins = await getIcon(negativeCoin + "," + positiveCoin);

        let positiveCoinKey = coins?.data?.data?.[positiveCoin]?.[0].logo;
        let negativeCoinKey = coins?.data?.data?.[negativeCoin]?.[0].logo;

        setCoinIcons({
          positiveURL: positiveCoinKey,
          negativeURL: negativeCoinKey,
        });
        setSentiments(data);
      } catch (error) {
        // Handle error if needed
      }
    };

    fetchSentimentInsights();
  }, []);
  const filterout = ["XDATA", "Q2", "ETHER"];

  const getResult = async () => {
    // console.log("ai data", negative, splicedNegativeArray);
    coinSymbol = coinSymbol.filter((coin) => !filterout.includes(coin));
    // console.log("unformatted", coinSymbol);
    let format = new Set(coinSymbol);
    // console.log("formatted coins", [...format]);
    let coinsResponse = await getIcon([...format].join(",").toString());
    // console.log("rare", coinsResponse);
    const result = Object.fromEntries(Object.entries(coinsResponse.data.data).map(([key, value]) => [key, value?.[0].logo]));
    return result;
  };

  const fetchAllCards = async () => {
    Promise.allSettled([history_curated(testRef.current), history_ai(testRef.current)])
      .then(async (results) => {
        const fulfilledResults = results.filter((result) => result.status === "fulfilled").map((result) => result.value);

        const CuratedData = fulfilledResults[0];
        const AiData = fulfilledResults[1];
        const positiveData = [...CuratedData?.data?.positive?.reverse(), ...AiData?.data?.positive];
        const negativeData = [...CuratedData?.data?.negative?.reverse(), ...AiData?.data?.negative];
        pushCoins([...positiveData, ...negativeData]);

        let result = await getResult();
        console.log("results in all", result);
        setIconURL(result);
        setPositiveCards(positiveData.reverse());
        setNegativeCards(negativeData.reverse());
      })
      .catch((error) => {
        console.log("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
    try {
      const data = await history_ai(testRef.current);
      console.log("in history", data.data);
      let positiveData = [...positiveCards, ...data.data.positive];
      let negativeData = [...negativeCards, ...data.data.negative];
      pushCoins([...data.data.positive, ...data.data.negative]);
      let result = await getResult();
      setIconURL(result);
      setPositiveCards(positiveData.reverse());
      setNegativeCards(negativeData.reverse());
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllCards();
  }, []); 
  // fetchAllCards();

  



  //@ts-ignore
  const score = sentiments?.["total average sentiment"]?.[0];
  //@ts-ignore
  const status = sentiments?.["total average sentiment"]?.[1];
  //@ts-ignore
  const scoreResult = 100 * (score);
  //@ts-ignore
  const sliderPercentage = sentiments?.["positive pct"] * 100;
  //@ts-ignore
  const postiveArticlesNum = Math.trunc(sentiments?.["positive pct"] * sentiments["total data points"]);
  //@ts-ignore
  const negativeArticlesNum = Math.trunc(sentiments?.["negative pct"] * sentiments["total data points"]);
  //@ts-ignore
  const postiveArticlesPerc = Math.trunc(sentiments?.["positive pct"] * 100);
  //@ts-ignore
  const negativeArticlesPerc = Math.trunc(sentiments?.["negative pct"] * 100);
  const leftSideSliderText = "of news articles and social media scraped by Auro bots today recorded Positive Sentiment";
  const rightSideSLiderText = "of news articles and social media scraped by Auro bots today recorded Negative Sentiment";
  const optimisticText = "Average Sentiment Score recorded across all news articles and social media today";
  const mostBullishCoinPair= "recorded the highest Positive Sentiment today amongst all digital tokens";
  const mostBearishCoinPair= "recorded the highest Negative Sentiment today amongst all digital tokens";
  const negativeArticlesByAuroDigital= "recorded the highest Negative Sentiment today amongst all Channels";
  const positiveArticlesByAuroDigital= "recorded the highest Positive Sentiment today amongst all Channels";
  //@ts-ignore

  const positiveSentimentValue = sentiments?.["most positive coin sentiment"]?.[0];
  //@ts-ignore
  const negativeSentimentValue = sentiments?.["most negative coin sentiment"]?.[0];
//@ts-ignore
  const channelWiseData = sentiments?.["most positive coin channel wise"]?.split(" ");
  //@ts-ignore

  const positiveURL = coinIcons?.positiveURL;
  //@ts-ignore
  const negativeURL = coinIcons?.negativeURL;

  console.log("positiveCards", positiveCards)


  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex  flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold r md:text-4xl text-center">
          NLP Sentiment Analysis
        </h1>
        <p className=" text-lg text-center text-xl mx-auto">
          Long-Short Debate
        </p>
      </div>
      <div className=" mx-auto">
        <div className="grid grid-cols-3 gap-4 justify-center items-center">
          <div className="text-center flex flex-col items-center">
            <img src="./Bull.svg" alt="Bull" className="mx-auto"  />
            <p className="font-bold mt-2">Bull</p>
          </div>

          <div className="text-center">
            <div className="relative">
              <div className="text-center bg-white shadow-md border border-yellow-500 rounded-md p-2">


                <HoverCard>
                  <HoverCardTrigger asChild>
                    <p className="text-[13px] md:text-[18px] font-bold text-yellow-700">
                      Auro Rating: {status?.[0].toUpperCase() + status?.substring(1)} ({scoreResult > 0 ? "+" + scoreResult.toFixed(2) + "%" : scoreResult.toFixed(2) + "%"})
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-amber-200 text-left">
                    <div className="flex justify-between space-x-4">

                      <div className="space-y-3">
                        <h4 className="text-sm text-left font-semibold">Auro Daily Sentiment Rating for Digital Assets:</h4>
                        <p className="text-sm">
                          100% to +66% = Outperform
                        </p>
                        <p className="text-sm">
                          65% to 25% = Optimistic
                        </p>
                        <p className="text-sm">
                          25% to -25% = Neutral
                        </p>
                        <p className="text-sm">
                          -25% to -65% = Pessimistic
                        </p>
                        <p className="text-sm">
                          -65% to -100% = Underperform
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>

              </div>
            </div>
          </div>
          <div className="text-center flex flex-col items-center">
            <img src="./Bear.svg" alt="Bear" className="mx-auto"  />
            <p className="font-bold mt-2">Bear</p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <div style={{ width: "50%" }}>
            {!isNaN(sliderPercentage) && (
              <div>
                <div className="flex justify-between mb-[1rem] ">
                  <HoverCard>
                    <HoverCardTrigger><span className="text-lime-400 font-bold">{postiveArticlesNum}</span></HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-amber-200 text-left">
                      {`${postiveArticlesPerc + "%" + " " + leftSideSliderText}`}
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger>          <span className="text-red-500 font-bold">{negativeArticlesNum}</span>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-amber-200 text-left">
                      {`${negativeArticlesPerc + "%" + " " + rightSideSLiderText}`}                    </HoverCardContent>
                  </HoverCard>

                </div>
                <Slider defaultValue={[sliderPercentage]} max={100} step={1} disabled className="mt-2" />
                <div className="flex justify-around mt-[1rem]">
                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="flex items-center">
                        <span className="text-lime-400 font-bold">
                          {sentimentRating(sentiments?.["average positive sentiment"]?.[0]?.toFixed(3))}
                        </span>
                        <TypographyPercentageBar value={sentiments?.["average positive sentiment"]?.[0]} />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-amber-200 text-left">
                      {optimisticText}
                      <div className="flex items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          Source: Auro NLP bots
                        </span>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="flex items-center pl-[1rem]">
                        <span className="text-red-500 font-bold">
                          {sentimentRating(sentiments?.["average negative sentiment"]?.[0]?.toFixed(3))}
                        </span>
                        <TypographyPercentageBar positive={false} value={sentiments?.["average negative sentiment"]?.[0]} />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-amber-200 text-left">
                      {optimisticText}
                      <div className="flex items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          Source: Auro NLP bots
                        </span>
                      </div>
                    </HoverCardContent>

                  </HoverCard>


                </div>

              </div>
            )}
          </div>

        </div>
        <div className="flex justify-between">
          <div className="flex space-x-[1rem] items-center">

            <HoverCard>
              <HoverCardTrigger>
                {/* <div className="flex items-center"> */}
                <div className="flex items-center">
                  {sentiments?.["most positive coin channel wise"]?.split(" ")?.[0]}
                  {positiveSentimentValue && channelWiseData && positiveURL && (
                    <Image src={positiveURL} width={25} height={25} />
                  )}

                </div>
                {/* </div> */}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-amber-200 text-left">
                <p>{`${sentiments?.["most positive coin channel wise"]?.split(" ")?.[0] + " " + mostBullishCoinPair}`}</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Source: Auro NLP bots
                  </span>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger>
                {/* <div className="flex items-center"> */}
                <div className="flex items-center">
                  {sentiments && (
                    <SocialIcon
                    network={sentiments?.["most positive coin channel wise"]?.split(" ")?.[1].toLowerCase()}
                    style={{
                      width: "30px",
                      height: "30px", 
                    }}
                  />
                  )}

                </div>
                {/* </div> */}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-amber-200 text-left">
                <p>{`${sentiments?.["most positive coin channel wise"]?.split(" ")?.[1] + " " + positiveArticlesByAuroDigital}`}</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Source: Auro NLP bots
                  </span>
                </div>
              </HoverCardContent>
            </HoverCard>
            <Image src="./up.svg" width={25} height={25} />
            <HoverCard>
              <HoverCardTrigger>
                {/* <div className="flex items-center"> */}
                <div className="flex items-center">
                  <span className="text-lime-400 font-bold">

                    {sentimentRating(sentiments?.["most positive coin sentiment"]?.[0].toFixed(3))}
                  </span>

                  <TypographyPercentageBar value={sentiments?.["most positive coin sentiment"]?.[0]} />

                </div>
                {/* </div> */}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-amber-200 text-left">
                <p>Sentiment score for the most Bullish Crypto Coin today.</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Source: Auro NLP bots
                  </span>
                </div>
              </HoverCardContent>
            </HoverCard>




          </div>
          <div className=" items-center space-x-[1rem] flex justify-end">
          <HoverCard>
              <HoverCardTrigger>
                {/* <div className="flex items-center"> */}
                <div className="flex items-center">
                  <span className="text-red-500 font-bold">

                    {sentimentRating(sentiments?.["most negative coin sentiment"]?.[0].toFixed(3))}
                  </span>

                  <TypographyPercentageBar positive={false} value={sentiments?.["most negative coin sentiment"]?.[0]} />

                </div>
                {/* </div> */}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-amber-200 text-left">
                <p>Sentiment score for the most Bearish Crypto Coin today.</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Source: Auro NLP bots
                  </span>
                </div>
              </HoverCardContent>
            </HoverCard>
          <HoverCard>
              <HoverCardTrigger>
                {/* <div className="flex items-center"> */}
                <div className="flex items-center">
                  {sentiments?.["most negative coin channel wise"]?.split(" ")?.[0]} 
                  {negativeSentimentValue && channelWiseData && negativeURL && (
                    <Image src={negativeURL} width={25} height={25} />
                  )}

                </div>
                {/* </div> */}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-amber-200 text-left">
                <p>{`${sentiments?.["most negative coin channel wise"]?.split(" ")?.[0] + " " + mostBearishCoinPair}`}</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Source: Auro NLP bots
                  </span>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger>
                {/* <div className="flex items-center"> */}
                <div className="flex items-center">
                  {sentiments && (
                    <SocialIcon
                    network={sentiments?.["most negative coin channel wise"]?.split(" ")?.[1].toLowerCase()}
                    style={{
                      width: "30px",
                      height: "30px", 
                    }}
                  />
                  )}

                </div>
                {/* </div> */}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-amber-200 text-left">
                <p>{`${sentiments?.["most negative coin channel wise"]?.split(" ")?.[1] + " " + negativeArticlesByAuroDigital}`}</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Source: Auro NLP bots
                  </span>
                </div>
              </HoverCardContent>
            </HoverCard>
            <Image src="./down.svg" width={25} height={25} />
            

          </div>
        </div>

      </div>
      <div className="flex justify-center w-50% max-w-500px">
  <div className="mr-4">
    {positiveCards.map((sentiment) => (
      <div key={sentiment._id} className="w-full mb-4">
        <NewsCard
          positive={true}
          category={sentiment.Category}
          icons={iconURL}
          title={sentiment.title}
          text={sentiment.text}
          curated={sentiment.curated}
          score={sentiment.weighted_average}
          channel={sentiment.channel}
          coins={sentiment.coins}
          handle={sentiment.handle}
          datetime={sentiment.datetime}
          // onReadMore={onReadMore}
        />
      </div>
    ))}
  </div>
  <div className="ml-4">
    {negativeCards.map((sentiment) => (
      <div key={sentiment._id} className="w-full mb-4">
        <NewsCard
          positive={false}
          category={sentiment.Category}
          icons={iconURL}
          title={sentiment.title}
          text={sentiment.text}
          curated={sentiment.curated}
          score={sentiment.weighted_average}
          channel={sentiment.channel}
          coins={sentiment.coins}
          handle={sentiment.handle}
          datetime={sentiment.datetime}
          // onReadMore={onReadMore}
        />
      </div>
    ))}
  </div>
</div>

    </section>

  )
}
