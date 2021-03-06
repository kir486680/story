
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

// Stories Index
router.get('/', (req, res) => {
  Story.find({status:'public'})
    .populate('user')
    .sort({date:'desc'})
    .then(stories => {
      res.render('stories/index', {
        stories: stories
      });
    });
});

// Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .populate('user')
  .populate('comments.commentUser')
  .then(story => {
    if(story.status == 'public'){
      res.render('stories/show', {
        story:story
      });
    } else {
      if(req.user){
        if(req.user.id == story.user._id){
          res.render('stories/show', {
            story:story
          });
        } else {
          res.redirect('/stories');
        }
      } else {
        res.redirect('/stories');
      }
    }
  });
});

//List stories from a user 
router.get('/user/:userId' , (req , res)=>{
  Story.find({user:req.params.userId })
  .populate('user')
  .then(stories=>{
    res.render('stories/index' , {
      stories:stories
    })
  })
})

////////////////User routes

//User profile
router.get('/profile/:userId' , (req, res )=>{
  var id = req.params.userId
  User.findOne({
    _id: id
  })
  .then(users => {
      res.render('user/profile', {
        users:users
      });
  });
})

router.get('/about/:userId' ,(req,res)=>{
  var id = req.params.userId
  User.findOne({
    _id: id
  })
  .then(users=>{
    res.render('user/about')
  })
})




//////////////////////////////
//Loged in user stories 
router.get('/my' ,ensureAuthenticated ,  (req , res)=>{
  Story.find({user:req.user.id })
  .populate('user')
  .then(stories=>{
    res.render('stories/index' , {
      stories:stories

    })
 
  })
})


// Add Story Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

// Edit Story Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    if(story.user != req.user.id){
      res.redirect('/stories');
    } else {
      res.render('stories/edit', {
        story: story
      });
    }
  });
});
// Process Add Story
router.post('/', (req, res) => {
  let allowComments;

  if(req.body.allowComments){
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    category: req.body.category,
    title: req.body.title,
    link: req.body.link,
    body: req.body.body,
    status: req.body.status,
    allowComments:allowComments,
    user: req.user.id
  }


  // Create Story
  new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
});

//Edit form proces 

router.put('/:id' , (req, res)=>{
  Story.findOne({
    _id: req.params.id
  })
  .populate('user')
  .then(story => { 
    let allowComments;

  if(req.body.allowComments){
    allowComments = true;
  } else {
    allowComments = false;
  }

  //New val
  story.category=  req.body.category,
  story.title =  req.body.title,
  story.link = req.body.link,
  story.body = req.body.body,
  story.status = req.body.status,
  story. allowComments=allowComments

  story.save()
  .then(story=>{
    res.redirect('/dashboard');
  });
  });
})

router.delete('/:id' , (req,res)=>{
  Story.remove({_id: req.params.id})
  .then(()=>{
    res.redirect('/dashboard');
  });
});

// Add Comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    }

    // Add to comments array
    story.comments.unshift(newComment);

    story.save()
      .then(story => {
        res.redirect(`/stories/show/${story.id}`);
      });
  });
});

//Categories 

//Web Cat
router.get('/web'  ,(req,res)=>{

  Story.find({"category": "web" })
  .populate('user')
  .then(stories=>{
    res.render('stories/web' , {
      stories:stories
    })
  })
});
//Desktop cat
router.get('/desktop'  ,(req,res)=>{

  Story.find({"category": "desktop" })
  .populate('user')
  .then(stories=>{
    res.render('stories/desktop' , {
      stories:stories
    })
  })
});
//Other cat
router.get('/other'  ,(req,res)=>{

  Story.find({"category": "other" })
  .populate('user')
  .then(stories=>{
    res.render('stories/other' , {
      stories:stories
    })
  })
});




module.exports = router;