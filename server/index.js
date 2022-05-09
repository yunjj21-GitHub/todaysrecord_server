const express = require('express')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
const app = express()
const port = 80

const ObjectId = mongoose.Types.ObjectId
const photostudio = require('./models/photostudio')
const user = require('./models/user')
const photobooth = require('./models/photobooth')
const review = require('./models/review')
const areaLarge = require('./models/areaLarge')
const areaMedium = require('./models/areaMedium')
const areaSmall = require('./models/areaSmall')
const reviewReport = require('./models/reviewReport')

// 미들웨어 추가
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(fileUpload({ // 파일 업로드 허용
  createParentPath : true
}))
// 업로드한 리뷰 이미지 어디서든 접근 허용
app.use(express.static('reviewImages'))

// 몽고 DB 연결
mongoose.connect('mongodb://localhost:27017/todaysrecord', function (err) {
  if (err) {
    console.error('mongodb connection error', err)
  }
  else console.log('mongodb connected')
})

// 이미지 리뷰 업로드 (단일 파일 업로드)
app.post('/reviewImageUpload', (req, res)=>{
  let newReviewImage = req.files.reviewImage // 요청한 객체를 변수에 담는다.
  newReviewImage.mv('./reviewImages/' + newReviewImage.name) // 파일을 reviewImages 폴더에 이동시킨다.

  // 업로드 되었다는 응답값을 반환
  res.send(newReviewImage.name)
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
    email : req.body.email,
    password : req.body.pwd
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

app.post('/postReviewReport', (req, res) => {
  const newReviewReport = new reviewReport({
    reviewId : req.body.reviewId,
    accuser : req.body.accuser,
    reportType : req.body.reportType
  })

  newReviewReport.save()
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

// 기본순
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

// 가격순
app.get('/getPsListOfUserAreaInCostOrder', (req, res) => {
  photostudio.aggregate()
  .addFields({ isInside: { $in: [req.query.area, "$area"]}})
  .match({ type: req.query.type, isInside : true })
  .project({
    isInside : 0
  })
  .sort({cost : 1}) // 오름차순
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

// 인기순
app.get('/getPsListOfUserAreaInPopularityOrder', (req, res) => {
  photostudio.aggregate()
  .addFields({ isInside: { $in: [req.query.area, "$area"]},
               interestedNum : { $size: "$interested"}})
  .match({ type: req.query.type, isInside : true })
  .sort({interestedNum : -1}) // 내림차순
  .project({
    isInside : 0,
    interestedNum : 0
  })
  .then((result) => {
    res.json(result)
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/getPSListBySearchWord', (req, res) => {
  photostudio.aggregate()
  .match({ name : { $regex : req.query.searchWord }})
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
    res.json(result[0])
  })
  .catch((error) => {
    res.json(error)
    console.log(error)
  })
})

app.get('/emailLogin', (req, res)=>{
  user.aggregate()
  .match({email : req.query.id, password : req.query.pwd})
  .then((result) => {
    res.json(result[0])
  })
  .catch((error)=>{
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
app.patch('/patchUserById', (req, res) => {
  user
  .findOneAndUpdate(
    { _id: req.query._id },
    { $set: { nickname: req.query.nickname,
            profileImage : req.query.profileImg} },
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
  console.log(`Example app listening at http://13.209.25.227:${port}`)
})