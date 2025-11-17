const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./models/Plan');

const plans = [
  { name:"Meme Coin", image:"./images/memecoin.jfif", totalInvestment:1000, dailyAds:1, dailyProfit:70, totalProfit:4550, durationDays:65 },
  { name:"Bitcoin Cash", image:"./images/bitcoincash.jfif", totalInvestment:2000, dailyAds:2, dailyProfit:133, totalProfit:8645, durationDays:65 },
  { name:"Chain Link", image:"./images/bitcoin.jfif", totalInvestment:2900, dailyAds:2, dailyProfit:145, totalProfit:9425, durationDays:65 },
  { name:"Ton Coin", image:"./images/toncoin.jfif", totalInvestment:4350, dailyAds:3, dailyProfit:290, totalProfit:18850, durationDays:65 },
  { name:"Bitcoin", image:"./images/bitcoin.jfif", totalInvestment:6380, dailyAds:4, dailyProfit:380, totalProfit:33930, durationDays:65 },
  { name:"Ethereum", image:"./images/Ethereum.jfif", totalInvestment:14500, dailyAds:6, dailyProfit:1015, totalProfit:66120, durationDays:65 },
  { name:"Tether (US)", image:"/images/Tether.net", totalInvestment:29000, dailyAds:10, dailyProfit:1812.5, totalProfit:117812.5, durationDays:65 },
{ name:"BNB", image:"/images/BNB.jfif", totalInvestment:58000, dailyAds:15, dailyProfit:3625, totalProfit:235625, durationDays:65 },
{ name:"Solana (SOL)", image:"/images/Solana.jfif", totalInvestment:87000, dailyAds:20, dailyProfit:5437.5, totalProfit:353437.5, durationDays:65 },
{ name:"USD Coin", image:"/images/USDCoin.jfif", totalInvestment:116000, dailyAds:25, dailyProfit:7250, totalProfit:471250, durationDays:65 },
{ name:"Dogecoin", image:"/images/Dogecoin.jfif", totalInvestment:145000, dailyAds:30, dailyProfit:9062.5, totalProfit:589062.5, durationDays:65 },
{ name:"TRON (TRX)", image:"/images/TRON.jfif", totalInvestment:290000, dailyAds:40, dailyProfit:18125, totalProfit:1178125, durationDays:65 },
{ name:"Cardano (ADA)", image:"/images/Cardano (ADA).jfif", totalInvestment:435000, dailyAds:50, dailyProfit:27187.5, totalProfit:1767187.5, durationDays:65 },
{ name:"Polkadot (DOT)", image:"/images/Polkadot (DOT).jfif", totalInvestment:580000, dailyAds:60, dailyProfit:36250, totalProfit:2356250, durationDays:65 },
{ name:"Litecoin (LTC)", image:"/images/Litecoin (LTC).jfif", totalInvestment:725000, dailyAds:70, dailyProfit:45312.5, totalProfit:2945312.5, durationDays:65 },
{ name:"Stellen (XLM)", image:"/images/Stellen(XLM).png", totalInvestment:870000, dailyAds:80, dailyProfit:54375, totalProfit:3534375, durationDays:65 }
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
