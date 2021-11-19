const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000
const photostudio = require('./models/photostudio')
const user = require('./models/user')
const photobooth = require('./models/photobooth')
const review = require('./models/review')
const areaLarge = require('./models/areaLarge')
const areaMedium = require('./models/areaMedium')
const areaSmall = require('./models/areaSmall')
const ObjectId = mongoose.Types.ObjectId;

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

mongoose.connect('mongodb://localhost:27017/todaysrecord', function (err) {
  if (err) {
    console.error('mongodb connection error', err)
  }
  console.log('mongodb connected')
})

// Creat (POST)  
app.post('/postReview', (req, res) => {
  const newReview = new review({
    psId: req.body.psId,
    userId: req.body.userId,
    rating: req.body.rating,
    content: req.body.content,
    image: req.body.image
  })

  newReview.save()
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.post('/postUser', (req, res) => {
  const newUser = new user({
    profileImage : req.body.profileImage,
    nickname : req.body.nickname,
    email : req.body.email
  })

  newUser.save()
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// Read (GET)
// req(query 또는 params)는 insomnia에서 보냄
app.get('/getAreaLarge', (req, res) => {
  areaLarge.aggregate()
  .match({})
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getAreaMediumByBelong', (req, res) => {
  areaMedium.aggregate()
  .match({belong : req.query.belong})
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getAreaSmallByBelong', (req, res) => {
  areaSmall.aggregate()
  .match({belong: req.query.belong})
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getPhotoStudioByAreaAndType', (req, res) => {
  photostudio.aggregate()
  .addFields({ isInside: { $in: [req.query.area, "$area"]}})
  .match({ type: req.query.type, isInside : true })
  .project({
    isInside : 0
  })
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getImageReviewByPsId', (req, res) => {
  review.aggregate()
  .addFields({ isNull : { $type: "$image"}})
  .match({ psId: req.query.psId, isNull : "string" })
  .project({
    isNull : 0
  })
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getReviewByPsId', (req, res) => {
  review.aggregate()
  .match({psId: req.query.psId})
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getUserById', (req, res) => {
  user.aggregate()
  .match({ _id: new ObjectId(req.query._id)})
  .then((result) => {
    res.json(result[0]) // User
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getPhotostudioById', (req, res) => {
  photostudio.aggregate()
  .match({_id: new ObjectId(req.query._id)})
  .then((result) => {
    res.json(result[0])
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getReviewByUserId', (req, res) => {
  review.aggregate()
  .match({userId: req.query.userId})
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// photostudio의 interested에 특정 user의 _id가 있는지 확인하는 API
app.get('/checkUserIdInPhotostudioInterested', (req, res) => {
  photostudio.aggregate()
  .addFields({ isInside: { $in: [req.query.userId, "$interested"]}})
  .match({ _id: new ObjectId(req.query._id)})
  .project({
    isInside : 1
  })
  .then((result) => {
    res.json(result[0].isInside) // Boolean 값 리턴
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// 유저의 좌표에서 반경 5km에 속하는 photobooth의 리스트를 받아옴
app.get('/getPhotoboothByLocation', (req, res) => {
  photobooth.find({
    location: {
      $geoWithin: {
        $centerSphere: [[parseFloat(req.query.userLongitude), parseFloat(req.query.userLatitude)], 5 / 6378.1]
        // $centerSphere: [[longitude, latitude], x(km) / 6378.1]
      }
    }
  })
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// Photostudio interested에 특정 userId가 있다면 가져오는 API
app.get('/getPhotostudioListByUserId', (req, res) => {
  photostudio.aggregate()
  .addFields({ isInside: { $in: [req.query.userId, "$interested"]}})
  .match({isInside : true })
  .project({
    isInside : 0
  })
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// 이미 가입된 계정인지 확인하는 API
app.get('/checkIfEmailAlreadySingedUp', (req, res) => {
  user.aggregate()
  .match({email : req.query.email})
  .then((result) => {
    res.json(result) // Array[User]
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// Update
// 전체를 수정하는 PUT
app.put('/putReviewById', (req, res) => {
  review
  .findOneAndUpdate(
    { _id: req.query._id },
    {
      $set:
      {
        rating: req.query.rating,
        content: req.query.content,
        image: req.query.image
      }
    },
    { returnOriginal: false }
  )
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// 부분을 수정하는 PATCH
app.patch('/patchUserNicknameById', (req, res) => {
  user
  .findOneAndUpdate(
    { _id: req.query._id },
    { $set: { nickname: req.query.nickname } },
    { returnOriginal: false }
  )
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.patch('/patchUserProfileImageById', (req, res) => {
  user
  .findOneAndUpdate(
    { _id: req.query._id },
    { $set: { profileImage: req.query.profileImage } },
    { returnOriginal: false }
  )
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// photostudio의 interested에 특정 userId를 추가하는 API
app.patch('/addUserIdInPhotostudioInterested', (req, res)=> {
  photostudio
  .findOneAndUpdate(
    {_id : req.query._id},
    {$addToSet : {interested : req.query.userId}},
    {returnOriginal: false}
  )
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// photostudio의 interested에 특정 userId를 빼는 API
app.patch('/pullUserIdInPhotostudioInterested', (req, res)=> {
  photostudio
  .findOneAndUpdate(
    {_id : req.query._id},
    {$pull : {interested : req.query.userId}},
    {returnOriginal: false}
  )
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// Delete (DELETE)
app.delete('/deleteReviewById', (req, res) => {
  review
  .findByIdAndRemove(req.query._id)
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})