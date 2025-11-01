const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const TaskHistory = require('../models/TaskHistory');

// ===== Get today's videos =====
router.get('/today', auth, async (req,res)=>{
    try{
        const user = await User.findById(req.userId).populate('activePlan');
        if(!user || !user.activePlan) return res.status(404).json({message:'User or plan not found'});

        const today = new Date(); today.setHours(0,0,0,0);
        const planVideos = user.activePlan.videos.map(v=>({ videoId:v.videoId, link:v.link, duration:v.duration || 10 }));

        let task = await TaskHistory.findOne({userId:user._id, date:today});
        if(!task){
            const videos = planVideos.map(v=>({ ...v, watched:false, watchTime:0 }));
            task = await TaskHistory.create({ userId:user._id, planId:user.activePlan._id, date:today, videos });
        } else {
            // Sync plan updates
            planVideos.forEach(pv=>{
                if(!task.videos.find(tv=>tv.videoId===pv.videoId)) task.videos.push({ ...pv, watched:false, watchTime:0 });
            });
            task.videos = task.videos.filter(tv=>planVideos.find(pv=>pv.videoId===tv.videoId)); // remove deleted videos
            await task.save();
        }

        res.json({ 
            videos: task.videos, 
            userTask:{
                completed: task.completed,
                collected: task.collected,
                completedVideos: task.videos.filter(v=>v.watched).map(v=>v.videoId)
            }
        });
    } catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// ===== Mark video watched =====
router.post('/mark', auth, async (req,res)=>{
    try{
        const {videoId} = req.body;
        const user = await User.findById(req.userId);
        const today = new Date(); today.setHours(0,0,0,0);
        const task = await TaskHistory.findOne({userId:user._id, date:today});
        if(!task) return res.status(400).json({message:'Task not found'});

        const video = task.videos.find(v=>v.videoId===videoId);
        if(video && !video.watched) video.watched=true;
        task.completed = task.videos.every(v=>v.watched);
        await task.save();

        res.json({success:true, completed:task.completed});
    } catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// ===== Collect profit =====
router.post('/collect', auth, async (req,res)=>{
    try{
        const user = await User.findById(req.userId).populate('activePlan');
        const today = new Date(); today.setHours(0,0,0,0);
        const task = await TaskHistory.findOne({userId:user._id, date:today});
        if(!task || !task.completed) return res.status(400).json({message:'All videos not watched'});
        if(task.collected) return res.status(400).json({message:'Profit already collected'});

        user.wallet += user.activePlan.dailyProfit;
        await user.save();

        task.collected=true;
        await task.save();
        res.json({success:true, added:user.activePlan.dailyProfit});
    } catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

module.exports = router;
