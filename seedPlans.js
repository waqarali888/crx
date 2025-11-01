const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./models/Plan');

const plans = [
  { name:"Chain Link", image:"/images/chainlink.jfif", totalInvestment:10, dailyAds:2, dailyProfit:0.5, totalProfit:32.5, durationDays:65 },
  { name:"Ton Coin", image:"/images/toncoin.jfif", totalInvestment:15, dailyAds:3, dailyProfit:1, totalProfit:65, durationDays:65 },
   { name:"Bitcoin", image:"/images/bitcoin.jfif", totalInvestment:22, dailyAds:4, dailyProfit:1.8, totalProfit:117, durationDays:65 },
  { name:"Ethereum", image:"/images/Ethereum.jfif", totalInvestment:50, dailyAds:6, dailyProfit:3.5, totalProfit:227.5, durationDays:65 },
  { name:"Tether (US)", image:"/images/Tether.net", totalInvestment:100, dailyAds:10, dailyProfit:6.25, totalProfit:406.25, durationDays:65 },
  { name:"BNB", image:"/images/BNB.jfif", totalInvestment:200, dailyAds:15, dailyProfit:12.5, totalProfit:812.5, durationDays:65 },
  { name:"Solana (SOL)", image:"/images/Solana.jfif", totalInvestment:300, dailyAds:20, dailyProfit:18.75, totalProfit:1218.75, durationDays:65 },
  { name:"USD Coin", image:"/images/USDCoin.jfif", totalInvestment:400, dailyAds:25, dailyProfit:25, totalProfit:1625, durationDays:65 },
  { name:"Dogecoin", image:"/images/Dogecoin.jfif", totalInvestment:500, dailyAds:30, dailyProfit:31.25, totalProfit:2031.25, durationDays:65 },
  { name:"TRON (TRX)", image:"/images/TRON.jfif", totalInvestment:1000, dailyAds:40, dailyProfit:62.5, totalProfit:4062.5, durationDays:65 },
  { name:"Cardano (ADA)", image:"/images/Cardano (ADA).jfif", totalInvestment:1500, dailyAds:50, dailyProfit:93.75, totalProfit:6093.75, durationDays:65 },
  { name:"Polkadot (DOT)", image:"/images/Polkadot (DOT).jfif", totalInvestment:2000, dailyAds:60, dailyProfit:125, totalProfit:8125, durationDays:65 },
  { name:"Litecoin (LTC)", image:"/images/Litecoin (LTC).jfif", totalInvestment:2500, dailyAds:70, dailyProfit:156.25, totalProfit:10156.25, durationDays:65 },
  { name:"Stellen (XLM)", image:"/images/Stellen(XLM).png", totalInvestment:3000, dailyAds:80, dailyProfit:187.5, totalProfit:12187.5, durationDays:65 }
];

mongoose.connect(process.env.MONGO_URI)
.then(async ()=>{
  console.log('MongoDB connected');
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log('Plans seeded successfully');
  process.exit(0);
})
.catch(err=>console.log(err));
