const express = require('express');
const { ObjectId } = require('mongodb');

const db = require('../data/database');

const router = express.Router();

router.get('/', function(req, res) {

  res.redirect('/posts');

});

router.get('/posts', async function(req, res) {

  const posts = await db.getDb().collection('posts').find({}, {title: 1, summary: 1, 'author.name': 1}).toArray();

  res.render('posts-list', { posts: posts});

});

router.get('/new-post', async function(req, res) {

  const authors = await db.getDb().collection('authors').find().toArray();

  res.render('create-post', { authors: authors });
});  

router.post('/posts', async ( req, res) => {

  const { title, summary, content, author: authorId} = req.body; //destructuring the object and pulls the 'name' attribute's data inside the form

  const author = await db.getDb().collection('authors').findOne({ _id: new ObjectId(`${authorId}`) }); //this returns the matched authorId's data

  const postData = {
    title: title,
    summary: summary,
    body: content,
    date: new Date(),
    author: {
      _id: new ObjectId(`${authorId}`),
      name: author.name,
      email: author.email
    }
  };

  await db.getDb().collection('posts').insertOne(postData); //before we redirect, we should wait for the whole data to be inserted to the database

  res.redirect('/posts');

});

router.get('/posts/:id', async (req, res, next) => {
  try {
    // Attempt to convert req.params.id to ObjectId and find the post in the database
    var postData = await db.getDb().collection('posts').findOne({ _id: new ObjectId(`${req.params.id}`) }, { projection: { summary: 0 } });

    // If postData is null (no post found), handle it
    if (!postData) {
      return res.status(404).render('404'); // Render 404 page if the post is not found
    }

    // Process the post data
    const post = {
      ...postData,
      humanReadableDate: postData.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      date: postData.date.toISOString(), // Convert date to ISO string
    };

    // Render the post-detail page with the post data
    res.render('post-detail', { post: post });

  } catch (e) {
    // If there is an error (e.g., invalid ObjectId), handle it
    return res.status(404).render('404');
    // return next(e); // Uncomment if you want to proceed to the next error handling middleware
  }
});

router.get('/posts/:id/edit', async (req, res) => {

  const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(`${req.params.id}`) });
  
  res.render('update-post', { post: post });

});

router.post('/posts/:id/edit', async (req, res) => {

  const {title, summary, content} = req.body;

  const contentData = {
    title: title,
    summary: summary,
    body: content,
    date: new Date(),
  }
  
  await db.getDb().collection('posts').updateOne({ _id: new ObjectId( `${ req.params.id }` )}, { $set: contentData }) //content data contains the data we will set
  
  res.redirect('/posts');

});

router.post('/posts/:id/delete', async (req, res) => {

  await db.getDb().collection('posts').deleteOne({ _id: new ObjectId( `${ req.params.id }` ) });

  res.redirect('/posts');

});

module.exports = router;